export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');

    if (!targetUrl) {
      return Response.json({ error: 'Missing "url" query parameter' }, { status: 400 });
    }

    const headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,application/json,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8',
    };

    // 1. Direct WordPress REST API check
    const urlObj = new URL(targetUrl);
    const segments = urlObj.pathname.split('/').filter(Boolean);
    const lastSeg = segments[segments.length - 1];

    if (lastSeg && !lastSeg.includes('.') && !lastSeg.startsWith('wp-')) {
      try {
        const wpApiUrl = `${urlObj.origin}/wp-json/wp/v2/posts?slug=${encodeURIComponent(lastSeg)}`;
        const wpCtrl = new AbortController();
        const wpTimeout = setTimeout(() => wpCtrl.abort(), 6000);
        const wpRes = await fetch(wpApiUrl, { signal: wpCtrl.signal, headers });
        clearTimeout(wpTimeout);
        if (wpRes.ok) {
          const wpData = await wpRes.json();
          if (Array.isArray(wpData) && wpData.length > 0 && (wpData[0].acf || wpData[0].content)) {
            return Response.json({ success: true, type: 'wordpress_acf', data: wpData[0] });
          }
        }
      } catch (_) {}
    }

    // 2. Fetch full HTML of target page
    let html = '';
    try {
      const ctrl = new AbortController();
      const to = setTimeout(() => ctrl.abort(), 12000);
      const res = await fetch(targetUrl, { signal: ctrl.signal, headers });
      clearTimeout(to);
      if (res.ok) {
        html = await res.text();
      }
    } catch (_) {}

    // Fallback if blocked
    if (!html || html.length < 500) {
      const publicProxies = [
        `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`,
        `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
      ];
      for (const p of publicProxies) {
        try {
          const ctrl = new AbortController();
          const to = setTimeout(() => ctrl.abort(), 8000);
          const res = await fetch(p, { signal: ctrl.signal, headers });
          clearTimeout(to);
          if (res.ok) {
            html = await res.text();
            if (html.length > 500) break;
          }
        } catch (_) {}
      }
    }

    if (!html) {
      return Response.json({ error: 'Failed to fetch content from target URL' }, { status: 502 });
    }

    return Response.json({ success: true, type: 'html', html });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
