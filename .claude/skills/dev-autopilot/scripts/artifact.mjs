import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

class ValidationError extends Error {}
process.on('uncaughtException', error => {
  console.error(`artifact: ${error.message}`);
  process.exit(error instanceof ValidationError ? 1 : 2);
});

const [command, ...rest] = process.argv.slice(2);
const args = {};
for (let index = 0; index < rest.length; index += 2) {
  const key = rest[index];
  if (!key?.startsWith('--') || rest[index + 1] === undefined) {
    throw new ValidationError('arguments must use --kebab-case value pairs');
  }
  args[key.slice(2)] = rest[index + 1];
}
if (!command || !args['run-root']) {
  throw new ValidationError('usage: artifact.mjs <command> --run-root <path>');
}

const root = path.resolve(args['run-root']);
fs.mkdirSync(root, { recursive: true });
const canonicalRoot = fs.realpathSync(root);
const registryFile = path.join(canonicalRoot, 'artifacts.json');
const lockFile = path.join(canonicalRoot, '.artifacts.lock');
const insideRoot = candidate => candidate === canonicalRoot || candidate.startsWith(`${canonicalRoot}${path.sep}`);
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const read = () => JSON.parse(fs.readFileSync(registryFile, 'utf8').replace(/^\uFEFF/, ''));
const save = registry => {
  const temporary = `${registryFile}.tmp-${process.pid}`;
  fs.writeFileSync(temporary, JSON.stringify(registry, null, 2));
  fs.renameSync(temporary, registryFile);
};
const safeDestination = relative => {
  if (!relative || path.isAbsolute(relative)) throw new ValidationError('--destination must be relative to the run root');
  const destination = path.resolve(canonicalRoot, relative);
  if (!insideRoot(destination)) throw new ValidationError('destination escapes run root');
  let existing = path.dirname(destination);
  while (!fs.existsSync(existing)) {
    const parent = path.dirname(existing);
    if (parent === existing) throw new ValidationError('cannot resolve destination parent');
    existing = parent;
  }
  if (!insideRoot(fs.realpathSync(existing))) throw new ValidationError('destination parent symlink escapes run root');
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  if (!insideRoot(fs.realpathSync(path.dirname(destination)))) {
    throw new ValidationError('destination parent escapes run root');
  }
  if (fs.existsSync(destination) && fs.lstatSync(destination).isSymbolicLink()) {
    throw new ValidationError('destination must not be a symbolic link');
  }
  return destination;
};

if (command === 'unlock') {
  if (!fs.existsSync(lockFile)) throw new ValidationError(`artifact lock does not exist: ${lockFile}`);
  let record;
  try {
    record = JSON.parse(fs.readFileSync(lockFile, 'utf8'));
  } catch {
    throw new ValidationError('artifact lock is unreadable; do not remove it automatically');
  }
  if (!Number.isInteger(record.pid)) throw new ValidationError('artifact lock has no valid pid');
  if (args['expected-pid'] && Number(args['expected-pid']) !== record.pid) {
    throw new ValidationError(`artifact lock pid differs: ${record.pid}`);
  }
  try {
    process.kill(record.pid, 0);
    throw new ValidationError(`artifact lock owner is still alive: ${record.pid}`);
  } catch (error) {
    if (error instanceof ValidationError) throw error;
    if (error.code !== 'ESRCH') throw new ValidationError(`cannot verify artifact lock owner: ${error.message}`);
  }
  fs.rmSync(lockFile);
  console.log(JSON.stringify({ status: 'unlocked', pid: record.pid }));
  process.exit(0);
}

let lock;
try {
  try {
    lock = fs.openSync(lockFile, 'wx');
    fs.writeFileSync(lock, JSON.stringify({ pid: process.pid, createdAt: new Date().toISOString() }));
  } catch (error) {
    if (error.code === 'EEXIST') throw new ValidationError(`artifact lock exists: ${lockFile}`);
    throw error;
  }
  if (command === 'init') {
    if (fs.existsSync(registryFile)) throw new ValidationError('artifact registry already exists');
    save({ schemaVersion: 1, artifacts: {} });
  } else {
    if (!fs.existsSync(registryFile)) throw new ValidationError('artifact registry is not initialized');
    const registry = read();
    if (command === 'list') {
      console.log(JSON.stringify(registry, null, 2));
    } else if (command === 'register') {
      for (const key of ['id', 'source', 'destination']) {
        if (!args[key]) throw new ValidationError(`--${key} is required`);
      }
      if (registry.artifacts[args.id]) throw new ValidationError(`artifact already registered: ${args.id}`);
      const source = path.resolve(args.source);
      if (!fs.existsSync(source) || !fs.statSync(source).isFile()) {
        throw new ValidationError(`source is not a file: ${source}`);
      }
      const destination = safeDestination(args.destination);
      fs.copyFileSync(fs.realpathSync(source), destination, fs.constants.COPYFILE_EXCL);
      const item = {
        taskNumber: args.task ?? null,
        stage: args.stage ?? null,
        kind: args.kind ?? null,
        title: args.title ?? args.id,
        format: args.format ?? 'text',
        snapshotPath: path.relative(canonicalRoot, destination).split(path.sep).join('/'),
        sha256: hash(destination),
        createdAt: new Date().toISOString(),
        status: args.status ?? 'VALID'
      };
      registry.artifacts[args.id] = item;
      save(registry);
      console.log(JSON.stringify(item, null, 2));
    } else {
      throw new ValidationError(`unknown command: ${command}`);
    }
  }
} finally {
  if (lock !== undefined) {
    fs.closeSync(lock);
    fs.rmSync(lockFile, { force: true });
  }
}
