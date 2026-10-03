function cleanList(html) {
  if (!html) return [];
  // Parse all top-level or nested items
  // Or extract each <li> text
  const items = [];
  // We can extract <li>...</li>
  // But wait, what if an <li> contains nested <ul>?
  // e.g. Payment Mode:
  // <li>Payment Mode: You can make payment... <ul><li>Debit Card</li>...</ul></li>
  const temp = html.replace(/<\/?span[^>]*>/gi, '').replace(/<\/?strong[^>]*>/gi, '').replace(/<\/?b[^>]*>/gi, '');
  return temp;
}

const feeHtml = `<ul>
 	<li><span style="font-size: 14pt;">For<strong> General / OBC / EWS : ₹ 500/-</strong></span></li>
 	<li><span style="font-size: 14pt;">For<strong> SC / ST / EBC : ₹ 250/- </strong></span></li>
 	<li><span style="font-size: 14pt;">For<strong> All Category female : ₹ 250/-</strong></span></li>
 	<li><span style="font-size: 14pt;"><b>After Appearing in CBT-I Exam</b></span></li>
 	<li><span style="font-size: 14pt;">UR / OBC / EWS Fee Refund : <strong>Rs.</strong> <b>400/-</b></span></li>
 	<li><span style="font-size: 14pt;">SC / ST / PH &amp; Female Refund :<b> Rs. 250/-</b></span></li>
 	<li><span style="font-size: 14pt;"><strong>Payment Mode (Online):</strong> You can make the payment using the following methods:</span>
<ul>
 	<li><span style="font-size: 14pt;">Debit Card</span></li>
 	<li><span style="font-size: 14pt;">Credit Card</span></li>
 	<li><span style="font-size: 14pt;">Internet Banking</span></li>
 	<li><span style="font-size: 14pt;">IMPS</span></li>
 	<li><span style="font-size: 14pt;">Cash Card / Mobile Wallet</span></li>
</ul>
</li>
</ul>`;

console.log(cleanList(feeHtml));
