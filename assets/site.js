/* ============================================================
   SITE SETTINGS — the only things most updates need to touch
   ============================================================ */
const SITE = {
  // Paste the client's online booking link here (Square, Vagaro, GlossGenius, etc.).
  // Every "Book" button on the site will open it in a new tab.
  bookingUrl: '',

  // Text on the Intimate Bleaching tag. Change to '' to hide the tag everywhere.
  newServiceTag: 'New service',

  // WinStamp app store links
  appStoreUrl: '',
  googlePlayUrl: '',
};

/* ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Booking links
  document.querySelectorAll('[data-book]').forEach((a) => {
    if (SITE.bookingUrl) {
      a.href = SITE.bookingUrl;
      a.target = '_blank';
      a.rel = 'noopener';
    } else {
      a.href = '/services';
    }
  });

  // New service tag
  document.querySelectorAll('[data-new-tag]').forEach((el) => {
    if (SITE.newServiceTag) el.textContent = SITE.newServiceTag;
    else el.remove();
  });

  // App links
  const setLink = (sel, url) => document.querySelectorAll(sel).forEach((a) => {
    if (url) { a.href = url; a.target = '_blank'; a.rel = 'noopener'; }
  });
  setLink('[data-appstore]', SITE.appStoreUrl);
  setLink('[data-googleplay]', SITE.googlePlayUrl);

  // Mobile menu
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.getElementById('nav-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Close' : 'Menu';
    });
  }

  // Footer year
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
});
