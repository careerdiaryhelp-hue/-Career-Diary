export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Only process single-segment paths without dots (job slugs like /sbi-junior-associates-clerk-2026)
    const segments = path.split('/').filter(s => s.length > 0);
    if (segments.length !== 1 || segments[0].includes('.')) {
      return fetch(request);
    }

    const jobSlug = segments[0];

    // Skip known app routes — let them pass through to Vercel
    const staticRoutes = ['admin', 'top-online-forms', 'top-offline-forms', 'state-jobs', 'admit-cards', 'results'];
    if (staticRoutes.includes(jobSlug)) {
      return fetch(request);
    }

    // Fetch Firestore job data and origin page in parallel
    const [firestoreResp, originResp] = await Promise.all([
      fetch(`https://firestore.googleapis.com/v1/projects/careerdiary-f2e0a/databases/(default)/documents/jobs/${jobSlug}`),
      fetch(request),
    ]);

    // If Firestore fetch failed, return original page as-is
    if (!firestoreResp.ok) {
      return originResp;
    }

    let title, desc;
    try {
      const data = await firestoreResp.json();
      title = data.fields?.title?.stringValue;
      desc = data.fields?.shortInfo?.stringValue || data.fields?.seoDescription?.stringValue || '';
      if (desc.length > 200) desc = desc.substring(0, 197) + '...';
    } catch (e) {
      return originResp;
    }

    // If no title found, return original
    if (!title) return originResp;

    const pageUrl = `https://careerdiary.in/${jobSlug}`;

    // Use Cloudflare's HTMLRewriter to modify OG tags in the streamed response
    const rewriter = new HTMLRewriter()
      .on('title', {
        element(el) { el.setInnerContent(title); },
      })
      .on('meta[property="og:title"]', {
        element(el) { el.setAttribute('content', title); },
      })
      .on('meta[property="og:description"]', {
        element(el) { el.setAttribute('content', desc); },
      })
      .on('meta[property="og:url"]', {
        element(el) { el.setAttribute('content', pageUrl); },
      })
      .on('meta[name="description"]', {
        element(el) { el.setAttribute('content', desc); },
      })
      .on('meta[name="twitter:title"]', {
        element(el) { el.setAttribute('content', title); },
      })
      .on('meta[name="twitter:description"]', {
        element(el) { el.setAttribute('content', desc); },
      });

    const modifiedResponse = rewriter.transform(originResp);

    // Create new response with custom headers
    const newHeaders = new Headers(modifiedResponse.headers);
    newHeaders.set('X-SSR', 'cloudflare-worker');
    newHeaders.set('Cache-Control', 'public, max-age=3600');

    return new Response(modifiedResponse.body, {
      status: modifiedResponse.status,
      headers: newHeaders,
    });
  },
};
