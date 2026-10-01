const fs = require('fs');
const html = `<div><table><tr><td>Some very long content... ` + `bla bla `.repeat(50000) + `</td><td>telegram</td></tr></table></div>`;

console.time("autoLinkSocialChannels");
let out = html;

out = out.replace(
  /(<tr[^>]*>\s*<(?:td|th)[^>]*>(?:(?!<\/(?:td|th)>)[\s\S])*?telegram(?:(?!<\/(?:td|th)>)[\s\S])*?<\/(?:td|th)>\s*<(?:td|th)[^>]*>)([\s\S]*?)(<\/(?:td|th)>)/gi,
  (match, p1, p2, p3) => {
    return p1 + "REPLACED" + p3;
  }
);

console.timeEnd("autoLinkSocialChannels");
