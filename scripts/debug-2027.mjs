import { readFile } from 'node:fs/promises';

const fullContent = await readFile('C:/Users/hp/.gemini/antigravity-ide/brain/98343bb9-fe78-440c-afef-6a021afe95c9/.system_generated/steps/270/content.md', 'utf8');

let idx = fullContent.indexOf('Elche', 65000);
console.log('Third index of Elche:', idx);
if (idx !== -1) {
  console.log(fullContent.slice(idx - 200, idx + 1000));
}
