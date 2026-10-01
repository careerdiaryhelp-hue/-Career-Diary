const links = {
  "Apply Online": "http://apply",
  "Download Notification": "http://notif",
  "RRB Mumbai (Result)": "http://mumbai-res",
  "RRB Mumbai (Cutoff)": "http://mumbai-cut",
  "RRB Patna (Result)": "http://patna-res",
  "RRB Patna (Admit Card)": "http://patna-ac"
};

const grouped = {};
for (const [k, u] of Object.entries(links)) {
  const match = k.match(/^(.*?)\s*\((.*?)\)$/);
  if (match) {
    const base = match[1].trim();
    const type = match[2].trim();
    if (!grouped[base]) grouped[base] = [];
    grouped[base].push({ type, url: u, originalKey: k });
  } else {
    if (!grouped[k]) grouped[k] = [];
    grouped[k].push({ type: 'Click Here', url: u, originalKey: k });
  }
}

const singleItems = [];
const multiItems = [];
for (const [base, items] of Object.entries(grouped)) {
  if (items.length === 1 && items[0].type === 'Click Here') {
    singleItems.push({ base, items });
  } else {
    multiItems.push({ base, items });
  }
}

let finalHtml = '';

if (multiItems.length > 0) {
  // Extract all unique types
  const allTypes = Array.from(new Set(multiItems.flatMap(x => x.items.map(i => i.type))));
  
  finalHtml += `
  <table border="1" style="width: 100%; border-collapse: collapse; margin: 16px 0; border: 2px solid #000;">
    <thead>
      <tr style="background-color: #008000; color: #fff;">
        <th style="padding: 8px; text-align: center;">Zone / Region Name</th>
        ${allTypes.map(t => `<th style="padding: 8px; text-align: center;">Check ${t}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${multiItems.map(item => `
        <tr>
          <td style="border: 1px solid #000; padding: 8px 12px; font-weight: bold; width: 40%;">${item.base}</td>
          ${allTypes.map(t => {
            const link = item.items.find(i => i.type === t);
            if (link) {
              return `<td style="border: 1px solid #000; padding: 8px 12px; text-align: center;"><a href="${link.url}" target="_blank" style="color: #0000ff; font-weight: bold;">${t}</a></td>`;
            }
            return `<td style="border: 1px solid #000; padding: 8px 12px; text-align: center; color: #d32f2f; font-weight: bold;">Soon</td>`;
          }).join('')}
        </tr>
      `).join('')}
    </tbody>
  </table>`;
}

if (singleItems.length > 0) {
  finalHtml += `
  <table border="1" style="width: 100%; border-collapse: collapse; margin: 16px 0; border: 2px solid #000;">
    <thead>
      <tr>
        <th colspan="2" style="background-color: #ff0080; color: #fff; text-align: center; font-weight: bold; padding: 8px;">Some Useful Important Links</th>
      </tr>
    </thead>
    <tbody>
      ${singleItems.map(item => `
        <tr>
          <td style="border: 1px solid #000; padding: 8px 12px; font-weight: bold; width: 60%;">${item.base}</td>
          <td style="border: 1px solid #000; padding: 8px 12px; text-align: center;"><a href="${item.items[0].url}" target="_blank" style="color: #0000ff; font-weight: bold;">Click Here</a></td>
        </tr>
      `).join('')}
    </tbody>
  </table>`;
}

console.log(finalHtml);
