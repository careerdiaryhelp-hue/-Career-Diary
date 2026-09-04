export default async function handler(req, res) {
  const isNode = res && typeof res.status === 'function';

  const sendJson = (status, data) => {
    if (isNode) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      return res.status(status).json(data);
    }
    return new Response(JSON.stringify(data), {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  };

  // Allow CORS preflight
  if (req.method === 'OPTIONS') {
    if (isNode) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      return res.status(200).end();
    }
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }

  // Get target URL
  let targetUrl = '';
  if (req.query && req.query.url) {
    targetUrl = req.query.url;
  } else {
    try {
      const u = new URL(req.url, 'http://localhost');
      targetUrl = u.searchParams.get('url') || '';
    } catch (e) {}
  }

  if (!targetUrl) {
    return sendJson(400, { error: 'Missing "url" query parameter' });
  }

  try {
    const urlObj = new URL(targetUrl);

    // 1. If URL is explicitly a WP REST API endpoint
    if (targetUrl.includes('/wp-json/wp/v2/posts')) {
      const wpRes = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      if (wpRes.ok) {
        const wpData = await wpRes.json();
        const post = Array.isArray(wpData) ? wpData[0] : wpData;
        return sendJson(200, { success: true, type: 'wordpress_acf', data: post });
      }
    }

    // 2. Check if the domain has a WordPress REST API for this post slug
    const segments = urlObj.pathname.split('/').filter(Boolean);
    const lastSeg = segments[segments.length - 1];
    if (lastSeg && !lastSeg.includes('.') && !lastSeg.startsWith('wp-')) {
      try {
        const wpApiUrl = `${urlObj.origin}/wp-json/wp/v2/posts?slug=${encodeURIComponent(lastSeg)}`;
        const wpCtrl = new AbortController();
        const wpTimeout = setTimeout(() => wpCtrl.abort(), 2500);
        const wpRes = await fetch(wpApiUrl, {
          signal: wpCtrl.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });
        clearTimeout(wpTimeout);
        if (wpRes.ok) {
          const wpData = await wpRes.json();
          if (Array.isArray(wpData) && wpData.length > 0) {
            return sendJson(200, { success: true, type: 'wordpress_acf', data: wpData[0] });
          }
        }
      } catch (e) {
        // Not a WP REST API or timed out, continue to standard fetch
      }
    }

    // 3. Universal fetch for any website (Result Bharat, Sarkari Result, Rojgar Result, etc.)
    let fetchRes;
    try {
      fetchRes = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,application/json,*/*;q=0.8'
        }
      });
    } catch (fetchErr) {
      // Fallback to public proxy if direct fetch is blocked
      const publicFallback = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
      fetchRes = await fetch(publicFallback);
    }

    const contentType = fetchRes.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await fetchRes.json();
      return sendJson(200, { success: true, type: 'json', data });
    } else {
      const html = await fetchRes.text();
      return sendJson(200, { success: true, type: 'html', html });
    }
  } catch (err) {
    console.error('Serverless proxy error:', err);
    return sendJson(500, { error: err.message });
  }
}
