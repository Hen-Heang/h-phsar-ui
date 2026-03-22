const fs = require('fs');
const path = require('path');

const dirsToProcess = [
  'src/components/Distributor',
  'src/pages/distributor',
  'src/app/distributor'
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (stat.isFile() && /\.(jsx?|tsx?)$/.test(fullPath)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Replace teal with blue
      content = content.replace(/teal-500/g, 'blue-600');
      content = content.replace(/teal-600/g, 'blue-600');
      content = content.replace(/teal-700/g, 'blue-700');
      content = content.replace(/teal-400/g, 'blue-500');
      content = content.replace(/teal-300/g, 'blue-400');
      content = content.replace(/teal-200/g, 'blue-200');
      content = content.replace(/teal-100/g, 'blue-100');
      content = content.replace(/teal-50/g, 'blue-50');

      // Remove dark mode classes
      content = content.replace(/\bdark:[a-zA-Z0-9-\/\[\]]+\s?/g, '');
      
      // Some leftover spaces might exist
      content = content.replace(/\s+/g, ' ').replace(/ \}/g, '}').replace(/ \)/g, ')').replace(/ >/g, '>');
      // Actually, flattening spaces might break formatting. Let's do a safer space cleanup:
      content = content.replace(/className="(.*?)"/g, (match, p1) => {
          return `className="${p1.replace(/\s+/g, ' ').trim()}"`;
      });
      content = content.replace(/className=\{(.*?)\}/g, (match, p1) => {
          // If it's a string literal or template literal, we could try to clean it, but it's tricky.
          // For template literals, let's just do a simple replace on the string.
          return `className={${p1.replace(/ dark:[a-zA-Z0-9-\/\[\]]+/g, '')}}`;
      });

      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}

dirsToProcess.forEach(processDirectory);
console.log('Done replacing colors and removing dark mode classes.');
