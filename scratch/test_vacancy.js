async function testParseWP() {
  const { GET } = await import("../src/app/api/proxy/route.js");
  const url = "https://sarkariresult.com.cm/rrb-section-controller-03-2026/";
  const req = new Request("http://localhost:3000/api/proxy?url=" + encodeURIComponent(url));
  const res = await GET(req);
  const json = await res.json();
  const wpPost = json.data;

  // Let's test the current parseWordPressPost logic
  // We can view it directly
  console.log("=== RAW VACANCY DETAILS ===");
  console.log(wpPost.acf.vacancy_details);
}
testParseWP();
