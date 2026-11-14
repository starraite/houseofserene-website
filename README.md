# House of Serene Wax website

Static site (plain HTML/CSS/JS, no build step). Deploys to Vercel as-is.

## Pages
- `/` home · `/about` · `/services` · `/policy`

## One-place settings: `assets/site.js`
- `bookingUrl` — paste the booking link; every Book button opens it in a new tab
- `newServiceTag` — text on the Intimate Bleaching tag ('' hides it)
- `appStoreUrl`, `googlePlayUrl` — WinStamp app links

## Logos (in place)
- `logo-main.png` — main white logo, home banner
- `logo-main.png` is also used in the footer
- `logo-mark.png` — white HSW monogram, top menu on every page
- `favicon.png` — white monogram on forest green (browser tab)
- `winstamp-white.png` — rewards banner
- Banner, service, Kenn and studio photos/video: replace the `.ph` placeholder blocks (comments in `index.html` show where)

## Still needed from the client
- Prices, short descriptions and durations for each service
- Booking link
- WinStamp App Store / Google Play links
- Photos: banner, Brazilian, Full Body, Underarm, Intimate Bleaching, botanical detail, Kenn portrait; studio video
- Optional extra About copy from Kenn

## Deploy
1. Push this folder to a GitHub repo
2. Vercel → Add New Project → import the repo → Framework: Other → Deploy
3. Project → Settings → Domains → add her domain, then add the DNS records Vercel shows at her registrar
