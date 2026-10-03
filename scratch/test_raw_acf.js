async function testBoth() {
  const { GET } = await import("../src/app/api/proxy/route.js");
  const url = "https://sarkariresult.com.cm/rrb-section-controller-03-2026/";
  const req = new Request("http://localhost:3000/api/proxy?url=" + encodeURIComponent(url));
  const res = await GET(req);
  const json = await res.json();
  const wpPost = json.data;

  console.log("=== WP POST ACF DATA ===");
  console.log("important_dates raw:\n", wpPost.acf.important_dates);
  console.log("application_fee raw:\n", wpPost.acf.application_fee);
  console.log("age_limits_details raw:\n", wpPost.acf.age_limits_details);
  console.log("vacancy_details raw:\n", wpPost.acf.vacancy_details);
  console.log("important_links raw:\n", wpPost.acf.important_links);
}
testBoth();
