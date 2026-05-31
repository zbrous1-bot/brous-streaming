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