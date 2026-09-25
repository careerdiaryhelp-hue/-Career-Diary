import fs from 'fs';

const cleanStr = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.trim();
};

const html = fs.readFileSync('resultbharat.html', 'utf-8');

const parseUniversalJobHtml = (html, pageUrl = '') => {
    if (!html || typeof html !== 'string') return null;

    let title = '';
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (h1Match) title = h1Match[1].replace(/<[^>]+>/g, '').trim();
    if (!title || title.length < 5) {
      const npMatch = html.match(/Name\s+Of\s+Post\s*:?\s*([^<\n\r]+)/i);
      if (npMatch) title = npMatch[1].trim();
    }
    if (!title) {
      const tMatch = html.match(/<title>([^<]+)<\/title>/i);
      if (tMatch) title = tMatch[1].replace(/\|.*$/g, '').trim();
    }
    title = cleanStr(title.replace(/\s*#\w+/g, '').replace(/Name\s+of\s+Post\s*:?\s*/i, '').trim());

    return title;
};

try {
  const parsed = parseUniversalJobHtml(html, 'https://www.resultbharat.com/BTSC-Touring-Veterinary_Fishery-Extension-Officer-2026.html');
  console.log("Success title:", parsed);
} catch(e) {
  console.error("Error:", e);
}
