async function inspect() {
  const url = "https://sarkariresult.com.cm/rrb-section-controller-03-2026/";
  const { GET } = await import("../src/app/api/proxy/route.js");
  const req = new Request("http://localhost:3000/api/proxy?url=" + encodeURIComponent(url));
  const res = await GET(req);
  const json = await res.json();
  const p = json.data;
  console.log("ACF keys:", Object.keys(p.acf || {}));
  console.log("ACF:", JSON.stringify(p.acf, null, 2));
  console.log("Content length:", p.content?.rendered?.length);
  console.log("Content preview (first 1000 chars):", p.content?.rendered?.slice(0, 1000));
}
inspect();
