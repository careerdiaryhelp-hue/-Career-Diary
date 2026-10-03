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
      // Check if line looks like a real post title or date
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

function parseUniversalJob(rawText, pageUrl = '') {
  const html = sanitizeImportedText(rawText);

  // 1. Title Extraction
  let title = '';
  // A. Check HTML H1
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1Match) title = h1Match[1].replace(/<[^>]+>/g, '').trim();

  // B. Check explicit "Name of Post: XYZ" on same line
  if (!title || title.length < 5) {
    const npMatch = html.match(/(?:Name\s+Of\s+Post|Post\s+Name)[ \t]*:?[ \t]*([^\n\r<]+)/i);
    if (npMatch && npMatch[1].trim().length > 5) {
      const candidate = npMatch[1].trim();
      const cl = candidate.toLowerCase();
      if (!cl.includes('total vacancies') && !cl.includes('total post') && !cl.includes('eligibility')) {
        title = candidate;
      }
    }
  }

  // C. In plain text, after header stripping, the very first non-empty line of the post is almost always the title!
  if (!title || title.length < 5) {
    const rawLines = html.split('\n')
      .map(l => l.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim())
      .filter(Boolean);

    for (const line of rawLines.slice(0, 10)) {
      const ll = line.toLowerCase();
      // Skip date lines or meta lines
      if (ll.startsWith('post date') || ll.startsWith('application start') || ll.startsWith('advertisement') || ll.startsWith('advt')) continue;
      if (line.length >= 10 && line.length <= 150) {
        if (
          ll.includes('recruitment') || ll.includes('online form') || ll.includes('bharti') ||
          ll.includes('admit card') || ll.includes('result') || ll.includes('answer key') ||
          ll.includes('exam date') || ll.includes('notification') || ll.includes('officer') ||
          ll.includes('constable') || ll.includes('teacher') || ll.includes('clerk') || ll.includes('rrb')
        ) {
          title = line;
          break;
        }
      }
    }

    // Fallback: if no keyword match, take first line if it's long enough and not a date
    if (!title && rawLines.length > 0 && rawLines[0].length >= 10 && !rawLines[0].toLowerCase().startsWith('post date')) {
      title = rawLines[0];
    }
  }

  title = cleanStr(title.replace(/\s*#\w+/g, '').replace(/(?:Name\s+of\s+Post|Post\s+Name)\s*:?\s*/i, '').trim());

  // 2. Organization Extraction
  let org = '';
  // Check explicit "Organization Name\n[Org]" or "Organization Name: [Org]"
  const orgExplicit = html.match(/Organization(?:\s+Name)?[ \t]*:?[ \t]*\n?[ \t]*([^\n\r<\[]+)/i);
  if (orgExplicit && orgExplicit[1].trim().length > 3) {
    const cand = orgExplicit[1].trim();
    if (!cand.toLowerCase().includes('post name') && !cand.toLowerCase().includes('total vacancies')) {
      org = cand;
    }
  }

  if (!org) {
    const h2Matches = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)];
    for (const m of h2Matches) {
      const txt = m[1].replace(/<[^>]+>/g, '').trim();
      const tl = txt.toLowerCase();
      if (txt && !tl.includes('important') && !tl.includes('result') && !tl.includes('sarkari') && !tl.includes('apply') && !tl.includes('download') && !tl.includes('link') && txt.length > 3 && txt.length < 120) {
        org = txt;
        break;
      }
    }
  }

  if (!org) {
    // Check markdown link e.g. [Railway Recruitment Board (Ministry of Railway)](http://...)
    const mdOrgMatch = html.match(/\[([^\]]*(?:Recruitment Board|Commission|Agency|Organisation|Organization|Department|Railway|Police|Court|Trust|Authority|NTPC|SSC|UPSC|BPSC|BTSC)[^\]]*)\]/i);
    if (mdOrgMatch) org = mdOrgMatch[1].trim();
  }

  if (!org && title) {
    const parts = title.split(/\s+(?:Recruitment|Online|Bharti|Exam|Various|Technical|Constable|Teacher|CEN|Vacanc)/i);
    if (parts[0] && parts[0].trim().length > 3) org = parts[0].trim();
  }
  org = cleanStr(org) || 'Government Department';

  // 3. Category
  let category = 'LATEST JOB';
  const tl = title.toLowerCase();
  const urlLower = (pageUrl || '').toLowerCase();
  if (urlLower.includes('admit') || tl.includes('admit card') || tl.includes('hall ticket') || tl.includes('exam city') || tl.includes('city details')) category = 'ADMIT CARD';
  else if (urlLower.includes('result') || tl.includes('result') || tl.includes('score card') || tl.includes('cutoff') || tl.includes('cut off') || tl.includes('merit list')) category = 'RESULT';
  else if (urlLower.includes('answer') || tl.includes('answer key') || tl.includes('response sheet') || tl.includes('ans key')) category = 'ANSWER KEY';
  else if (urlLower.includes('syllabus') || tl.includes('exam pattern')) category = 'SYLLABUS';
  else if (urlLower.includes('admission') || tl.includes('entrance') || tl.includes('scholarship')) category = 'ADMISSION';
  else category = 'LATEST JOB';

  // 4. Vacancy / Total Posts
  const cleanBody = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const postMatch = cleanBody.match(/Total\s*(?:Vacancies|Post)?\s*:?\s*([0-9,]+|-)\s*Post/i) || cleanBody.match(/(\d[\d,]*\s*(?:Posts?|पद|Vacanc(?:y|ies)))/i);
  const totalPosts = postMatch ? (postMatch[1] || postMatch[0]).replace(/posts?/i, '').trim() + ' Posts' : '';

  // 5. Dates, Fees, Age
  const dates = {};
  const fees = {};
  const age = {};

  const lines = html.split('\n');
  for (const rawLine of lines) {
    const line = rawLine.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/^[⚫•\-\*]\s*/, '').trim();
    if (line.includes(':') && !line.includes('http') && !line.includes('www.')) {
      const parts = line.split(':');
      const k = cleanStr(parts[0]);
      const v = cleanStr(parts.slice(1).join(':'));
      const kl = k.toLowerCase();
      const vl = v.toLowerCase();

      if (v && v.length < 120) {
        if (kl.includes('age') || (kl.includes('minimum') && !kl.includes('fee')) || (kl.includes('maximum') && !kl.includes('fee')) || kl.includes('relaxation')) {
          if (!age[k]) age[k] = v;
        } else if (
          (kl.includes('date') || kl.includes('start') || kl.includes('begin') || kl.includes('last') || 
           kl.includes('exam') || kl.includes('admit') || kl.includes('answer') || kl.includes('result') || 
           kl.includes('rally') || kl.includes('correction') || kl.includes('city') || kl.includes('status')) &&
          !kl.includes('fee mode') && !kl.includes('refund') && !vl.includes('/-')
        ) {
          if (!dates[k]) dates[k] = v;
        } else if (
          kl.includes('fee') || kl.includes('general') || kl.includes('obc') || kl.includes('all candidates') || kl.includes('sc') || 
          kl.includes('st') || kl.includes('ews') || kl.includes('ph') || kl.includes('female') || vl.includes('/-') || vl.includes('rs') || vl.includes('₹')
        ) {
          if (!fees[k]) fees[k] = v;
        }
      }
    }
  }

  // 6. Important Links
  const links = {};
  const ignoredLabels = [
    'home', 'latest jobs', 'latest job', 'admit card', 'result', 'results',
    'answer key', 'syllabus', 'admission', 'certificate verification', 'important',
    'contact us', 'privacy policy', 'terms & conditions', 'terms of use', 'about us',
    'disclaimer', 'back to all posts', 'top online form', 'top online form 2026',
    'all current job list', 'check career diary', 'www.career diary', 'click here',
    'important link', 'rrbcdg.gov.in', 'short information :', 'short information',
    'english', 'हिन्दी'
  ];

  const ignoredUrls = [
    'https://careerdiary.in/', 'https://careerdiary.in',
    'https://www.careerdiary.in/', 'https://www.careerdiary.in',
    'https://careerdiary.in/latest-jobs', 'https://careerdiary.in/admit-card',
    'https://careerdiary.in/results', 'https://careerdiary.in/answer-key',
    'https://careerdiary.in/syllabus', 'https://careerdiary.in/admission',
    'https://careerdiary.in/contact-us', 'https://careerdiary.in/privacy-policy',
    'https://careerdiary.in/terms', 'https://sarkariresult.com/', 'https://www.sarkariresult.com/'
  ];

  // Plain text / markdown link extraction
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const mdMatches = [...line.matchAll(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g)];
    if (mdMatches.length > 0) {
      const prevLine = cleanStr(lines[i - 1] || '');
      const prefix = (prevLine && prevLine.length < 60 && !prevLine.includes('http') && !prevLine.includes('[')) ? prevLine : '';

      for (const m of mdMatches) {
        let label = cleanStr(m[1]);
        const href = m[2].trim();

        if (prefix && prefix !== label && !label.toLowerCase().includes(prefix.toLowerCase())) {
          label = `${prefix} ${label}`;
        }

        const ll = label.toLowerCase();
        const hl = href.toLowerCase();

        if (ignoredLabels.includes(ll)) continue;
        if (ignoredUrls.some(u => hl === u || hl.startsWith(u))) continue;
        if (hl.includes('facebook') || hl.includes('twitter') || hl.includes('instagram') || hl.includes('youtube')) continue;
        if (ll.startsWith('join telegram') || ll.startsWith('join whatsapp')) continue;

        links[label] = href;
      }
    }
  }

  // HTML <a href> link extraction
  const aMatches = [...html.matchAll(/<a[^>]+href=["'](https?:\/\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
  for (const am of aMatches) {
    const href = am[1].trim();
    const aText = cleanStr(am[2].replace(/<[^>]+>/g, ''));
    const hl = href.toLowerCase();
    const ll = aText.toLowerCase();

    if (ignoredLabels.includes(ll)) continue;
    if (ignoredUrls.some(u => hl === u || hl.startsWith(u))) continue;
    if (hl.includes('facebook') || hl.includes('twitter') || hl.includes('instagram') || hl.includes('youtube')) continue;
    if (ll.startsWith('join telegram') || ll.startsWith('join whatsapp')) continue;

    if (aText && href && !links[aText]) {
      links[aText] = href;
    }
  }

  return {
    title,
    organization: org,
    category,
    totalPosts,
    dates,
    fees,
    age,
    links
  };
}

const rawPasted = fs.readFileSync('./scratch/test_input.js', 'utf8').split('const userText = `')[1].split('`;')[0];
const res = parseUniversalJob(rawPasted);
console.log("=== PARSED RESULT ===");
console.log("Title:", res.title);
console.log("Org:", res.organization);
console.log("Category:", res.category);
console.log("Total Posts:", res.totalPosts);
console.log("Dates count:", Object.keys(res.dates).length);
console.log("Fees count:", Object.keys(res.fees).length);
console.log("Age:", res.age);
console.log("Links count:", Object.keys(res.links).length);
console.log("\nSample Links:");
Object.entries(res.links).slice(0, 10).forEach(([k, v]) => console.log(`  ${k} => ${v}`));
