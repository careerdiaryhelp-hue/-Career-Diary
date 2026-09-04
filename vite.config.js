import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

function proxyPlugin() {
  return {
    name: 'api-proxy-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/proxy')) {
          return next();
        }
        try {
          const urlObj = new URL(req.url, `http://${req.headers.host}`);
          const targetUrl = urlObj.searchParams.get('url');
          if (!targetUrl) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Missing "url" query parameter' }));
            return;
          }

          const targetObj = new URL(targetUrl);

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
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.end(JSON.stringify({ success: true, type: 'wordpress_acf', data: post }));
              return;
            }
          }

          // 2. Check if the domain has a WordPress REST API for this post slug
          const segments = targetObj.pathname.split('/').filter(Boolean);
          const lastSeg = segments[segments.length - 1];
          if (lastSeg && !lastSeg.includes('.') && !lastSeg.startsWith('wp-')) {
            try {
              const wpApiUrl = `${targetObj.origin}/wp-json/wp/v2/posts?slug=${encodeURIComponent(lastSeg)}`;
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
                  res.setHeader('Content-Type', 'application/json');
                  res.setHeader('Access-Control-Allow-Origin', '*');
                  res.end(JSON.stringify({ success: true, type: 'wordpress_acf', data: wpData[0] }));
                  return;
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
          res.setHeader('Access-Control-Allow-Origin', '*');

          if (contentType.includes('application/json')) {
            const data = await fetchRes.json();
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, type: 'json', data }));
          } else {
            const html = await fetchRes.text();
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, type: 'html', html }));
          }
        } catch (err) {
          console.error('Proxy fetch error:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), proxyPlugin()],
})
