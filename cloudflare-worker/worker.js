/**
 * Brous - Password Protected + TMDB Proxy Worker
 * 
 * This Worker does two things:
 * 1. Requires a simple shared password (Basic Auth)
 * 2. Proxies TMDB API requests so your real API key is never exposed in the browser
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // 1. Check password authentication first
    const auth = request.headers.get('Authorization');
    if (!auth || !isAuthorized(auth, env)) {
      return new Response('Unauthorized - Please enter the password', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Brous"',
          'Content-Type': 'text/plain',
        },
      });
    }

    // 2. Handle TMDB API proxy requests
    // Frontend should call: /api/tmdb/3/...
    if (pathname.startsWith('/api/tmdb/')) {
      const tmdbPath = pathname.replace('/api/tmdb', ''); // e.g. /3/search/movie
      const tmdbUrl = new URL(tmdbPath + url.search, 'https://api.themoviedb.org');

      // Add the real secret API key
      tmdbUrl.searchParams.set('api_key', env.TMDB_API_KEY);

      // Forward the request to TMDB
      const tmdbRequest = new Request(tmdbUrl.toString(), {
        method: request.method,
        headers: request.headers,
        body: request.body,
      });

      // Remove the original api_key if the frontend sent one (for safety)
      tmdbRequest.headers.delete('x-api-key'); // just in case

      return fetch(tmdbRequest);
    }

    // 3. For everything else, proxy to the actual Brous site on Pages
    const pagesUrl = new URL(request.url);
    pagesUrl.hostname = 'brous-streaming.pages.dev';

    return fetch(pagesUrl, request);
  },
};

function isAuthorized(authHeader, env) {
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return false;
  }

  try {
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = atob(base64Credentials);
    const [username, password] = credentials.split(':');

    // We only check the password. Username can be anything.
    return password === env.PASSWORD;
  } catch (e) {
    return false;
  }
}