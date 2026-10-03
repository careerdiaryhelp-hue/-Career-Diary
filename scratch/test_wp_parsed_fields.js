async function testFullWpImport() {
  const { GET } = await import("../src/app/api/proxy/route.js");
  const url = "https://sarkariresult.com.cm/rrb-section-controller-03-2026/";
  const req = new Request("http://localhost:3000/api/proxy?url=" + encodeURIComponent(url));
  const res = await GET(req);
  const json = await res.json();
  const post = json.data;

  // Let's run the exact parseWordPressPost logic from AdminDashboardPage.jsx
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
      .replace(/career\s*diary/gi, 'Career Diary')
      .replace(/sarkari\s*result/gi, 'Career Diary')
      .replace(/sarkariresult/gi, 'Career Diary')
      .replace(/resultbharat/gi, 'Career Diary')
      .replace(/rojgarresult/gi, 'Career Diary')
      .replace(/bigbooster/gi, 'Career Diary')
      .replace(/\s+/g, ' ')
      .trim();
  }
  const clean = (s) => cleanStr(s || '');

  const title = clean(acf.long_post_title || post.title?.rendered || '');
  const rawShortHtml = acf['short_details:'] || acf.short_details || post.excerpt?.rendered || '';
  const shortText = clean(rawShortHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());

  let org = '';
  const orgTagMatch = rawShortHtml.match(/<a[^>]*>([^<]+)<\/a>/i) || rawShortHtml.match(/<strong>([^<]+)<\/strong>/i);
  if (orgTagMatch && orgTagMatch[1] && orgTagMatch[1].length < 80) {
    org = clean(orgTagMatch[1].replace(/,/g, '').trim());
  }

  const totalPosts = clean(acf.total_post || '');

  const parseList = (html) => {
    const res = {};
    if (!html) return res;
    const regex = /<li>([\s\S]*?)<\/li>/gi;
    let m;
    while ((m = regex.exec(html)) !== null) {
      const text = m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      const parts = text.split(/\s*:\s*/);
      if (parts.length >= 2) {
        const k = clean(parts[0].trim());
        const v = clean(parts.slice(1).join(': ').trim());
        if (k && v) res[k] = v;
      }
    }
    return res;
  };

  const dates = parseList(acf.important_dates || '');
  const fees = parseList(acf.application_fee || '');
  const age = parseList(acf.age_limits_details || '');

  console.log("=== PARSED DATES ===", dates);
  console.log("=== PARSED FEES ===", fees);
  console.log("=== PARSED AGE ===", age);
  console.log("=== TOTAL POSTS ===", totalPosts);
  console.log("=== ORG ===", org);
  console.log("=== TITLE ===", title);
}
testFullWpImport();
