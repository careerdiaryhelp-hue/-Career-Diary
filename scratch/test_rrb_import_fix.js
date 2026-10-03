async function test() {
  const url = "https://sarkariresult.com.cm/rrb-section-controller-03-2026/";
  console.log("Testing import of URL:", url);

  const isSingleUrl = (url.startsWith('http://') || url.startsWith('https://')) && !url.includes('\n') && !url.includes('<');
  console.log("isSingleUrl:", isSingleUrl);

  const { GET } = await import("../src/app/api/proxy/route.js");
  const req = new Request("http://localhost:3000/api/proxy?url=" + encodeURIComponent(url));
  const res = await GET(req);
  const json = await res.json();

  console.log("Proxy response success:", json.success);
  console.log("Proxy response type:", json.type);

  // Now simulate executeImport(json.data, url)
  const p = json.data;
  const acf = p.acf || {};

  function cleanStr(s) {
    if (!s) return '';
    return String(s).replace(/\s+/g, ' ').trim();
  }
  const clean = (s) => cleanStr(s || '');

  const title = clean(acf.long_post_title || p.title?.rendered || '');
  const rawShortHtml = acf['short_details:'] || acf.short_details || p.excerpt?.rendered || '';
  const shortText = clean(rawShortHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());

  let org = '';
  const orgTagMatch = rawShortHtml.match(/<a[^>]*>([^<]+)<\/a>/i) || rawShortHtml.match(/<strong>([^<]+)<\/strong>/i);
  if (orgTagMatch && orgTagMatch[1] && orgTagMatch[1].length < 80) {
    org = clean(orgTagMatch[1].replace(/,/g, '').trim());
  }

  let category = 'LATEST JOB';
  const tl = title.toLowerCase();
  if (tl.includes('admit card') || tl.includes('exam city') || tl.includes('city details')) {
    category = 'ADMIT CARD';
  } else if (tl.includes('result')) {
    category = 'RESULT';
  }

  console.log("=== FINAL PARSED RESULT ===");
  console.log("Title:", title);
  console.log("Org:", org);
  console.log("Category:", category);
  console.log("Short Description:", shortText.slice(0, 120) + "...");
}

test();
