const html = `<div>` + `This is a long text without tags. `.repeat(10000) + `</div>`; // ~350kb text chunk

console.time("Non-greedy");
let out1 = html.replace(/(>|^)([^<]*?)(<|$)/g, (match, p, t, s) => p + t + s);
console.timeEnd("Non-greedy");

console.time("Greedy");
let out2 = html.replace(/(>|^)([^<]*)(<|$)/g, (match, p, t, s) => p + t + s);
console.timeEnd("Greedy");

console.log("Equal:", out1 === out2);
