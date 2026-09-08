import { readFile } from 'node:fs/promises';

const content = await readFile('C:/Users/hp/.gemini/antigravity-ide/brain/98343bb9-fe78-440c-afef-6a021afe95c9/.system_generated/steps/224/content.md', 'utf8');

// Find all occurrences of Real Madrid in football boxes
let idx = 0;
while (true) {
  idx = content.indexOf('Real Madrid', idx);
  if (idx === -1) break;
  // Look backwards for Football box
  const before = content.slice(Math.max(0, idx - 1000), idx + 200);
  if (before.includes('Football box')) {
    console.log('--- Found Real Madrid match: ---');
    console.log(content.slice(Math.max(0, idx - 300), idx + 300));
  }
  idx += 11;
}
