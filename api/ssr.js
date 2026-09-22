export default async function handler(req, res) {
  const path = req.query.path;
  
  // Exclude static routes from DB lookup
  const staticRoutes = ['admin', 'top-online-forms', 'top-offline-forms', 'state-jobs', 'admit-cards', 'results'];
  
  // Fetch original index.html from Vercel/Cloudflare (using the host header)
  let indexHtml = '';
  try {
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'careerdiary.in';
    const response = await fetch(`${protocol}://${host}/index.html`);
    indexHtml = await response.text();
  } catch(e) {
    console.error('Error fetching index.html:', e);
    return res.status(500).send('Error loading app');
  }

  // If it's a static route or missing path, just return the untouched index.html
  if (!path || staticRoutes.includes(path) || path.includes('.')) {
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(indexHtml);
  }

  // It's a job path, fetch Job details from Firestore
  try {
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/careerdiary-f2e0a/databases/(default)/documents/jobs/${path}`;
    const response = await fetch(firestoreUrl);
    
    if (response.ok) {
      const data = await response.json();
      const title = data.fields?.title?.stringValue || "Career Diary";
      let desc = data.fields?.shortInfo?.stringValue || data.fields?.description?.stringValue || "Latest Indian Govt Jobs, Admit Cards, Answer Keys, Results, Syllabus & Admission Notifications 2026.";
      
      // Truncate description if too long
      if (desc.length > 200) {
        desc = desc.substring(0, 197) + "...";
      }

      // Replace tags in the HTML dynamically
      indexHtml = indexHtml.replace(/<title>.*?<\/title>/s, `<title>${title}</title>`);
      indexHtml = indexHtml.replace(/<meta property="og:title"\s+content=".*?"\s*\/>/s, `<meta property="og:title" content="${title}" />`);
      indexHtml = indexHtml.replace(/<meta name="twitter:title"\s+content=".*?"\s*\/>/s, `<meta name="twitter:title" content="${title}" />`);
      indexHtml = indexHtml.replace(/<meta property="og:description"\s+content=".*?"\s*\/>/s, `<meta property="og:description" content="${desc}" />`);
      indexHtml = indexHtml.replace(/<meta property="og:url"\s+content=".*?"\s*\/>/s, `<meta property="og:url" content="https://careerdiary.in/${path}" />`);
      indexHtml = indexHtml.replace(/<meta name="twitter:description"\s+content=".*?"\s*\/>/s, `<meta name="twitter:description" content="${desc}" />`);
      indexHtml = indexHtml.replace(/<meta name="description"\s+content=".*?"\s*\/>/s, `<meta name="description" content="${desc}" />`);
    }
  } catch (err) {
    console.error('Error modifying HTML:', err);
  }

  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=3600, stale-while-revalidate=86400');
  return res.status(200).send(indexHtml);
}
