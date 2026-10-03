async function testLinksContent() {
  const { GET } = await import("../src/app/api/proxy/route.js");
  const url = "https://sarkariresult.com.cm/rrb-section-controller-03-2026/";
  const req = new Request("http://localhost:3000/api/proxy?url=" + encodeURIComponent(url));
  const res = await GET(req);
  const json = await res.json();
  const post = json.data;
  console.log("=== ACF important_links ===");
  console.log(post.acf.important_links);
}
testLinksContent();
