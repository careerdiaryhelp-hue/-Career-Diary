const html = "<table>" + "<tr><td>" + "sarkari result".repeat(50000) + "</td><td>link</td></tr>" + "</table>";

console.time('regex1');
const cr1 = /sarkari\s*result/gi;
html.replace(/(>|^)([^<]+)(<|$)/g, (m, p, t, s) => p + t.replace(cr1, 'CD') + s);
console.timeEnd('regex1');

console.time('regex2');
const cr2 = /sarkari\s*result/gi;
html.replace(/>([^<]+)</g, (m, t) => '>' + t.replace(cr2, 'CD') + '<');
console.timeEnd('regex2');
