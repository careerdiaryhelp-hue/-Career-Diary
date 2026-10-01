const targetUrl = encodeURIComponent('https://www.sarkariresult.com/2024/rrb-ntpc-ug-10-2024/');
const proxies = [
  `https://corsproxy.io/?${targetUrl}`,
  `https://api.allorigins.win/raw?url=${targetUrl}`,
  `https://api.codetabs.com/v1/proxy?quest=${targetUrl}`
];

async function testProxies() {
  for (const proxy of proxies) {
    try {
      console.log("Testing:", proxy);
      const res = await fetch(proxy);
      console.log("Status:", res.status);
      const text = await res.text();
      console.log("Len:", text.length);
    } catch (e) {
      console.error("Error:", e.message);
    }
  }
}
testProxies();
