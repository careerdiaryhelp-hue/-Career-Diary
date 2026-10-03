async function inspect() {
  const url = "https://sarkariresult.com.cm/rrb-section-controller-03-2026/";
  const { GET } = await import("../src/app/api/proxy/route.js");
  const req = new Request("http://localhost:3000/api/proxy?url=" + encodeURIComponent(url));
  const res = await GET(req);
  const json = await res.json();
  const p = json.data;
  for (const [k, v] of Object.entries(p.acf || {})) {
    if (v) {
      console.log(`=== KEY: ${k} ===`);
      console.log(typeof v === 'string' ? v.slice(0, 500) : v);
    }
  }
}
inspect();
