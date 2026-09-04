export async function onRequest(context) {
  const { request } = context;

  // Handle CORS OPTIONS
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  const url = new URL(request.url);
  const targetUrl = url.searchParams.get('url');
  if (!targetUrl) {
    return new Response(JSON.stringify({ error: 'Missing "url" query parameter' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  try {
    const targetObj = new URL(targetUrl);

    // 1. If URL is explicitly a WP REST API endpoint
    if (targetUrl.includes('/wp-json/wp/v2/posts')) {
      const wpRes = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });
      if (wpRes.ok) {
        const wpData = await wpRes.json();
        const post = Array.isArray(wpData) ? wpData[0] : wpData;
        return new Response(JSON.stringify({ success: true, type: 'wordpress_acf', data: post }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    }

    // 2. Check if the domain has a WordPress REST API for this post slug
    const segments = targetObj.pathname.split('/').filter(Boolean);
    const lastSeg = segments[segments.length - 1];
    if (lastSeg && !lastSeg.includes('.') && !lastSeg.startsWith('wp-')) {
      try {
        const wpApiUrl = `${targetObj.origin}/wp-json/wp/v2/posts?slug=${encodeURIComponent(lastSeg)}`;
        const wpRes = await fetch(wpApiUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
        });
        if (wpRes.ok) {
          const wpData = await wpRes.json();
          if (Array.isArray(wpData) && wpData.length > 0) {
            return new Response(JSON.stringify({ success: true, type: 'wordpress_acf', data: wpData[0] }), {
              status: 200,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              },
            });
          }
        }
      } catch (e) {}
    }

    // 3. Universal fetch for any website (Result Bharat, Sarkari Result, etc.)
    const fetchRes = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,application/json,*/*;q=0.8',
      },
    });

    const contentType = fetchRes.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await fetchRes.json();
      return new Response(JSON.stringify({ success: true, type: 'json', data }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } else {
      const html = await fetchRes.text();
      return new Response(JSON.stringify({ success: true, type: 'html', html }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
