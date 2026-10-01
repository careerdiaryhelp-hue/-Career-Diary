const testCases = [
  "Apply Online (Registration)",
  "Apply Online - Login",
  "Download Admit Card : Server 1",
  "Apply Online Link",
  "Apply Online Registration",
  "Apply Online Login",
  "Download Result",
  "Download Cutoff"
];

for (const base of testCases) {
  let match = base.match(/^(.*?)\s*(?:\((.*?)\)|-\s*(.*?)|:\s*(.*?)|(Registration|Login|Link|Server \d+|Phase \d+|Notice|List))$/i);
  if (match && (match[2] || match[3] || match[4] || match[5])) {
    console.log(`[${base}] -> Base: '${match[1].trim()}', Type: '${(match[2] || match[3] || match[4] || match[5]).trim()}'`);
  } else {
    console.log(`[${base}] -> No match`);
  }
}
