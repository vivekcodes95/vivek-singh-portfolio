import { readFile, readdir, access } from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve('dist');
let count=0;
async function walk(dir){for(const item of await readdir(dir,{withFileTypes:true})){const file=path.join(dir,item.name);if(item.isDirectory()){await walk(file);continue;}if(!file.endsWith('.html'))continue;count++;const html=await readFile(file,'utf8');const standaloneProject=path.relative(root,file).startsWith(`duowallet${path.sep}`);if(!standaloneProject&&(!html.includes('<h1')||!html.includes('aria-label="Main navigation"')))throw Error(`Missing page structure: ${file}`);for(const [,url] of html.matchAll(/(?:href|src)="(\/[^"#]*)"/g)){let target=path.join(root,url);if(url.endsWith('/'))target=path.join(target,'index.html');await access(target);}}}
await walk(root);
const duoRedirect=await readFile(path.join(root,'duowallet/index.html'),'utf8');
if(!duoRedirect.includes('https://duoawallet.vivekdesigns.com/'))throw Error('Missing Duo Wallet redirect');
console.log(`Validated ${count} pages and every local asset/navigation reference.`);
