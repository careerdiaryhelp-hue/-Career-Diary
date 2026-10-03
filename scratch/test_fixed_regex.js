const html = `
<table>1. Vacancy Table</table>
<table>2. Eligibility Table</table>
<table>3. You May Also Check table</table>
<table>4. Selection Mode Table</table>
<table>5. Join Our WhatsApp Channel table</table>
`;

const fixed = html
  .replace(/<table(?:(?!<table)[\s\S])*?(?:Join\s+Our\s+(?:WhatsApp|Telegram)\s+Channel|t\.me|whatsapp\.com)(?:(?!<table)[\s\S])*?<\/table>/gi, '')
  .replace(/<table(?:(?!<table)[\s\S])*?You\s+May\s+Also\s+Check(?:(?!<table)[\s\S])*?<\/table>/gi, '');

console.log("Fixed output:", fixed);
