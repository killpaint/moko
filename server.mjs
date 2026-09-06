// Zero-dependency static server. Node.js 18+. Serves localhost only.
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const port=Number(process.env.PORT||4173);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.json':'application/json','.moko':'application/json','.md':'text/plain; charset=utf-8'};
http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost');let filename=decodeURIComponent(url.pathname);if(filename==='/')filename='/index.html';const target=path.resolve(root,'.'+filename);if(target!==root&&!target.startsWith(root+path.sep)){res.writeHead(403);res.end('Forbidden');return}const data=await fs.readFile(target);res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(data)}catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Not found')}}).listen(port,'127.0.0.1',()=>console.log(`墨构 MOKO → http://localhost:${port}\n按 Ctrl+C 停止服务。`)).on('error',err=>{console.error('无法启动：',err.message);process.exitCode=1});
