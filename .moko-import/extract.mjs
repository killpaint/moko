import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { brotliDecompressSync } from 'node:zlib';
const hash = value => createHash('sha256').update(value).digest('hex');
const dir = '.moko-import';
const manifest = JSON.parse(fs.readFileSync(`${dir}/manifest.json`, 'utf8'));
const expected = 'ae951bd3ed3120e84e1e996ad729f21b532f65d2bf5feeaaf90c30ea33b050d8';
const allowed = ['index.html','style.css','core.js','renderer.js','app.js','build.mjs','server.mjs','README.md','ARCHITECTURE.md','LICENSE','TEST-REPORT.md','test-results.json','山野-示例.moko','.gitignore'];
if (manifest.sha256 !== expected || manifest.parts.length !== 11) throw new Error('Unexpected source manifest');
const buffers = manifest.parts.map((part, i) => {
  if (part.path !== `source-${String(i).padStart(2, '0')}.brpart`) throw new Error('Invalid part path');
  const bytes = fs.readFileSync(`${dir}/${part.path}`);
  if (bytes.length > 6000 || hash(bytes) !== part.sha256) throw new Error(`Checksum mismatch: ${part.path}`);
  return bytes;
});
const archive = Buffer.concat(buffers);
if (hash(archive) !== expected) throw new Error('Source archive checksum mismatch');
const files = JSON.parse(brotliDecompressSync(archive, {maxOutputLength: 1024 * 1024}).toString('utf8'));
if (Object.keys(files).length !== allowed.length || Object.keys(manifest.files).length !== allowed.length) throw new Error('Unexpected file count');
for (const name of allowed) {
  if (typeof files[name] !== 'string' || hash(Buffer.from(files[name], 'utf8')) !== manifest.files[name]?.sha256) throw new Error(`File checksum mismatch: ${name}`);
}
for (const name of allowed) {
  fs.writeFileSync(name, files[name], 'utf8');
  console.log(`Verified ${name}: ${manifest.files[name].sha256}`);
}
console.log(`Imported ${allowed.length} verified source files.`);
