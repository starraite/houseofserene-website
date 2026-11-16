/* Shared helpers for the admin API. Files starting with "_" are not deployed as endpoints. */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const REPO = process.env.GITHUB_REPO || 'starraite/houseofserene-website';
const BRANCH = process.env.GITHUB_BRANCH || 'main';
const CONTENT_PATH = 'content/site.json';
const LOCAL = process.env.LOCAL_STORE === '1'; // local testing only: read/write files on disk
const ROOT = path.join(__dirname, '..');

function secret() {
  const s = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (!s) throw httpError(500, 'Admin is not set up yet (missing ADMIN_PASSWORD).');
  return s;
}

function httpError(status, message) { const e = new Error(message); e.status = status; return e; }

function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const mac = crypto.createHmac('sha256', secret()).update(body).digest('base64url');
  return `${body}.${mac}`;
}

function verify(token) {
  if (!token || !token.includes('.')) return null;
  const [body, mac] = token.split('.');
  const expected = crypto.createHmac('sha256', secret()).update(body).digest('base64url');
  const a = Buffer.from(mac); const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  const data = JSON.parse(Buffer.from(body, 'base64url').toString());
  if (!data.exp || data.exp < Date.now()) return null;
  return data;
}

function requireAuth(req) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : '';
  if (!verify(token)) throw httpError(401, 'Please log in again.');
}

function checkPassword(pw) {
  const real = process.env.ADMIN_PASSWORD || '';
  if (!real) throw httpError(500, 'Admin is not set up yet (missing ADMIN_PASSWORD).');
  const a = crypto.createHash('sha256').update(String(pw || '')).digest();
  const b = crypto.createHash('sha256').update(real).digest();
  return crypto.timingSafeEqual(a, b);
}

/* ----- storage: GitHub (live) or local disk (testing) ----- */
async function gh(method, url, body) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw httpError(500, 'Admin is not set up yet (missing GITHUB_TOKEN).');
  const res = await fetch(`https://api.github.com/repos/${REPO}/${url}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'serene-wax-admin',
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 409) throw httpError(409, 'The site was changed somewhere else. Reload the admin and try again.');
  if (!res.ok) throw httpError(502, `GitHub error (${res.status}): ${data.message || 'unknown'}`);
  return data;
}

async function readContent() {
  if (LOCAL) {
    const raw = fs.readFileSync(path.join(ROOT, CONTENT_PATH), 'utf8');
    return { content: JSON.parse(raw), sha: crypto.createHash('sha1').update(raw).digest('hex') };
  }
  const f = await gh('GET', `contents/${CONTENT_PATH}?ref=${BRANCH}`);
  return { content: JSON.parse(Buffer.from(f.content, 'base64').toString('utf8')), sha: f.sha };
}

async function writeFile(repoPath, base64, message, sha) {
  if (LOCAL) {
    const full = path.join(ROOT, repoPath);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, Buffer.from(base64, 'base64'));
    if (process.env.LOCAL_REBUILD === '1') require('child_process').execSync('node build.js', { cwd: ROOT });
    return { commit: 'local' };
  }
  const body = { message, content: base64, branch: BRANCH };
  if (sha) body.sha = sha;
  const r = await gh('PUT', `contents/${repoPath}`, body);
  return { commit: r.commit && r.commit.sha };
}

function handler(fn) {
  return async (req, res) => {
    try {
      const out = await fn(req, res);
      if (!res.headersSent) { res.setHeader('Cache-Control', 'no-store'); res.status(200).json(out || { ok: true }); }
    } catch (e) {
      res.status(e.status || 500).json({ error: e.message || 'Something went wrong.' });
    }
  };
}

module.exports = { sign, verify, requireAuth, checkPassword, readContent, writeFile, handler, httpError, CONTENT_PATH };
