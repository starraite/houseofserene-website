const { sign, checkPassword, handler, httpError } = require('./_lib');

const DAYS = 30;

module.exports = handler(async (req) => {
  if (req.method !== 'POST') throw httpError(405, 'Use POST.');
  const { password } = req.body || {};
  if (!checkPassword(password)) {
    await new Promise((r) => setTimeout(r, 800)); // slow down guessing
    throw httpError(401, 'That password didn’t work.');
  }
  return { token: sign({ exp: Date.now() + DAYS * 864e5 }) };
});
