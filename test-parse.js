import fs from 'fs';

const html = fs.readFileSync('resultbharat.html', 'utf-8');

const cleanStr = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .trim();
};

const parseUniversalJobHtml = (html, pageUrl = '') => {
    let title = 'Test Title';
    let org = 'Test Org';
    const shortInfo = 'Short Info';
    const totalPosts = '1018';
    
    // Check 2-column table rows
    const trMatches = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
    
    // 7. Important Links
    const links = {};
    for (const trm of trMatches) {
      const rowHtml = trm[1];
      const aMatch = rowHtml.match(/<a[^>]+href=["'](https?:\/\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/i);
      if (aMatch) {
        let href = aMatch[1];
        const aText = aMatch[2].replace(/<[^>]+>/g, '').trim();
        const cells = [...rowHtml.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)];
        let label = cells.length >= 2 ? cells[0][1].replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim() : aText;
        label = cleanStr(label);
        const ll = label.toLowerCase();
        let hl = href.toLowerCase();
        if (
          !hl.includes('facebook') && !hl.includes('twitter') && !hl.includes('t.me') && !hl.includes('whatsapp') && !hl.includes('youtube') && !hl.includes('instagram') &&
          !ll.includes('join') && !ll.includes('telegram') && !ll.includes('whatsapp') && !ll.includes('app')
        ) {
          if (label && href && !links[label]) links[label] = href;
        }
      }
    }
    return links;
};

console.log(parseUniversalJobHtml(html));
