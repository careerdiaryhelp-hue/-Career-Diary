const html = `
<table>1. Vacancy Table</table>
<table>2. Eligibility Table</table>
<table>3. You May Also Check table</table>
<table>4. Selection Mode Table</table>
<table>5. WhatsApp table</table>
`;

const bugged = html
  .replace(/<table[^>]*>[\s\S]*?(?:Join\s+Our\s+(?:WhatsApp|Telegram)\s+Channel|t\.me|whatsapp\.com)[\s\S]*?<\/table>/gi, '')
  .replace(/<table[^>]*>[\s\S]*?You\s+May\s+Also\s+Check[\s\S]*?<\/table>/gi, '');

console.log("Bugged output:", JSON.stringify(bugged));
