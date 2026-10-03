async function testReal() {
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

  const cleanVacancyDetails = (html) => {
    if (!html || typeof html !== 'string') return '';
    let cleaned = html
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

  const cleaned = cleanVacancyDetails(acf.vacancy_details);
  console.log("Cleaned Vacancy Details Length:", cleaned.length);
  console.log("Snippet:", cleaned.slice(0, 1000));
}
testReal();
