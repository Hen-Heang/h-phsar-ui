import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

class ValidationError extends Error {}
process.on('uncaughtException', error => {
  console.error(`preflight: ${error.message}`);
  process.exit(error instanceof ValidationError ? 1 : 2);
});

const argv = process.argv.slice(2);
const args = {};
for (let index = 0; index < argv.length; index += 2) {
  const key = argv[index];
  if (!key?.startsWith('--') || argv[index + 1] === undefined) {
    throw new ValidationError('arguments must use --kebab-case value pairs');
  }
  args[key.slice(2)] = argv[index + 1];
}
const claudeRoot = path.resolve(args['claude-root'] ?? '.claude');
const missing = [];
// 어떤 스킬이 있어야 하는지는 계약이 정한다. 이름을 여기 박아 두면 두 방향으로 틀린다:
// workflow.json 에서 스텝 스킬을 갈아끼운 순간 없는 옛 스킬을 요구해 런이 시작조차 못 하고,
// 새로 추가된 스텝은 이 검사에서 빠진다 — `prepare` 스텝이 실제로 그렇게 빠져 있었다.
// 계약이 없거나 깨졌으면 exit 2 다(설치 오류): 무엇을 요구할지 모르는 상태로 통과시키면 안 된다.
const workflowFile = fileURLToPath(new URL('../references/autopilot-workflow.json', import.meta.url));
let workflow;
try {
  workflow = JSON.parse(fs.readFileSync(workflowFile, 'utf8').replace(/^﻿/, ''));
} catch (error) {
  throw new Error(`workflow contract unreadable: ${workflowFile} (${error.message})`);
}
if (!Array.isArray(workflow.steps) || !workflow.steps.length) {
  throw new Error(`workflow contract declares no steps: ${workflowFile}`);
}
// 계약 밖 필수 둘: 커밋은 `/git` 이, 계획 라우팅 manifest 는 `plan-loader` 가 소유한다 —
// 어느 것도 워크플로 스텝이 아니라서 계약에 등장하지 않는다.
for (const name of [...new Set([...workflow.steps.map(step => step.skill), 'git', 'plan-loader'])]) {
  if (!name) throw new Error(`workflow contract has a step without a skill: ${workflowFile}`);
  if (!fs.existsSync(path.join(claudeRoot, 'skills', name, 'SKILL.md'))) missing.push(`skill:${name}`);
}
for (const command of ['git', 'node']) {
  if (spawnSync(command, ['--version'], { stdio: 'ignore' }).error) missing.push(`command:${command}`);
}
// \uBC30\uB2EC(push\u00B7MR)\uC740 \uD750\uB984\uC758 \uD544\uC218 \uAD6C\uAC04\uC774\uB77C \uC5EC\uAE30\uC11C \uBA3C\uC800 \uB9C9\uB294\uB2E4. \uD3EC\uC9C0 \uC124\uC815\uC774 \uC5C6\uB294 \uAC78 MR \uB2E8\uACC4\uC5D0\uC11C\uC57C
// \uC54C\uBA74 \uBE0C\uB9AC\uD504\u00B7\uACC4\uD68D\u00B7\uAD6C\uD604\u00B7QA\u00B7\uB9AC\uBDF0\uB97C \uB2E4 \uB3CC\uB9B0 \uB4A4\uC5D0 \uCC28\uB2E8\uB418\uBBC0\uB85C, \uBA87 \uC2DC\uAC04\uC744 \uBC84\uB9AC\uACE0 \uB098\uC11C "\uC124\uC815\uC774
// \uC5C6\uC5C8\uB2E4" \uB97C \uC54C\uAC8C \uB41C\uB2E4. \uCC29\uC218 \uC804\uC5D0 \uD655\uC778\uD558\uB294 \uD3B8\uC774 \uC2F8\uB2E4.
//
// system.yaml \uC740 mr-reviewer \uAC00 \uC4F0\uB294 \uAC83\uACFC \uAC19\uC740 \uD30C\uC77C\uC774\uB2E4 \u2014 \uD3EC\uC9C0 \uC811\uC18D \uC815\uBCF4\uB294 \uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4\uC5D0
// \uD55C \uACF3\uB9CC \uB454\uB2E4. \uC5EC\uAE30\uC11C\uB294 YAML \uD30C\uC11C \uC5C6\uC774 "\uC124\uC815\uB410\uB294\uAC00" \uB9CC \uC595\uAC8C \uBCF8\uB2E4. \uAC12\uC758 \uC815\uD655\uC131\uC740 \uC2E4\uC81C \uD638\uCD9C\uC774
// \uD310\uC815\uD560 \uBAAB\uC774\uACE0, \uD30C\uC11C\uB97C \uB4E4\uC774\uBA74 \uC774 \uC2A4\uD06C\uB9BD\uD2B8\uAC00 \uC758\uC874\uC131\uC744 \uAC16\uAC8C \uB41C\uB2E4.
// \uD1A0\uD070\uC740 \uC5B4\uB5A4 \uACBD\uC6B0\uC5D0\uB3C4 \uCD9C\uB825\uD558\uC9C0 \uC54A\uB294\uB2E4 \u2014 \uC124\uC815 \uC5EC\uBD80\uB9CC \uC54C\uB9B0\uB2E4.
const systemPath = path.resolve(args['system-config'] ?? path.join(claudeRoot, 'config', 'system.yaml'));
let forgeUrl = null;
let tokenSet = false;
if (fs.existsSync(systemPath)) {
  const raw = fs.readFileSync(systemPath, 'utf8').replace(/^\uFEFF/, '');
  const url = raw.match(/^\s{2}url:\s*(\S+)/m)?.[1];
  const token = raw.match(/^\s{2}token:\s*(\S+)/m)?.[1];
  // \uC608\uC2DC \uD30C\uC77C\uC774 \uADF8\uB300\uB85C \uBCF5\uC0AC\uB41C \uACBD\uC6B0\uB97C \uC124\uC815\uB428\uC73C\uB85C \uC624\uC778\uD558\uC9C0 \uC54A\uB294\uB2E4.
  if (url && !/<.*>/.test(url)) forgeUrl = url;
  if (token && !/REPLACE_ME|<.*>/.test(token)) tokenSet = true;
}
if (!forgeUrl) missing.push(`forge:gitlab.url (${systemPath})`);
if (!tokenSet) missing.push(`forge:gitlab.token (${systemPath})`);

if (missing.length) throw new ValidationError(`preflight failed: ${missing.join(', ')}`);
console.log(JSON.stringify({
  status: 'ok',
  forgeUrl,
  forgeTokenConfigured: tokenSet,
  checkedAt: new Date().toISOString()
}));
