const targetUrl = 'https://www.sarkariresult.com/2024/rrb-ntpc-ug-10-2024/';
async function run() {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,application/json,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8',
  };
  try {
    const res = await fetch(targetUrl, { headers });
    console.log("Direct status:", res.status);
    const text = await res.text();
    console.log("Direct len:", text.length);
  } catch (err) {
    console.error(err);
  }
}
run();
