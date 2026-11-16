const { requireAuth, readContent, writeFile, handler, httpError, CONTENT_PATH } = require('./_lib');

function validate(c) {
  const need = ['settings', 'home', 'services', 'about', 'reviews', 'policies'];
  if (!c || typeof c !== 'object') throw httpError(400, 'Nothing to save.');
  for (const k of need) if (!(k in c)) throw httpError(400, `Missing section: ${k}`);
  if (!Array.isArray(c.services) || !Array.isArray(c.reviews) || !Array.isArray(c.policies)) throw httpError(400, 'Invalid content.');
  for (const s of c.services) if (!s.name || !String(s.name).trim()) throw httpError(400, 'Every service needs a name.');
  const text = JSON.stringify(c, null, 2);
  if (text.length > 400000) throw httpError(400, 'Content is too large.');
  return text;
}

// GET: current content.  POST { content, sha }: publish.
module.exports = handler(async (req) => {
  requireAuth(req);
  if (req.method === 'GET') return readContent();
  if (req.method !== 'POST') throw httpError(405, 'Use GET or POST.');
  const { content, sha } = req.body || {};
  const text = validate(content);
  const r = await writeFile(CONTENT_PATH, Buffer.from(text + '\n').toString('base64'), 'Update site content (admin)', sha);
  const fresh = await readContent();
  return { ok: true, commit: r.commit, sha: fresh.sha };
});
