const start = performance.now();
function cleanJobId(id) {
  if (!id) return '';
  return String(id)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
for(let i=0; i<5000; i++) {
  cleanJobId("Rajasthan State Eligibility Test (SET) Online Form 2026 " + i);
}
console.log(performance.now() - start, "ms");
