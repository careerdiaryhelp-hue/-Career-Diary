const fs = require('fs');

const { sanitizeImportedText } = require('./test_sanitize.js');
const rawPasted = fs.readFileSync('./scratch/test_input.js', 'utf8').split('const userText = `')[1].split('`;')[0];
const cleaned = sanitizeImportedText(rawPasted);

function extractLinks(text) {
  const links = {};
  const ignoredLabels = [
    'home', 'latest jobs', 'latest job', 'admit card', 'result', 'results',
    'answer key', 'syllabus', 'admission', 'certificate verification', 'important',
    'contact us', 'privacy policy', 'terms & conditions', 'terms of use', 'about us',
    'disclaimer', 'back to all posts', 'top online form', 'top online form 2026',
    'all current job list', 'check career diary', 'www.career diary', 'click here',
    'important link', 'rrbcdg.gov.in', 'short information :'
  ];

  const ignoredUrls = [
    'https://careerdiary.in/',
    'https://careerdiary.in',
    'https://www.careerdiary.in/',
    'https://www.careerdiary.in',
    'https://careerdiary.in/latest-jobs',
    'https://careerdiary.in/admit-card',
    'https://careerdiary.in/results',
    'https://careerdiary.in/answer-key',
    'https://careerdiary.in/syllabus',
    'https://careerdiary.in/admission',
    'https://careerdiary.in/contact-us',
    'https://careerdiary.in/privacy-policy',
    'https://careerdiary.in/terms',
    'https://sarkariresult.com/',
    'https://www.sarkariresult.com/'
  ];

  const plainLines = text.split('\n').map(l => l.trim()).filter(Boolean);
  for (let i = 0; i < plainLines.length; i++) {
    const line = plainLines[i];
    
    // Check multiple markdown links on same line e.g. [2 Score Card](url) | [2 Answer Key](url)
    const matches = [...line.matchAll(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g)];
    if (matches.length > 0) {
      const prevLine = (plainLines[i - 1] || '').trim();
      const prefix = (prevLine && prevLine.length < 50 && !prevLine.includes('http') && !prevLine.includes('[')) ? prevLine : '';

      for (const m of matches) {
        let label = m[1].trim();
        const href = m[2].trim();

        if (prefix && prefix !== label) {
          label = `${prefix} ${label}`;
        }

        const ll = label.toLowerCase().trim();
        const hl = href.toLowerCase().trim();

        if (ignoredLabels.includes(ll) && ignoredUrls.some(u => hl === u || hl.startsWith(u))) {
          continue;
        }
        if (ignoredUrls.includes(hl)) {
          continue;
        }
        if (ll.startsWith('join telegram') || ll.startsWith('join whatsapp')) {
          continue;
        }

        links[label] = href;
      }
    }
  }

  return links;
}

const extracted = extractLinks(cleaned);
console.log("Total Clean Links Extracted:", Object.keys(extracted).length);
console.log("\nExtracted Links:");
Object.entries(extracted).forEach(([k, v]) => console.log(`- ${k} => ${v}`));
