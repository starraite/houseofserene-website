/* Local preview of the site + admin, without GitHub.
   Run: ADMIN_PASSWORD=test node tools/dev-server.js   →  http://localhost:3000/admin/
   Saves go straight to content/site.json and uploads/ on disk, then the site is rebuilt. */
process.env.LOCAL_STORE = '1';
process.env.LOCAL_REBUILD = '1';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const PUB = path.join(ROOT, 'public');
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.webmanifest': 'application/manifest+json' };
execSync('node build.js', { cwd: ROOT });

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname.startsWith('/api/')) {
    let raw = '';
    req.on('data', (c) => { raw += c; });
    req.on('end', () => {
      req.body = raw ? JSON.parse(raw) : {};
      res.status = (c) => { res.statusCode = c; return res; };
      res.json = (o) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(o)); };
      const name = url.pathname.slice(5).replace(/[^a-z]/g, '');
      delete require.cache[require.resolve(path.join(ROOT, 'api', name))];
      require(path.join(ROOT, 'api', name))(req, res);
    });
    return;
  }
  let p = path.join(PUB, decodeURIComponent(url.pathname));
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.html');
  else if (!path.extname(p) && fs.existsSync(p + '.html')) p += '.html';
  if (!fs.existsSync(p)) { res.statusCode = 404; return res.end('Not found'); }
  res.setHeader('Content-Type', TYPES[path.extname(p)] || 'application/octet-stream');
  fs.createReadStream(p).pipe(res);
}).listen(process.env.PORT || 3000, () => console.log('http://localhost:' + (process.env.PORT || 3000)));
