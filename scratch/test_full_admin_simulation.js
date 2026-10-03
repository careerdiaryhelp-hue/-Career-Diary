const fs = require('fs');

function cleanStr(s) {
  if (!s) return '';
  return String(s).replace(/\s+/g, ' ').trim();
}

function sanitizeImportedText(text) {
  if (!text) return '';

  let cleaned = String(text);

  // 1. Remove HTML Header and Nav elements
  cleaned = cleaned
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<div[^>]*class=["'][^"']*(?:header|navbar|nav-bar|top-bar|main-header|menu)[^"']*["'][\s\S]*?<\/div>/gi, '')
    .replace(/<div[^>]*id=["'][^"']*(?:header|navbar|nav-bar|top-bar|main-header|menu)[^"']*["'][\s\S]*?<\/div>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<div[^>]*class=["'][^"']*(?:footer|main-footer|bottom-bar|disclaimer|copyright)[^"']*["'][\s\S]*?<\/div>/gi, '')
    .replace(/<div[^>]*id=["'][^"']*(?:footer|main-footer|bottom-bar|disclaimer|copyright)[^"']*["'][\s\S]*?<\/div>/gi, '');

  // 2. Cut everything before post title if navigation keywords are detected at the top
  const headerMarkers = [
    /Back to All Posts/i,
    /Home\s*>\s*[^>\n]+\s*>\s*/i,
    /Skip to content/i,
    /Sarkari Result\s*:\s*SarkariResult\.Com/i,
    /WWW\.SARKARIRESULT\.COM/i,
    /WWW\.CAREERDIARY\.IN/i,
  ];

  for (const marker of headerMarkers) {
    const match = cleaned.match(marker);
    if (match && match.index < 1500) {
      cleaned = cleaned.slice(match.index + match[0].length);
      break;
    }
  }

  // 3. Strip leading lines that are purely navbar/brand links
  const navKeywords = [
    'career diary', 'sarkari result', 'sarkariresult', 'result bharat', 'rojgar result',
    'home', 'latest jobs', 'latest job', 'admit card', 'result', 'results',
    'answer key', 'syllabus', 'admission', 'certificate verification', 'important',
    'contact us', 'english', 'हिन्दी', 'search jobs', 'back to all posts', 'govt job portal'
  ];

  let lines = cleaned.split('\n');
  let firstValidLineIndex = 0;

  for (let i = 0; i < Math.min(lines.length, 35); i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cleanLine = line
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .replace(/<[^>]+>/g, '')
      .trim()
      .toLowerCase();

    const isNav = navKeywords.some(kw => cleanLine === kw || cleanLine.startsWith(kw + ' •') || cleanLine.startsWith(kw + ' -') || cleanLine.includes('• govt job portal'));
    if (isNav) {
      firstValidLineIndex = i + 1;
    } else {
      if (line.length > 10 && !cleanLine.includes('careerdiary') && !cleanLine.includes('sarkariresult') && !cleanLine.includes('back to all')) {
        firstValidLineIndex = i;
        break;
      }
    }
  }

  if (firstValidLineIndex > 0) {
    cleaned = lines.slice(firstValidLineIndex).join('\n');
  }

  // 4. Remove Footer Blocks (Disclaimers, FAQs, Related Posts, Social Media, Quick Categories)
  const footerMarkers = [
    /Frequently Asked Questions\s*\(FAQs\)/i,
    /Important Question/i,
    /Question:\s*When will the online application/i,
    /You May Also Check\s*:/i,
    /Latest Posts\s*\n\s*👉/i,
    /Related Posts\s*\n\s*👉/i,
    /Disclaimer\s*:\s*Information regarding/i,
    /Join Us On Social Media Platforms/i,
    /👉\s*Go to home/i,
    /Quick Categories\s*\n/i,
    /Popular Exam Alerts\s*\n/i,
    /©\s*\d{4}[–-]\d{4}\s*Career Diary/i,
    /©\s*Copyright\s*\d{4}/i,
    /All Rights Reserved/i,
    /Download Mobile Apps/i
  ];

  let earliestFooterIndex = cleaned.length;
  for (const marker of footerMarkers) {
    const match = cleaned.match(marker);
    if (match && match.index < earliestFooterIndex) {
      earliestFooterIndex = match.index;
    }
  }

  if (earliestFooterIndex < cleaned.length) {
    cleaned = cleaned.slice(0, earliestFooterIndex);
  }

  return cleaned.trim();
}

const rawPasted = fs.readFileSync('./scratch/test_input.js', 'utf8').split('const userText = `')[1].split('`;')[0];
const sanitized = sanitizeImportedText(rawPasted);
console.log("Sanitized preview (first 500 chars):\n", sanitized.slice(0, 500));
console.log("\nSanitized preview (last 500 chars):\n", sanitized.slice(-500));
