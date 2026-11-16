/* Builds the public site from content/site.json.
   Run: node build.js  →  writes everything into public/ */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const OUT = path.join(ROOT, 'public');
const site = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', 'site.json'), 'utf8'));
const S = site.settings;

/* ---------- helpers ---------- */
const esc = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slug = (v) => String(v).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const paras = (t) => String(t || '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
const pad = (n) => String(n).padStart(2, '0');
const telDigits = (p) => '+1' + String(p || '').replace(/\D/g, '').slice(-10);

const bookAttrs = () => (S.bookingUrl
  ? `href="${esc(S.bookingUrl)}" target="_blank" rel="noopener"`
  : 'href="/services"');

const newTag = (cls) => (S.newServiceTag ? `<span class="tag ${cls}">${esc(S.newServiceTag)}</span>` : '');

function photo(src, label, cls = '', style = '') {
  const st = style ? ` style="${style}"` : '';
  if (src) return `<div class="ph has-img ${cls}"${st}><img class="fill" src="${esc(src)}" alt="${esc(label)}" loading="lazy"></div>`;
  return `<div class="ph ${cls}"${st}>Photo · ${esc(label)}</div>`;
}

function videoEmbed(url, cls) {
  const u = String(url || '').trim();
  const play = '<svg aria-hidden="true" width="56" height="56" viewBox="0 0 56 56" fill="none" stroke="#DAD7CD" stroke-width="1.2"><circle cx="28" cy="28" r="26"/><path d="M23 18l15 10-15 10z"/></svg>';
  if (!u) return `<div class="ph ${cls}">${play}<span>Studio video</span></div>`;
  const yt = u.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/);
  if (yt) return `<div class="ph has-img ${cls}"><iframe src="https://www.youtube-nocookie.com/embed/${yt[1]}" title="Studio video" allow="encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`;
  const vm = u.match(/vimeo\.com\/(\d+)/);
  if (vm) return `<div class="ph has-img ${cls}"><iframe src="https://player.vimeo.com/video/${vm[1]}" title="Studio video" allow="fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`;
  return `<div class="ph has-img ${cls}"><video src="${esc(u)}" controls playsinline preload="metadata"></video></div>`;
}

function categories() {
  const order = [];
  const map = {};
  for (const s of site.services) {
    const c = (s.category || 'Services').trim();
    if (!map[c]) { map[c] = []; order.push(c); }
    map[c].push(s);
  }
  return order.map((name) => ({ name, items: map[name] }));
}

const priceText = (s, from) => (s.price ? `${from ? 'from ' : ''}${esc(s.price)}` : '');

/* ---------- layout ---------- */
const NAV = [['/', 'Home'], ['/about', 'About'], ['/services', 'Services'], ['/policy', 'Policy'], ['#contact', 'Contact']];

function layout({ title, desc, bodyClass, current, main }) {
  const links = NAV.map(([h, l]) => `<li><a href="${h}"${h === current ? ' aria-current="page"' : ''}>${l}</a></li>`).join('\n');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="website">
<link rel="icon" href="/assets/favicon.png">
<link rel="apple-touch-icon" href="/assets/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/styles.css">
<script src="/assets/site.js" defer></script>
</head>
<body class="${bodyClass}">
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
<nav class="wrap nav" aria-label="Main">
<a class="nav-logo" href="/" aria-label="House of Serene Wax home"><img src="/assets/logo-mark.png" alt="House of Serene Wax"></a>
<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-menu">Menu</button>
<div class="nav-menu" id="nav-menu">
<ul class="nav-links">
${links}
</ul>
<a class="btn btn-stone" ${bookAttrs()}>Book Now</a>
</div>
<a class="btn btn-stone nav-book" ${bookAttrs()}>Book Now</a>
</nav>
</header>
<main id="main">
${main}
</main>
${footer()}
</body>
</html>
`;
}

function footer() {
  return `<footer class="site-footer" id="contact">
<div class="wrap footer-main">
<a class="footer-logo" href="/" aria-label="House of Serene Wax home"><img src="/assets/logo-main.png" alt="House of Serene Wax"></a>
<div class="footer-col"><span class="label">Studio</span><span>${esc(S.location)}</span><span>${esc(S.hours)}</span><span>${esc(S.closed)}</span></div>
<div class="footer-col"><span class="label">Say hello</span><a href="mailto:${esc(S.email)}">${esc(S.email)}</a><span>Text only · <a href="sms:${telDigits(S.phone)}">${esc(S.phone)}</a></span></div>
<div class="footer-col"><span class="label">Follow</span>${S.instagramUrl ? `<a href="${esc(S.instagramUrl)}" target="_blank" rel="noopener">Instagram</a>` : ''}${S.tiktokUrl ? `<a href="${esc(S.tiktokUrl)}" target="_blank" rel="noopener">TikTok</a>` : ''}</div>
<div class="footer-col"><span class="label">Explore</span><a href="/about">About</a><a href="/services">Services</a><a href="/policy">Policy</a></div>
</div>
<div class="wrap footer-base">© <span data-year>${new Date().getFullYear()}</span> House of Serene Wax · Smooth. Simple. Serene.</div>
</footer>`;
}

/* ---------- shared sections ---------- */
function rewards() {
  const a = S.appStoreUrl ? `href="${esc(S.appStoreUrl)}" target="_blank" rel="noopener"` : 'href="#"';
  const g = S.googlePlayUrl ? `href="${esc(S.googlePlayUrl)}" target="_blank" rel="noopener"` : 'href="#"';
  return `<section class="rewards" aria-label="Rewards">
<div class="wrap">
<div class="rewards-band">
<img class="rewards-logo" src="/assets/winstamp-white.png" alt="WinStamp" width="88" height="88">
<div class="rewards-copy">
<h2>Every visit earns rewards.</h2>
<p>Collect points with the WinStamp app and redeem them toward future services.</p>
</div>
<div class="rewards-btns">
<a class="btn btn-ink" ${a}>App Store</a>
<a class="btn btn-ink" ${g}>Google Play</a>
</div>
</div>
</div>
</section>`;
}

function reviews() {
  if (!site.reviews.length) return '';
  const items = site.reviews.map((r) => `<figure class="review"><blockquote>“${esc(r.quote)}”</blockquote><figcaption>${esc(r.name)}</figcaption></figure>`).join('\n');
  return `<section class="reviews" aria-label="Client reviews">
<div class="wrap">
<div class="reviews-head">
<p class="eyebrow">Kind words</p>
<h2>Smooth results, <em>happy clients</em></h2>
</div>
<div class="card-grid">
${items}
</div>
</div>
</section>`;
}

function beforeYouBook() {
  const items = site.policies.filter((p) => p.homeTitle || p.homeText)
    .map((p) => `<div><dt>${esc(p.homeTitle || p.title)}</dt><dd>${esc(p.homeText || p.text)}</dd></div>`).join('\n');
  return `<section class="need" aria-labelledby="need-h">
<div class="wrap">
<div class="need-intro">
<h2 id="need-h">Before you book</h2>
<p>Make sure to check out our policy page so you have everything you need for your appointment.</p>
<a class="text-link" href="/policy">Read the full policy</a>
</div>
<dl>
${items}
</dl>
</div>
</section>`;
}

function studioVideo() {
  return `<section class="video" aria-label="Studio video">
<div class="wrap">
<div class="video-copy">
<h2>Step inside<br><em>the studio</em></h2>
<p>${esc(site.home.studioText)}</p>
</div>
${videoEmbed(site.home.studioVideo, 'video-frame')}
</div>
</section>`;
}

const SWATCHES = [['#3A5A40', '#EEF0E6'], ['#A3B18A', '#1E2B22'], ['#DAD7CD', '#1E2B22']];

/* ---------- pages ---------- */
function home() {
  const H = site.home;
  const media = H.bannerVideo
    ? `<video class="hero-media" src="${esc(H.bannerVideo)}" autoplay muted loop playsinline></video>`
    : H.bannerPhoto ? `<img class="hero-media" src="${esc(H.bannerPhoto)}" alt="">` : '';
  const favs = site.services.filter((s) => s.favorite);
  const cards = favs.map((s, i) => {
    const featured = s.isNew;
    const sw = SWATCHES[i % SWATCHES.length];
    const ph = featured
      ? (s.photo
        ? `<div class="ph has-img"><img class="fill" src="${esc(s.photo)}" alt="${esc(s.name)}" loading="lazy">${newTag('tag-light')}</div>`
        : `<div class="ph">${newTag('tag-light')}<span>Photo · ${esc(s.name)}</span></div>`)
      : photo(s.photo, s.name, '', `background:${sw[0]};color:${sw[1]}`);
    return `<article class="card${featured ? ' card-featured' : ''}">
${ph}
<div class="card-body">
<div class="card-title"><h3>${esc(s.name)}</h3><span>${priceText(s)}</span></div>
<p>${esc(s.description)}</p>
<a class="btn btn-clay" ${bookAttrs()}>Book ${esc(s.name)}</a>
</div>
</article>`;
  }).join('\n');

  const cols = categories().map((c) => `<div class="menu-col">
<h3>${esc(c.name)}</h3>
${c.items.map((s, i) => `<a class="menu-item" href="/services#${slug(s.id || s.name)}"><span class="menu-row"><span class="menu-num">${pad(i + 1)}</span><span class="menu-name">${esc(s.name)}</span><span class="menu-price">${priceText(s, true)}</span></span>${s.isNew ? newTag('tag-clay') : ''}</a>`).join('\n')}
</div>`).join('\n');

  const main = `<section class="hero">
<div class="wrap">
<div class="hero-frame">
${media}
<img class="hero-logo" src="/assets/logo-main.png" alt="House of Serene Wax — Smooth. Simple. Serene.">
<a class="hero-cta" ${bookAttrs()}>Reserve your appointment</a>
</div>
</div>
</section>
<section class="intro">
<div class="wrap">
<svg aria-hidden="true" width="72" height="28" viewBox="0 0 72 28" fill="none" stroke="#BC6C25" stroke-width="1.2" stroke-linecap="round"><path d="M4 22 C 24 22, 46 18, 68 6"/><path d="M22 21c-2-6 0-10 5-12 1 6-1 10-5 12z"/><path d="M36 18c-1-6 2-10 7-11 0 6-3 9-7 11z"/><path d="M50 13c0-5 3-8 8-8-1 5-4 8-8 8z"/><path d="M30 20c5-4 10-4 13-1-4 3-9 3-13 1z"/></svg>
<h1>Waxing, made <em>serene</em>.</h1>
<p>${esc(H.introText)}</p>
<a class="text-link" href="/about">Meet Kenn</a>
</div>
</section>
${favs.length ? `<section class="favorites" aria-labelledby="fav-h">
<div class="wrap">
<div class="section-head">
<h2 id="fav-h">Client Favorites</h2>
<a class="text-link" href="/services">View all services</a>
</div>
<div class="card-grid">
${cards}
</div>
</div>
</section>` : ''}
<section class="menu" aria-labelledby="menu-h">
<div class="wrap">
${photo(H.menuPhoto, 'botanical detail / wax in use', 'menu-photo')}
<div class="menu-list">
<p class="eyebrow" id="menu-h">Our services</p>
<div class="menu-cols">
${cols}
</div>
<a class="btn btn-forest" ${bookAttrs()}>Book My Services</a>
</div>
</div>
</section>
${studioVideo()}
${reviews()}
${beforeYouBook()}
${rewards()}`;
  return layout({
    title: 'House of Serene Wax · Waxing Studio in Decatur, GA',
    desc: 'Professional, body-positive waxing in Decatur, GA. Brazilian specialists with expert technique, a gentle approach and a welcoming space.',
    bodyClass: 'home', current: '/', main,
  });
}

function about() {
  const A = site.about;
  const story = paras(A.story).map((p) => `<p>${esc(p)}</p>`).join('\n');
  const promises = A.promises.map((p) => `<div class="promise-item"><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></div>`).join('\n');
  const main = `<section class="page-hero">
<div class="wrap">
<p class="eyebrow">About the studio</p>
<h1>Hi, I'm <em>Kenn</em>.</h1>
<p>${esc(A.tagline)}</p>
</div>
</section>
<section class="about-story">
<div class="wrap">
${photo(A.photo, 'Kenn portrait', 'about-photo')}
<div class="about-copy">
<h2>${esc(A.heading)}</h2>
${story}
<a class="btn btn-clay" ${bookAttrs()}>Book with Kenn</a>
</div>
</div>
</section>
${A.promises.length ? `<section class="promise" aria-labelledby="promise-h">
<div class="wrap">
<h2 id="promise-h">Our promise</h2>
<div class="promise-grid">
${promises}
</div>
</div>
</section>` : ''}
${studioVideo()}
${reviews()}
${rewards()}`;
  return layout({
    title: 'About Kenn · House of Serene Wax',
    desc: 'Meet Kenn, founder of House of Serene Wax in Decatur, GA. Professional, body-positive waxing since 2021.',
    bodyClass: 'about', current: '/about', main,
  });
}

function services() {
  const groups = categories().map((c) => `<section class="svc-group" aria-labelledby="cat-${slug(c.name)}">
<div class="wrap">
<h2 id="cat-${slug(c.name)}"><em>${esc(c.name)}</em></h2>
${c.items.map((s, i) => {
    const sw = SWATCHES[i % SWATCHES.length];
    return `<article class="svc-row${s.isNew ? ' featured' : ''}" id="${slug(s.id || s.name)}">
${s.isNew ? photo(s.photo, s.name) : photo(s.photo, s.name, '', `background:${sw[0]};color:${sw[1]}`)}
<div class="svc-info">
${s.isNew ? newTag('tag-clay') : ''}
<h3>${esc(s.name)}</h3>
<p>${esc(s.description)}</p>
${s.duration ? `<div class="svc-meta"><span>${esc(s.duration)}</span></div>` : ''}
</div>
<div class="svc-cta">
${s.price ? `<span class="svc-price">${esc(s.price)}</span>` : ''}
<a class="btn btn-clay" ${bookAttrs()}>Book ${esc(s.name)}</a>
</div>
</article>`;
  }).join('\n')}
</div>
</section>`).join('\n');
  const main = `<section class="page-hero">
<div class="wrap">
<p class="eyebrow">Services</p>
<h1>The <em>menu</em></h1>
<p>Brazilian specialists with a gentle approach. Every service is one-on-one in a private studio.</p>
</div>
</section>
${groups}
${beforeYouBook()}
${rewards()}`;
  return layout({
    title: 'Services · House of Serene Wax',
    desc: `${site.services.map((s) => s.name).join(', ')} at House of Serene Wax in Decatur, GA.`,
    bodyClass: 'services', current: '/services', main,
  });
}

function policy() {
  const items = site.policies.map((p) => `<div class="policy-item"><h2>${esc(p.title)}</h2>${paras(p.text).map((t) => `<p>${esc(t)}</p>`).join('')}</div>`).join('\n');
  const main = `<section class="page-hero">
<div class="wrap">
<p class="eyebrow">Policy</p>
<h1>Need <em>to knows</em></h1>
<p>Please read before your appointment so everything goes smoothly.</p>
</div>
</section>
<section class="policy">
<div class="wrap">
${items}
<p class="policy-note">Questions? Text <a href="sms:${telDigits(S.phone)}">${esc(S.phone)}</a> or email <a href="mailto:${esc(S.email)}">${esc(S.email)}</a>.</p>
</div>
</section>
${rewards()}`;
  return layout({
    title: 'Policy · House of Serene Wax',
    desc: 'Cancellation, arrival, guest and payment policies for House of Serene Wax in Decatur, GA.',
    bodyClass: 'policy', current: '/policy', main,
  });
}

/* ---------- write ---------- */
function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    if (e.name.startsWith('.')) continue;
    const s = path.join(src, e.name); const d = path.join(dest, e.name);
    if (e.isDirectory()) copyDir(s, d); else fs.copyFileSync(s, d);
  }
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
copyDir(path.join(ROOT, 'static'), OUT);
copyDir(path.join(ROOT, 'uploads'), path.join(OUT, 'uploads'));
fs.writeFileSync(path.join(OUT, 'index.html'), home());
fs.writeFileSync(path.join(OUT, 'about.html'), about());
fs.writeFileSync(path.join(OUT, 'services.html'), services());
fs.writeFileSync(path.join(OUT, 'policy.html'), policy());
fs.writeFileSync(path.join(OUT, 'version.json'), JSON.stringify({ commit: process.env.VERCEL_GIT_COMMIT_SHA || 'local', builtAt: new Date().toISOString() }));
console.log('Built site into public/');
