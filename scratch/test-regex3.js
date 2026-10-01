const html = `<table class="test"><tr><td>SOME IMPORTANT LINKS</td></tr>` + ` bla `.repeat(100000);

console.time("Regex3");
let out = html.replace(
  /(<table[^>]*>[\s\S]*?(?:SOME IMPORTANT LINKS|Some Useful Important Links|IMPORTANT LINKS)[\s\S]*?)(<\/tbody>|<\/table>)/gi,
  (match, p1, p2) => p1 + p2
);
console.timeEnd("Regex3");
