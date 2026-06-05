/**
 * Brous - Cloudflare Worker (Generic TMDB Proxy + LLM Proxy + Basic Auth)
 *
 * This Worker acts as a secure proxy for TMDB and xAI LLM while requiring a simple shared password.
 *
 * Secrets required:
 * - TMDB_TOKEN: Your TMDB v3 API Key or v4 Read Access Token
 * - XAI_TOKEN: Your xAI API key (for the Curator chatbot)
 * - PASSWORD: The shared password for Basic Auth
 *
 * TMDB calls: /api/tmdb/{path}
 * LLM calls (POST): /api/llm  (body = OpenAI compatible chat.completions payload, key injected server-side)
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

    // === 3. LLM Proxy (for The Curator chatbot; OpenAI-compatible, key injected server-side) ===
    if (pathname === '/api/llm' || pathname === '/api/llm/') {
      if (request.method !== 'POST') {
        return jsonError('Method not allowed for /api/llm; use POST with chat.completions payload', 405);
      }
      if (!env.XAI_TOKEN) {
        return jsonError('XAI_TOKEN secret not configured (Curator requires it in Worker env)', 500);
      }

      let body;
      try {
        body = await request.json();
      } catch (e) {
        return jsonError('Invalid JSON in request body', 400);
      }

      // Never trust/forward any key from client
      delete body.api_key;
      delete body.key;
      delete body.openai_api_key;

      // Default to xAI endpoint (supports other OpenAI-compat if you extend worker with more secrets + routing)
      const llmUrl = 'https://api.x.ai/v1/chat/completions';

      const llmResponse = await fetch(llmUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.XAI_TOKEN}`,
        },
        body: JSON.stringify(body),
      });

      const contentType = llmResponse.headers.get('content-type') || '';
      if (contentType.includes('text/event-stream') || (body && body.stream)) {
        // Pipe streaming response for real-time tokens in chat
        return new Response(llmResponse.body, {
          status: llmResponse.status,
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            ...CORS_HEADERS,
          },
        });
      }

      const data = await llmResponse.json();
      return new Response(JSON.stringify(data), {
        status: llmResponse.status,
        headers: {
          'Content-Type': 'application/json',
          ...CORS_HEADERS,
        },
      });
    }

    // === 4. Health Check / Info ===
    if (pathname === '/' || pathname === '/api' || pathname === '/api/health') {
      return jsonResponse({
        ok: true,
        service: 'Brous / Horror Roki - TMDB + LLM Proxy + Auth',
        version: '3.0.0',
        note: 'TMDB via /api/tmdb/* ; LLM (Curator) via POST /api/llm . Password required for both.',
        features: ['tmdb-proxy', 'llm-proxy-xai', 'basic-auth'],
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
