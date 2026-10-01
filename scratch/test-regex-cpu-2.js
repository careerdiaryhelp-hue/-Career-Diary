const html = "<table class='test'><tr><td>" + "<tr><td>A</td></tr>".repeat(50000) + "</td></tr></table>";
console.time('regex3');
html.replace(/(<table[^>]*>[\s\S]*?(?:SOME IMPORTANT LINKS|Some Useful Important Links|IMPORTANT LINKS)[\s\S]*?)(<\/tbody>|<\/table>)/gi, 'REPLACED');
