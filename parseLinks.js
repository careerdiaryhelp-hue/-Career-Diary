function parseLinks(links) {
  const grouped = {};
  for (const item of links) {
    let base = item.label;
    let type = 'Click Here';

    const lower = item.label.toLowerCase();
    
    if (lower.includes('result') && !lower.includes('cutoff') && !lower.includes('cut off') && !lower.includes('answer')) {
      base = 'Download Result / Cutoff';
      type = 'Result';
    } else if (lower.includes('cutoff') || lower.includes('cut off')) {
      base = 'Download Result / Cutoff';
      type = 'Cutoff';
    } else {
      const match = item.label.match(/^(.*?)\s*(?:\((.*?)\)|-\s*(.*?)|:\s*(.*?))$/);
      if (match && (match[2] || match[3] || match[4])) {
        base = match[1].trim();
        type = (match[2] || match[3] || match[4]).trim();
      }
    }

    if (!grouped[base]) grouped[base] = [];
    grouped[base].push({ type, url: item.url, originalLabel: item.label });
  }
  return grouped;
}

console.log(JSON.stringify(parseLinks([
  {label: "Download Result", url: "url1"},
  {label: "Download Cutoff", url: "url2"},
  {label: "Apply Online Link - Registration", url: "url3"},
  {label: "Apply Online Link (Login)", url: "url4"},
  {label: "Apply Online Link", url: "url5"}
]), null, 2));
