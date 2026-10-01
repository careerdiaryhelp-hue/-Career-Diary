const html = "<table>" + "<tr><td>" + "A".repeat(50000) + "telegram" + "B".repeat(50000) + "</td><td>link</td></tr>".repeat(100) + "</table>";

console.time('regex1');
html.replace(/(<tr[^>]*>\s*<(?:td|th)[^>]*>(?:(?!<\/(?:td|th)>)[\s\S])*?telegram(?:(?!<\/(?:td|th)>)[\s\S])*?<\/(?:td|th)>\s*<(?:td|th)[^>]*>)([\s\S]*?)(<\/(?:td|th)>)/gi, 'REPLACED');
console.timeEnd('regex1');

console.time('regex2');
const competitorRegex = /sarkari\s*result(?:\.com(?:\.cm)?)?|result\s*bharat(?:\.com)?|rojgar\s*result(?:\.com)?|bigbooster(?:\.in)?/gi;
html.replace(/(>|^)([^<]+)(<|$)/g, (match, prefix, text, suffix) => {
  if (!competitorRegex.test(text)) return match;
  competitorRegex.lastIndex = 0;
  return prefix + text.replace(competitorRegex, 'Career Diary') + suffix;
});
console.timeEnd('regex2');
