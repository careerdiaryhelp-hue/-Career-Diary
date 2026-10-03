import { readFileSync } from 'fs';

async function testWpFullPipeline() {
  const { GET } = await import("../src/app/api/proxy/route.js");
  const url = "https://sarkariresult.com.cm/rrb-section-controller-03-2026/";
  const req = new Request("http://localhost:3000/api/proxy?url=" + encodeURIComponent(url));
  const res = await GET(req);
  const json = await res.json();
  const post = json.data;
  const acf = post.acf || {};

  function cleanStr(s) {
    if (!s) return '';
    return String(s)
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#8211;/g, '–')
      .replace(/&#8217;/g, "'")
      .replace(/sarkariresult\.com\.cm/gi, 'careerdiary.in')
      .replace(/sarkariresult\.com/gi, 'careerdiary.in')
      .replace(/sarkari\s*result/gi, 'Career Diary')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Format list HTML cleanly
  const formatListHtml = (html) => {
    if (!html || typeof html !== 'string') return '';
    let cleaned = html
      .replace(/sarkariresult\.com\.cm/gi, 'careerdiary.in')
      .replace(/sarkariresult\.com/gi, 'careerdiary.in')
      .replace(/sarkari\s*result/gi, 'Career Diary')
      .replace(/font-size:[^;"]+;?/gi, '')
      .replace(/font-family:[^;"]+;?/gi, '')
      .replace(/background-color:[^;"]+;?/gi, '')
      .replace(/color:[^;"]+;?/gi, '')
      .replace(/<span[^>]*>/gi, '')
      .replace(/<\/span>/gi, '')
      .replace(/\s+class="[^"]*"/gi, '')
      .replace(/\s+data-[a-z-]+="[^"]*"/gi, '')
      .replace(/\s+style=""/gi, '');

    // Format <ul> cleanly
    cleaned = cleaned.replace(/<ul[^>]*>/gi, '<ul style="margin: 0; padding-left: 20px; line-height: 1.8;">');
    return cleaned.trim();
  };

  const cleanVacancyDetails = (html) => {
    if (!html || typeof html !== 'string') return '';
    let cleaned = html
      // Remove WhatsApp / Telegram channel promotional tables and links
      .replace(/<table(?:(?!<table)[\s\S])*?(?:Join\s+Our\s+(?:WhatsApp|Telegram)\s+Channel|t\.me|whatsapp\.com)(?:(?!<table)[\s\S])*?<\/table>/gi, '')
      .replace(/<table(?:(?!<table)[\s\S])*?You\s+May\s+Also\s+Check(?:(?!<table)[\s\S])*?<\/table>/gi, '')
      .replace(/<p[^>]*>[\s\S]*?You\s+May\s+Also\s+Check[\s\S]*?<\/p>/gi, '')
      .replace(/sarkariresult\.com\.cm/gi, 'careerdiary.in')
      .replace(/sarkariresult\.com/gi, 'careerdiary.in')
      .replace(/sarkari\s*result/gi, 'Career Diary');

    // Improve table layout with clean borders
    cleaned = cleaned.replace(/<table([^>]*)>/gi, () => `<table border="1" style="width: 100%; border-collapse: collapse; margin: 16px 0; border: 2px solid #000;">`);
    cleaned = cleaned.replace(/<td([^>]*)>/gi, () => `<td style="border: 1px solid #000; padding: 8px 12px;">`);
    cleaned = cleaned.replace(/<th([^>]*)>/gi, () => `<th style="border: 1px solid #000; padding: 10px; background-color: #008000; color: #fff; text-align: center; font-weight: bold;">`);

    return cleanStr(cleaned);
  };

  // Parse questions from important_links if present
  const extractQuestions = (html) => {
    if (!html) return [];
    const questions = [];
    const qTableMatch = html.match(/<table(?:(?!<table)[\s\S])*?Important\s+Question(?:(?!<table)[\s\S])*?<\/table>/i);
    if (qTableMatch) {
      const qHtml = qTableMatch[0];
      const liMatches = [...qHtml.matchAll(/<li>([\s\S]*?)<\/li>/gi)];
      let curQ = '';
      for (const lim of liMatches) {
        const text = lim[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        if (/^Question\s*:/i.test(text)) {
          curQ = text.replace(/^Question\s*:\s*/i, '').trim();
        } else if (/^Answer\s*:/i.test(text) && curQ) {
          const ans = text.replace(/^Answer\s*:\s*/i, '').trim();
          questions.push({ q: curQ, a: ans });
          curQ = '';
        }
      }
    }
    return questions;
  };

  // Links
  const links = {};
  const trRegex = /<tr>([\s\S]*?)<\/tr>/gi;
  let trMatch;
  while ((trMatch = trRegex.exec(acf.important_links || '')) !== null) {
    const row = trMatch[1];
    if (row.includes('Important Question')) continue;
    const aRegex = /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    let aMatch;
    const aList = [];
    while ((aMatch = aRegex.exec(row)) !== null) {
      aList.push({ href: aMatch[1].trim(), text: cleanStr(aMatch[2].replace(/<[^>]+>/g, '')) });
    }

    const textMatch = row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi);
    if (textMatch && textMatch.length >= 1) {
      const label = cleanStr(textMatch[0].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
      const ll = label.toLowerCase();
      if (ll.includes('telegram') || ll.includes('whatsapp') || ll.includes('mobile app') || ll.includes('android app') || ll.includes('ios app') || ll.includes('sarkari result website')) {
        continue;
      }
      if (aList.length >= 1 && aList[0].href.startsWith('http')) {
        links[label] = aList[0].href;
      }
    }
  }

  links['Join Telegram Channel'] = 'https://t.me/careerdiary';
  links['Join WhatsApp Channel'] = 'https://whatsapp.com/channel/0029Va4bvoj6rsQxfA1Pzx2u';
  links['Check Career Diary'] = 'https://careerdiary.in/';

  const title = cleanStr(acf.long_post_title || post.title?.rendered || '');
  const rawShortHtml = acf['short_details:'] || acf.short_details || post.excerpt?.rendered || '';
  const orgTagMatch = rawShortHtml.match(/<a[^>]*>([^<]+)<\/a>/i) || rawShortHtml.match(/<strong>([^<]+)<\/strong>/i);
  const org = orgTagMatch ? cleanStr(orgTagMatch[1].replace(/,/g, '').trim()) : 'Railway Recruitment Board (RRB)';
  const totalPosts = cleanStr(acf.total_post || '');
  const ageTitle = cleanStr(acf.age_limit_for || 'Age Limit Details');

  const formattedDatesHtml = formatListHtml(acf.important_dates || '');
  const formattedFeesHtml = formatListHtml(acf.application_fee || '');
  const formattedAgeHtml = formatListHtml(acf.age_limits_details || '');
  const cleanedVacancyHtml = cleanVacancyDetails(acf.vacancy_details || '');
  const parsedQuestions = extractQuestions(acf.important_links || '');

  console.log("=== RESULTS ===");
  console.log("Title:", title);
  console.log("Org:", org);
  console.log("Total Posts:", totalPosts);
  console.log("Age Title:", ageTitle);
  console.log("Formatted Dates HTML:\n", formattedDatesHtml);
  console.log("Formatted Fees HTML:\n", formattedFeesHtml);
  console.log("Formatted Age HTML:\n", formattedAgeHtml);
  console.log("Cleaned Vacancy Details Length:", cleanedVacancyHtml.length);
  console.log("Links count:", Object.keys(links).length);
  console.log("Links:\n", links);
  console.log("Parsed Questions count:", parsedQuestions.length);
  console.log("Parsed Questions:\n", parsedQuestions);
}

testWpFullPipeline();
