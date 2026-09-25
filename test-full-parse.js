import fs from 'fs';

const html = fs.readFileSync('resultbharat.html', 'utf-8');

const cleanStr = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.trim();
};

const parseUniversalJobHtml = (html, pageUrl = '') => {
    if (!html || typeof html !== 'string') return null;

    // 1. Title
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

    // 2. Organization / Board
    let org = '';
    const h2Matches = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)];
    for (const m of h2Matches) {
      const txt = m[1].replace(/<[^>]+>/g, '').trim();
      const tl = txt.toLowerCase();
      if (txt && !tl.includes('important') && !tl.includes('result') && !tl.includes('sarkari') && !tl.includes('apply') && !tl.includes('download') && !tl.includes('link') && txt.length > 3 && txt.length < 120) {
        org = txt;
        break;
      }
    }
    if (!org) {
      const orgMatch = html.match(/(?:Recruitment Board|Commission|Agency|Organisation|Organization|Department)\s*:?\s*([^\n<]+)/i);
      if (orgMatch) org = orgMatch[1].trim();
    }
    org = cleanStr(org) || 'Government Department';

    // 3. Short Information
    let shortInfo = '';
    const shortMatch = html.match(/Short\s+Information[\s\S]*?<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/i);
    if (shortMatch) {
      shortInfo = shortMatch[1].replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
    } else {
      const metaDesc = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
      if (metaDesc) shortInfo = metaDesc[1].trim();
    }
    shortInfo = cleanStr(shortInfo);

    // 4. Vacancy / Total Posts
    const cleanBody = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    const postMatch = cleanBody.match(/Total\s*:?\s*([0-9,]+|-)\s*Post/i) || cleanBody.match(/(\d[\d,]*\s*(?:Posts?|पद|Vacanc(?:y|ies)))/i);
    const totalPosts = postMatch ? postMatch[1] || postMatch[0] : '';

    // 5. Category detection
    let category = 'LATEST JOB';
    const urlLower = (pageUrl || '').toLowerCase();
    const titleLower = title.toLowerCase();
    if (urlLower.includes('admit') || titleLower.includes('admit card') || titleLower.includes('hall ticket')) category = 'ADMIT CARD';
    else if (urlLower.includes('result') || titleLower.includes('result') || titleLower.includes('score card') || titleLower.includes('cutoff')) category = 'RESULT';
    else if (urlLower.includes('answer') || titleLower.includes('answer key')) category = 'ANSWER KEY';
    else if (urlLower.includes('syllabus') || titleLower.includes('syllabus')) category = 'SYLLABUS';
    else if (urlLower.includes('admission') || titleLower.includes('admission')) category = 'ADMISSION';
    else category = 'LATEST JOB';

    // 6. Dates, Fees, Age
    const dates = {};
    const fees = {};
    const age = {};

    // Check list items
    const liMatches = [...html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)];
    for (const lim of liMatches) {
      const text = lim[1].replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
      if (text.includes(':')) {
        const parts = text.split(':');
        const k = cleanStr(parts[0].trim());
        const v = cleanStr(parts.slice(1).join(':').trim());
        const kl = k.toLowerCase();
        const vl = v.toLowerCase();

        if (kl.includes('age') || (kl.includes('minimum') && !kl.includes('fee')) || (kl.includes('maximum') && !kl.includes('fee')) || kl.includes('relaxation')) {
          if (v && v.length < 120 && !age[k]) age[k] = v;
        } else if (
          (kl.includes('date') || kl.includes('start') || kl.includes('begin') || kl.includes('last') || 
           kl.includes('exam') || kl.includes('admit') || kl.includes('answer') || kl.includes('result') || 
           kl.includes('correction') || kl.includes('city') || kl.includes('schedule') || kl.includes('status')) &&
          !kl.includes('fee mode') && !kl.includes('refund') && !vl.includes('/-')
        ) {
          if (v && v.length < 120 && !dates[k]) dates[k] = v;
        } else if (
          kl.includes('fee') || kl.includes('general') || kl.includes('obc') || kl.includes('sc') || 
          kl.includes('st') || kl.includes('ews') || kl.includes('ph') || kl.includes('pwd') || 
          kl.includes('female') || kl.includes('mode') || vl.includes('/-') || vl.includes('rs') || vl.includes('₹')
        ) {
          if (v && v.length < 150 && !fees[k]) fees[k] = v;
        }
      }
    }

    // Check 2-column table rows
    const trMatches = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
    for (const trm of trMatches) {
      const rowHtml = trm[1];
      const cells = [...rowHtml.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)];
      if (cells.length === 2 && !rowHtml.includes('<a ')) {
        const rawK = cleanStr(cells[0][1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
        const rawV = cleanStr(cells[1][1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
        const kl = rawK.toLowerCase();
        const vl = rawV.toLowerCase();
        if (rawK && rawV && rawK.length < 50 && rawV.length < 100) {
          if (kl.includes('date') || kl.includes('start') || kl.includes('last') || kl.includes('exam') || kl.includes('admit')) {
            if (!dates[rawK]) dates[rawK] = rawV;
          } else if (kl.includes('general') || kl.includes('obc') || kl.includes('sc') || kl.includes('fee') || vl.includes('/-') || vl.includes('rs')) {
            if (!fees[rawK]) fees[rawK] = rawV;
          } else if (kl.includes('age') || kl.includes('min') || kl.includes('max')) {
            if (!age[rawK]) age[rawK] = rawV;
          }
        }
      }
    }

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
          !ll.includes('join') && !ll.includes('telegram') && !ll.includes('whatsapp') && !ll.includes('app') &&
          (ll.includes('apply') || ll.includes('notif') || ll.includes('download') || ll.includes('official') || ll.includes('syllabus') || ll.includes('admit') || ll.includes('result') || ll.includes('answer') || ll.includes('correction') || ll.includes('login') || ll.includes('registration') || ll.includes('city') || ll.includes('career diary') || ll.includes('sarkari'))
        ) {
          if (
            ll.includes('career diary') ||
            ll.includes('careerdiary') ||
            ll.includes('sarkari result') ||
            hl.includes('sarkariresult') ||
            hl.includes('resultbharat') ||
            hl.includes('rojgarresult') ||
            hl.includes('bigbooster')
          ) {
            if (!hl.endsWith('.pdf') && !hl.endsWith('.jpg') && !hl.endsWith('.png') && !hl.endsWith('.jpeg')) {
              href = 'https://careerdiary.in/';
            }
          }
          if (label && href && !links[label]) links[label] = href;
        }
      }
    }

    // Auto-detect specific keys
    let applyUrl = '';
    let notificationUrl = '';
    let officialUrl = '';
    Object.entries(links).forEach(([k, v]) => {
      const kl = k.toLowerCase();
      if (!applyUrl && (kl.includes('apply online') || kl.includes('online form') || kl.includes('registration') || kl.includes('apply'))) applyUrl = v;
      if (!notificationUrl && (kl.includes('notif') || kl.includes('pdf') || kl.includes('advertisement') || kl.includes('advt') || kl.includes('bulletin'))) notificationUrl = v;
      if (!officialUrl && (kl.includes('website') || kl.includes('portal') || (kl.includes('official') && !kl.includes('notif') && !kl.includes('download')))) officialUrl = v;
    });

    let appStart = '';
    let lastDate = '';
    let examDate = '';
    Object.entries(dates).forEach(([k, v]) => {
      const kl = k.toLowerCase();
      if (!appStart && (kl.includes('start') || kl.includes('begin') || kl.includes('from'))) appStart = v;
      if (!lastDate && (kl.includes('last') || kl.includes('end') || kl.includes('closing') || kl.includes('submit'))) lastDate = v;
      if (!examDate && (kl.includes('exam date') || kl === 'exam' || (kl.includes('exam') && !kl.includes('city') && !kl.includes('fee')))) examDate = v;
    });

    let feeGen = '';
    let feeSc = '';
    Object.entries(fees).forEach(([k, v]) => {
      const kl = k.toLowerCase();
      if (!feeGen && (kl.includes('gen') || kl.includes('obc') || kl.includes('ur'))) feeGen = v;
      if (!feeSc && (kl.includes('sc') || kl.includes('st'))) feeSc = v;
    });

    let minAge = '';
    let maxAge = '';
    Object.entries(age).forEach(([k, v]) => {
      const kl = k.toLowerCase();
      if (!minAge && kl.includes('min')) minAge = v;
      if (!maxAge && kl.includes('max')) maxAge = v;
    });

    // Standardized Career Diary table content
    const contentHtml = `
      <table border="1" style="width: 100%; border-collapse: collapse; margin: 16px 0; border: 2px solid #000;">
        <thead>
          <tr>
            <th colspan="2" style="background-color: #ff0080; color: #fff; text-align: center; font-weight: bold; padding: 10px; font-size: 1.15rem;">
              ${org} : ${title}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #000; padding: 8px 12px; font-weight: bold; width: 45%;">Organization Name</td>
            <td style="border: 1px solid #000; padding: 8px 12px;"><strong>${org}</strong></td>
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 8px 12px; font-weight: bold;">Total Vacancies</td>
            <td style="border: 1px solid #000; padding: 8px 12px; color: #008000; font-weight: bold;">${totalPosts || 'Check Official Notification'}</td>
          </tr>
          ${appStart ? `<tr><td style="border: 1px solid #000; padding: 8px 12px; font-weight: bold;">Application Start Date</td><td style="border: 1px solid #000; padding: 8px 12px;">${appStart}</td></tr>` : ''}
          ${lastDate ? `<tr><td style="border: 1px solid #000; padding: 8px 12px; font-weight: bold;">Last Date for Apply</td><td style="border: 1px solid #000; padding: 8px 12px; color: #ff0000; font-weight: bold;">${lastDate}</td></tr>` : ''}
          ${applyUrl ? `<tr><td style="border: 1px solid #000; padding: 8px 12px; font-weight: bold;">Apply Online Direct Link</td><td style="border: 1px solid #000; padding: 8px 12px;"><a href="${applyUrl}" target="_blank" style="color: #0000ff; font-weight: bold;">Click Here</a></td></tr>` : ''}
        </tbody>
      </table>
    `.trim();

    return {
      title,
      organization: org,
      category,
      totalPosts,
      vacancies: totalPosts,
      description: shortInfo,
      content: contentHtml,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      seoTitle: title,
      seoDescription: shortInfo.slice(0, 160),
      importantDates: dates,
      applicationFee: fees,
      ageLimit: age,
      importantLinks: links,
      applyUrl,
      notificationUrl,
      officialUrl,
      appStart,
      lastDate,
      examDate,
      feeGen,
      feeSc,
      minAge,
      maxAge,
    };
};

try {
  const parsed = parseUniversalJobHtml(html, 'https://www.resultbharat.com/BTSC-Touring-Veterinary_Fishery-Extension-Officer-2026.html');
  console.log("Success! Parsed object length:", JSON.stringify(parsed).length);
} catch(e) {
  console.error("Error:", e);
}
