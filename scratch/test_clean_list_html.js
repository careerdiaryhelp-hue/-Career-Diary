function formatCleanListHtml(rawHtml) {
  if (!rawHtml || typeof rawHtml !== 'string') return '';

  // Clean unwanted styling and competitor mentions
  let html = rawHtml
    .replace(/sarkariresult\.com\.cm/gi, 'careerdiary.in')
    .replace(/sarkariresult\.com/gi, 'careerdiary.in')
    .replace(/sarkari\s*result/gi, 'Career Diary')
    .replace(/font-size:[^;"]+;?/gi, '')
    .replace(/font-family:[^;"]+;?/gi, '')
    .replace(/background-color:[^;"]+;?/gi, '')
    .replace(/color:[^;"]+;?/gi, '');

  // Clean empty spans, class attributes, data-* attributes
  html = html
    .replace(/<span[^>]*>/gi, '')
    .replace(/<\/span>/gi, '')
    .replace(/\s+class="[^"]*"/gi, '')
    .replace(/\s+data-[a-z-]+="[^"]*"/gi, '')
    .replace(/\s+style=""/gi, '');

  // Ensure <ul> has standard Career Diary styling
  html = html.replace(/<ul[^>]*>/gi, '<ul style="margin: 0; padding-left: 20px; line-height: 1.8;">');

  return html.trim();
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

console.log("Formatted fee HTML:\n", formatCleanListHtml(feeHtml));
