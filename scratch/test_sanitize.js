const fs = require('fs');

// Function to clean raw pasted content (HTML or plain text or markdown)
function sanitizeImportedText(text) {
  if (!text) return '';

  let cleaned = text;

  // 1. Remove obvious navigation / header blocks at the start
  // Detect patterns like:
  // [CAREER DIARY...](...)
  // English | हिन्दी
  // [Home] [Latest Jobs] [Admit Card] ...
  // Back to All Posts
  
  // Cut everything before the actual Post Title / Post Date / Name of Post if header exists
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
    if (match && match.index < 1000) {
      cleaned = cleaned.slice(match.index + match[0].length);
      break;
    }
  }

  // Also strip any leading lines that are pure navbar links
  const navKeywords = [
    'career diary', 'sarkari result', 'sarkariresult', 'result bharat', 'rojgar result',
    'home', 'latest jobs', 'latest job', 'admit card', 'result', 'results',
    'answer key', 'syllabus', 'admission', 'certificate verification', 'important',
    'contact us', 'english', 'हिन्दी', 'search jobs', 'back to all posts'
  ];

  let lines = cleaned.split('\n');
  let firstValidLineIndex = 0;

  for (let i = 0; i < Math.min(lines.length, 30); i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cleanLine = line
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .replace(/<[^>]+>/g, '')
      .trim()
      .toLowerCase();

    // Check if this line is just a navigation item
    const isNav = navKeywords.some(kw => cleanLine === kw || cleanLine.startsWith(kw + ' •') || cleanLine.startsWith(kw + ' -'));
    if (isNav) {
      firstValidLineIndex = i + 1;
    } else {
      // If line looks like a real post title (e.g. contains 'Recruitment', 'Result', 'CEN', 'Admit Card', 'Vacanc', etc. and is long)
      if (line.length > 15 && !line.includes('CAREERDIARY.IN') && !line.includes('SARKARIRESULT')) {
        firstValidLineIndex = i;
        break;
      }
    }
  }

  if (firstValidLineIndex > 0) {
    cleaned = lines.slice(firstValidLineIndex).join('\n');
  }

  // 2. Remove Footer Blocks (Disclaimers, FAQs, Related Posts, Social Media, Quick Categories)
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
const cleaned = sanitizeImportedText(rawPasted);
console.log("Original lines:", rawPasted.split('\n').length);
console.log("Cleaned lines:", cleaned.split('\n').length);
console.log("\n--- FIRST 5 CLEANED LINES ---");
console.log(cleaned.split('\n').slice(0, 5).join('\n'));
console.log("\n--- LAST 5 CLEANED LINES ---");
module.exports = { sanitizeImportedText };
