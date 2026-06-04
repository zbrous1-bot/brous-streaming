# Brous

**Brous** is a clean, mobile-first web app for discovering where to watch movies and TV shows across your subscribed services.

**Live Demo:** [https://brous-streaming.pages.dev/](https://brous-streaming.pages.dev/)

## Features

- **Search** for movies and TV shows
- **Discover** titles by genre, minimum rating, and decade
- Filter results to only services you subscribe to ("My Services")
- Clear breakdown of Streaming, Rent, and Buy options
- "Yours" highlighting for services you actually pay for
- Direct links to IMDb and Rotten Tomatoes
- TMDB ratings shown on every result
- Fully installable as a Progressive Web App (PWA)

## Getting Started

1. Open the app using the password-protected Worker URL
2. Check the services you subscribe to in **My Services**
3. Start searching or using Discover

**Note:** The TMDB API key is now stored securely in a Cloudflare Worker (not exposed in the browser). You no longer need to enter it in the app.

## Self-Hosting / Deployment

Brous is a completely static site (no backend). You can host it anywhere that supports static files.

### Recommended: Cloudflare Pages (Current Setup)
- Unlimited bandwidth on the free plan
- Automatic deployments from GitHub
- Excellent global performance

**Exact setup for this repo:**

1. In Cloudflare dashboard → Pages → Create a project → Connect to Git → select the `brous-streaming` repo.
2. Set:
   - **Root directory**: `deploy`
   - **Build command**: (leave empty or `echo "static site"`)
   - **Build output directory**: `.` (or `deploy` depending on your Pages config — the files in `deploy/` become the site root)
3. Save and deploy. Future `git push` to `main` will auto-deploy.

**Important: The Cloudflare Worker (required for API calls)**

The app calls `/api/tmdb/...` which must be handled by a Worker that:
- Adds the real TMDB key (never exposed to browser)
- Enforces a simple shared password via Basic Auth

- The Worker source is in `deploy/cloudflare-worker/worker.js`
- Deploy it as a separate Worker in Cloudflare (use Wrangler or the dashboard "Upload" with the .js file).
- In the **Worker** settings (not Pages):
  - Add **Secrets**:
    - `TMDB_TOKEN` = your TMDB API key (v3) **or** v4 Read Access Token (starts with `eyJ...`)
    - `PASSWORD` = a simple shared password (e.g. `mysecret123`) — tell the <4 people who use the app
  - Add a **Route** (Triggers → Routes) so the Worker runs on your Pages domain:
    - Pattern: `your-project.pages.dev/api/tmdb*`
    - (Also add for any custom domain you use)

Once deployed:
- Visit your Pages URL.
- Click the **🔐 Pass** button (top right) and enter the exact `PASSWORD` you set in the Worker secret.
- The first time you use Discover or Search it will also prompt.
- The button turns into "🔐 OK" when a password is saved for that browser.

If you see "Error loading results..." it almost always means:
- Password not entered yet in the app (use the button), or
- Wrong value for the `PASSWORD` secret, or
- `TMDB_TOKEN` secret missing, or
- The Worker Route is not set (so /api calls 404 or hit Pages directly).

### Other Good Options
- GitHub Pages
- Netlify
- Vercel
- Render Static Sites

## Tech Stack

- Vanilla HTML, CSS, and JavaScript
- Tailwind CSS (via CDN)
- The Movie Database (TMDB) API

## Credits

Movie and TV data provided by [The Movie Database (TMDB)](https://www.themoviedb.org/).

---

This project started as a personal tool to solve inconsistent search results across streaming apps. It is no longer tied to any specific device or remote control features.