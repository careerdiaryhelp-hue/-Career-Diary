const links = [
  "RRB Ajmer Result",
  "RRB Ajmer Cutoff",
  "RRB Allahabad Result",
  "UP Police Cutoff 2026",
  "Download Result",
  "Check Result",
  "Result (Server 1)",
  "Apply Online Link",
  "Apply Online (Registration)",
  "Apply Online - Login"
];

for (let k of links) {
  let base = k.trim();
  let type = 'Click Here';
  const lowerLabel = k.toLowerCase();

  if ((lowerLabel.includes('result') || lowerLabel.includes('cutoff') || lowerLabel.includes('cut off')) && !lowerLabel.includes('answer')) {
    const resMatch = k.match(/^(.*?)\s*(Result|Cut\s*off)\s*(.*?)$/i);
    
    if (resMatch) {
      let potentialBase = resMatch[1].trim();
      let coreType = resMatch[2].trim();
      let suffix = resMatch[3].trim();

      potentialBase = potentialBase.replace(/^(Download|Check)(?:\s+|$)/i, '').trim();

      if (potentialBase === '') {
        base = 'Download Result / Cutoff';
        type = coreType;
        if (suffix) {
           const sufMatch = suffix.match(/^\((.*?)\)$/);
           if (sufMatch) type = sufMatch[1];
           else type = suffix;
        } else {
           type = 'Click Here';
        }
      } else {
        base = potentialBase;
        type = coreType;
        if (suffix) {
           const sufMatch = suffix.match(/^\((.*?)\)$/);
           if (sufMatch) type += ' ' + sufMatch[1];
           else type += ' ' + suffix;
        }
      }
    }
  } else {
    const match = base.match(/^(.*?)\s*(?:\((.*?)\)|-\s*(.*?)|:\s*(.*?)|(?:\b(Registration|Login|Link|Server \d+|Phase \d+|Notice|List)\b))$/i);
    if (match && (match[2] || match[3] || match[4] || match[5])) {
      base = match[1].trim();
      type = (match[2] || match[3] || match[4] || match[5]).trim();
      if (type.toLowerCase() === 'link') type = 'Click Here';
    }
  }
  
  console.log(`Original: "${k}" -> Base: "${base}", Type: "${type}"`);
}
