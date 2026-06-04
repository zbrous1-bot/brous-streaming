/**
 * Brous - Cloudflare Worker (Generic TMDB Proxy + Basic Auth)
 *
 * This Worker acts as a secure proxy for TMDB while requiring a simple shared password.
 *
 * Secrets required:
 * - TMDB_TOKEN: Your TMDB v3 API Key or v4 Read Access Token
 * - PASSWORD: The shared password for Basic Auth
 *
 * All TMDB calls should now go through:
 *   /api/tmdb/{path}
 * Example:
 *   /api/tmdb/movie/123/recommendations
 *   /api/tmdb/search/movie?query=the%20thing
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    // === 1. Authentication Check ===
    if (!isAuthenticated(request, env)) {
      return new Response('Unauthorized - Please log in', {
        status: 401,
        headers: {
          ...CORS_HEADERS,
          'WWW-Authenticate': 'Basic realm="Brous"',
        },
      });
    }

    const url = new URL(request.url);
    const pathname = url.pathname;

    // === 2. Generic TMDB Proxy ===
    if (pathname.startsWith('/api/tmdb/')) {
      const tmdbPath = pathname.replace('/api/tmdb', ''); // e.g. /movie/123/recommendations
      const tmdbUrl = new URL(`https://api.themoviedb.org/3${tmdbPath}${url.search}`);

      const headers = {
        'Accept': 'application/json',
      };

      // Add TMDB authentication
      if (!env.TMDB_TOKEN) {
        return jsonError('TMDB_TOKEN secret is not configured', 500);
      }

      if (env.TMDB_TOKEN.startsWith('eyJ')) {
        // v4 Read Access Token
        headers['Authorization'] = `Bearer ${env.TMDB_TOKEN}`;
      } else {
        // v3 API Key
        tmdbUrl.searchParams.set('api_key', env.TMDB_TOKEN);
      }

      // Forward the request to TMDB
      const tmdbResponse = await fetch(tmdbUrl.toString(), {
        method: request.method,
        headers,
        body: request.body,
        cf: {
          cacheTtl: 300,           // Cache for 5 minutes
          cacheEverything: true,
        },
      });

      const data = await tmdbResponse.json();

      return new Response(JSON.stringify(data), {
        status: tmdbResponse.status,
        headers: {
          'Content-Type': 'application/json',
          ...CORS_HEADERS,
        },
      });
    }

    // === 3. Health Check / Info ===
    if (pathname === '/' || pathname === '/api' || pathname === '/api/health') {
      return jsonResponse({
        ok: true,
        service: 'Brous - TMDB Proxy + Auth',
        version: '2.0.0',
        note: 'Generic TMDB proxy. All calls go through /api/tmdb/...',
      });
    }

    return jsonError('Not found', 404);
  },
};

// ===================== Helpers =====================

function isAuthenticated(request, env) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return false;
  }

  try {
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = atob(base64Credentials);
    const [, password] = credentials.split(':');

    return password === env.PASSWORD;
  } catch (err) {
    return false;
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  });
}

function jsonError(message, status = 400) {
  return jsonResponse({ error: message }, status);
}
