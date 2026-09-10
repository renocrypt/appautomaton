import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { resolve, extname } from 'node:path'
const root = resolve('_site')
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2','.txt':'text/plain','.xml':'application/xml','.png':'image/png'}
createServer(async (req,res) => {
 try {
  const url = new URL(req.url,'http://localhost')
  const file = resolve(root, '.' + decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname))
  if (!file.startsWith(root + '/')) {res.writeHead(403).end();return}
  const data = await readFile(file)
  res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream','Cache-Control':'no-store'}).end(data)
 } catch {res.writeHead(404).end('Not found')}
}).listen(4173,'127.0.0.1',()=>console.log('Preview: http://127.0.0.1:4173'))
