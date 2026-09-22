export default async function handler(req, res) {
  const path = req.query.path || '';

  // Default metadata
  let title = 'CAREER DIARY • GOVT JOB PORTAL | CareerDiary.in';
  let description = 'Career Diary - Latest Indian Govt Jobs, Admit Cards, Answer Keys, Results, Syllabus & Admission Notifications 2026.';
  const pageUrl = 'https://careerdiary.in/' + path;

  // Fetch job details from Firestore for non-static routes
  const staticRoutes = ['admin', 'top-online-forms', 'top-offline-forms', 'state-jobs', 'admit-cards', 'results', ''];
  if (path && !staticRoutes.includes(path)) {
    try {
      const firestoreUrl = 'https://firestore.googleapis.com/v1/projects/careerdiary-f2e0a/databases/(default)/documents/jobs/' + path;
      const response = await fetch(firestoreUrl);
      if (response.ok) {
        const data = await response.json();
        if (data.fields) {
          title = data.fields.title?.stringValue || title;
          const info = data.fields.shortInfo?.stringValue || data.fields.seoDescription?.stringValue || '';
          if (info) {
            description = info.length > 200 ? info.substring(0, 197) + '...' : info;
          }
        }
      }
    } catch (e) {
      // Silently use defaults
    }
  }

  // HTML-escape to prevent XSS
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeTitle = esc(title);
  const safeDesc = esc(description);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=1080, user-scalable=yes, maximum-scale=5.0" />
  <link rel="icon" type="image/png" href="/image.png" />
  <link rel="apple-touch-icon" href="/image.png" />
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDesc}" />
  <link rel="preconnect" href="https://firestore.googleapis.com" />
  <link rel="preconnect" href="https://careerdiary-f2e0a.firebaseapp.com" />

  <!-- Open Graph / WhatsApp / Telegram Preview -->
  <meta property="og:site_name" content="Career Diary" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDesc}" />
  <meta property="og:url" content="${pageUrl}" />
  <meta property="og:image" content="https://careerdiary.in/image.png" />

  <!-- Twitter Preview -->
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDesc}" />
  <meta name="twitter:image" content="https://careerdiary.in/image.png" />

  <!-- Google AdSense -->
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2108299943580613" crossorigin="anonymous"></script>

  <!-- Google Analytics (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-H3WLGYXSW0"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', 'G-H3WLGYXSW0');
  </script>
</head>
<body>
  <div id="root"></div>
  <script>
    // Dynamically load the SPA bundle from the static index.html
    (function() {
      var x = new XMLHttpRequest();
      x.open('GET', '/index.html', true);
      x.onload = function() {
        if (x.status === 200) {
          var p = new DOMParser();
          var d = p.parseFromString(x.responseText, 'text/html');
          // Load CSS
          d.querySelectorAll('link[rel="stylesheet"]').forEach(function(el) {
            var l = document.createElement('link');
            l.rel = 'stylesheet';
            l.href = el.getAttribute('href');
            if (el.getAttribute('crossorigin') !== null) l.crossOrigin = el.getAttribute('crossorigin');
            document.head.appendChild(l);
          });
          // Load JS modules
          d.querySelectorAll('script[type="module"]').forEach(function(el) {
            var s = document.createElement('script');
            s.type = 'module';
            s.src = el.getAttribute('src');
            if (el.getAttribute('crossorigin') !== null) s.crossOrigin = el.getAttribute('crossorigin');
            document.body.appendChild(s);
          });
        }
      };
      x.send();
    })();
  </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('X-SSR', 'career-diary');
  // Tell Cloudflare NOT to cache this response
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.setHeader('CDN-Cache-Control', 'no-store');
  res.setHeader('Cloudflare-CDN-Cache-Control', 'no-store');
  return res.status(200).send(html);
}
