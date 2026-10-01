export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    const getOriginResponse = async (req) => {
      if (env && env.ASSETS) {
        return env.ASSETS.fetch(req);
      }
      return fetch(req);
    };

    // Only process single-segment paths without dots (job slugs like /sbi-junior-associates-clerk-2026)
    const segments = path.split('/').filter(s => s.length > 0);
    if (segments.length !== 1 || segments[0].includes('.')) {
      return getOriginResponse(request);
    }

    const jobSlug = segments[0];

    // Skip known app routes
    const staticRoutes = [
      'admin',
      'top-online-forms',
      'top-offline-forms',
      'state-jobs',
      'admit-cards',
      'results',
      'admit-card',
      'result',
      'latest-jobs',
      'latest-job',
      'answer-key',
      'syllabus',
      'admission',
      'privacy-policy',
      'terms-conditions',
      'contact-us',
      'last-date-jobs'
    ];
    if (staticRoutes.includes(jobSlug)) {
      return getOriginResponse(request);
    }

    // Fetch Firestore job data and origin page in parallel
    const [firestoreResp, originResp] = await Promise.all([
      fetch(`https://firestore.googleapis.com/v1/projects/careerdiary-f2e0a/databases/(default)/documents/jobs/${jobSlug}`),
      getOriginResponse(request),
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
