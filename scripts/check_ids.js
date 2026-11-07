import fs from 'node:fs';

const cats = ['biology', 'chemistry', 'physics', 'history', 'geography', 'literature', 'russian', 'math_logic'];
for (const c of cats) {
  const content = fs.readFileSync(`data/categories/${c}.js`, 'utf8');
  const ids = content.match(/id:\s*"([^"]+)"/g) || [];
  console.log(`${c} count: ${ids.length}, last: ${ids[ids.length - 1]}`);
}
