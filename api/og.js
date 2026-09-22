export default async function handler(req, res) {
  const { path } = req.query;
  
  if (!path) {
    return res.status(200).send(defaultHtml());
  }

  // Exclude static routes from DB lookup
  const staticRoutes = ['admin', 'top-online-forms', 'top-offline-forms', 'state-jobs', 'admit-cards', 'results'];
  if (staticRoutes.includes(path)) {
    return res.status(200).send(defaultHtml());
  }

  try {
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/careerdiary-f2e0a/databases/(default)/documents/jobs/${path}`;
    const response = await fetch(firestoreUrl);
    
    if (!response.ok) {
      return res.status(200).send(defaultHtml());
    }
    
    const data = await response.json();
    
    const title = data.fields?.title?.stringValue || "Career Diary";
    let desc = data.fields?.shortInfo?.stringValue || data.fields?.description?.stringValue || "Latest Indian Govt Jobs, Admit Cards, Answer Keys, Results, Syllabus & Admission Notifications 2026.";
    
    // Truncate description if too long
    if (desc.length > 200) {
      desc = desc.substring(0, 197) + "...";
    }

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <meta name="description" content="${desc}">
  
  <!-- Open Graph / Facebook / WhatsApp / Telegram -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://careerdiary.in/${path}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${desc}">
  
  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="https://careerdiary.in/${path}">
  <meta property="twitter:title" content="${title}">
  <meta property="twitter:description" content="${desc}">
</head>
<body>
  <p>Loading...</p>
</body>
</html>
`;
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400'); // Cache at edge for 1 hour
    return res.status(200).send(html);
  } catch (err) {
    console.error(err);
    return res.status(200).send(defaultHtml());
  }
}

function defaultHtml() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Career Diary - Govt Job Portal</title>
  <meta name="description" content="Latest Indian Govt Jobs, Admit Cards, Answer Keys, Results, Syllabus & Admission Notifications 2026.">
  <meta property="og:title" content="Career Diary - Govt Job Portal">
  <meta property="og:description" content="Latest Indian Govt Jobs, Admit Cards, Answer Keys, Results, Syllabus & Admission Notifications 2026.">
</head>
<body>
</body>
</html>
`;
}
