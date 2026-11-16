# House of Serene Wax website

Static site built from `content/site.json`, plus an admin editor at `/admin`.

## How it works
- `content/site.json` holds all editable content (services, prices, photos, reviews, policies, links).
- `node build.js` turns it into the pages in `public/` (Vercel runs this on every deploy).
- `/admin` is the editor. Publishing commits `content/site.json` (and uploaded photos in `uploads/`) to this repo; Vercel redeploys automatically in about a minute.

## Vercel environment variables (Production)
- `ADMIN_PASSWORD`: the password for /admin
- `GITHUB_TOKEN`: fine-grained GitHub token with **Contents: Read and write** on this repo only
- Optional: `SESSION_SECRET` (defaults to the admin password), `GITHUB_REPO`, `GITHUB_BRANCH`

Changing `ADMIN_PASSWORD` signs out every device. The GitHub token expires on the date set when it was created; generate a new one before then and update the variable.

## Local preview
```
ADMIN_PASSWORD=test node tools/dev-server.js
```
Open http://localhost:3000 (site) and http://localhost:3000/admin (editor). Saves write to local files only.

## Files
- `static/assets/`: styles, scripts, logos
- `static/admin/`: the editor
- `api/`: login, content and photo-upload endpoints
- `uploads/`: photos added through the editor
