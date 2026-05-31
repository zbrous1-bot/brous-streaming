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

1. Open the app
2. Expand **TMDB API Key** and paste your free API key
3. Check the services you subscribe to in **My Services**
4. Start searching or using Discover

### Getting a TMDB API Key (Free)

1. Go to [themoviedb.org](https://www.themoviedb.org)
2. Create a free account
3. Go to Settings → API → Request an API Key (v3)
4. Copy the key and paste it into the app

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