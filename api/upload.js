const crypto = require('crypto');
const { requireAuth, writeFile, handler, httpError } = require('./_lib');

const TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const MAX = 3 * 1024 * 1024;

// POST { name, type, data(base64) } → { url }
module.exports = handler(async (req) => {
  requireAuth(req);
  if (req.method !== 'POST') throw httpError(405, 'Use POST.');
  const { name = 'photo', type, data } = req.body || {};
  const ext = TYPES[type];
  if (!ext) throw httpError(400, 'Please upload a JPG, PNG or WebP photo.');
  const buf = Buffer.from(String(data || ''), 'base64');
  if (!buf.length) throw httpError(400, 'Empty file.');
  if (buf.length > MAX) throw httpError(400, 'That photo is too large. Try a smaller one.');
  const base = String(name).toLowerCase().replace(/\.[a-z0-9]+$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'photo';
  const file = `${base}-${Date.now().toString(36)}${crypto.randomBytes(2).toString('hex')}.${ext}`;
  await writeFile(`uploads/${file}`, buf.toString('base64'), `Add photo ${file} (admin)`);
  return { url: `/uploads/${file}` };
});

module.exports.config = { api: { bodyParser: { sizeLimit: '4mb' } } };
