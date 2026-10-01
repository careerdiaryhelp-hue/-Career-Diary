const html = "<table>" + "<tr><td>" + "A".repeat(100000) + "</td><td>link</td></tr>" + "</table>";

console.time('regex1');
html.replace(/(<tr[^>]*>\s*<(?:td|th)[^>]*>(?:(?!<\/(?:td|th)>)[\s\S])*?telegram(?:(?!<\/(?:td|th)>)[\s\S])*?<\/(?:td|th)>\s*<(?:td|th)[^>]*>)([\s\S]*?)(<\/(?:td|th)>)/gi, 'REPLACED');
console.timeEnd('regex1');
