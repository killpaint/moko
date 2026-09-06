// Build a fully offline single-file edition using Node.js built-ins only.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
let html=await fs.readFile(path.join(root,'index.html'),'utf8');
const css=await fs.readFile(path.join(root,'style.css'),'utf8');
html=html.replace('<link rel="stylesheet" href="style.css">',()=>`<style>\n${css}\n</style>`);
for(const name of ['core.js','renderer.js','app.js']){
 const js=(await fs.readFile(path.join(root,name),'utf8')).replaceAll('</script','<\\/script');
 html=html.replace(`<script src="${name}"></script>`,()=>`<script>\n${js}\n</script>`);
}
const output=path.join(root,'moko-standalone.html');
await fs.writeFile(output,html);
console.log(`已生成 ${output} (${Buffer.byteLength(html)} bytes)`);
