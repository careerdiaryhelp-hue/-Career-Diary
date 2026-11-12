/**
 * linkUtils.js - Unified utilities for Career Diary link sanitization,
 * auto-linking of Telegram & WhatsApp official channels, and competitor redirect prevention.
 */

export const CAREER_DIARY_TELEGRAM = 'https://t.me/careerdiary';
export const CAREER_DIARY_WHATSAPP = 'https://whatsapp.com/channel/0029Va4bvoj6rsQxfA1Pzx2u';
export const CAREER_DIARY_HOME = 'https://careerdiary.in/';

/**
 * Automatically detects Telegram and WhatsApp channel rows or mentions in HTML tables
 * and turns them into active, clickable <a href="...">Click Here</a> links pointing to
 * Career Diary's official channels.
 * 
 * If an Important Links table exists but lacks Telegram or WhatsApp rows, it appends them automatically.
 */
export const autoLinkSocialChannels = (html) => {
  if (!html || typeof html !== 'string') return '';
  let out = html;

  // 1. Redirect any competitor Telegram/WhatsApp hyperlinks to official Career Diary channels
  out = out.replace(/href=["']https?:\/\/(?:t\.me|telegram\.me)\/(?!careerdiary)[^"']*["']/gi, `href="${CAREER_DIARY_TELEGRAM}"`);
  out = out.replace(/href=["']https?:\/\/(?:chat\.)?whatsapp\.com\/(?!channel\/0029Va4bvoj6rsQxfA1Pzx2u)[^"']*["']/gi, `href="${CAREER_DIARY_WHATSAPP}"`);

  // 2. Find Important Links table and append social links if missing
  const importantKeywords = ['SOME IMPORTANT LINKS', 'Some Useful Important Links', 'IMPORTANT LINKS'];
  let foundKeyword = importantKeywords.find(k => out.includes(k));
  
  if (foundKeyword) {
    const tableStartIndex = out.lastIndexOf('<table', out.indexOf(foundKeyword));
    if (tableStartIndex !== -1) {
      const tableEndIndex = out.indexOf('</table>', tableStartIndex);
      if (tableEndIndex !== -1) {
        const tableContent = out.substring(tableStartIndex, tableEndIndex);
        const lowerTable = tableContent.toLowerCase();
        let extraRows = '';
        
        if (!lowerTable.includes('telegram')) {
          extraRows += `\n<tr><td style="border: 1px solid #000; padding: 8px 12px; font-weight: bold; width: 60%;">Join Telegram Channel</td><td style="border: 1px solid #000; padding: 8px 12px; text-align: center;"><a href="${CAREER_DIARY_TELEGRAM}" target="_blank" rel="noopener noreferrer" style="color: #0000ff; font-weight: bold;">Click Here</a></td></tr>`;
        }
        if (!lowerTable.includes('whatsapp')) {
          extraRows += `\n<tr><td style="border: 1px solid #000; padding: 8px 12px; font-weight: bold; width: 60%;">Join WhatsApp Channel</td><td style="border: 1px solid #000; padding: 8px 12px; text-align: center;"><a href="${CAREER_DIARY_WHATSAPP}" target="_blank" rel="noopener noreferrer" style="color: #0000ff; font-weight: bold;">Click Here</a></td></tr>`;
        }
        
        if (extraRows) {
          const tbodyEndIndex = out.lastIndexOf('</tbody>', tableEndIndex);
          if (tbodyEndIndex !== -1 && tbodyEndIndex > tableStartIndex) {
            out = out.substring(0, tbodyEndIndex) + extraRows + '\n' + out.substring(tbodyEndIndex);
          } else {
            out = out.substring(0, tableEndIndex) + extraRows + '\n' + out.substring(tableEndIndex);
          }
        }
      }
    }
  }

  return out;
};

const getUtf8ByteLength = (str) => {
  const s = String(str || '');
  let bytes = 0;
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i);
    if (code < 0x80) bytes += 1;
    else if (code < 0x800) bytes += 2;
    else if (code >= 0xd800 && code <= 0xdbff && i + 1 < s.length) {
      bytes += 4;
      i++;
    } else {
      bytes += 3;
    }
  }
  return bytes;
};

const stripNonContentTags = (html) =>
  String(html || '')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, ' ');

const cleanExtractedLabel = (str) =>
  String(str || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const BOILERPLATE_LABEL_PREFIX_RE = /^(?:eligibility\s*criteria|short\s*info(?:rmation)?|short\s*details?|latest\s*posts?|related\s*posts?|you\s*may\s*also\s*check|disclaimer|question\s*:|answer\s*:|important\s*questions?|how\s*to\s*fill|mode\s*of\s*selection|candidates?\s+must\s+have)/i;
const GENERIC_ANCHOR_TEXTS = new Set(['click here', 'click here!', 'link', 'here', 'open', 'view', 'download', 'check']);

const isValidLinkLabelKey = (label, maxChars = 140, maxBytes = 220) => {
  if (!label || typeof label !== 'string') return false;
  const trimmed = label.trim();
  if (!trimmed || trimmed.length > maxChars || getUtf8ByteLength(trimmed) > maxBytes) return false;
  if (/^__.*__$/.test(trimmed)) return false;
  if (/[{}]|;base64,|@media|function\s*\(|window\.|document\./i.test(trimmed)) return false;
  if (/^[.#"']/.test(trimmed)) return false;
  if (BOILERPLATE_LABEL_PREFIX_RE.test(trimmed)) return false;
  return true;
};

/**
 * Automatically extracts Direct Quick URLs (applyUrl, notificationUrl, officialUrl)
 * and all custom links from HTML tables, existing link objects, or anchor tags.
 */
export const extractQuickUrlsFromContent = (html, currentLinks = {}) => {
  let applyUrl = '';
  let notificationUrl = '';
  let officialUrl = '';
  const links = {};

  // 1. First inspect & sanitize currentLinks object if provided
  if (currentLinks && typeof currentLinks === 'object') {
    Object.entries(currentLinks).forEach(([rawKey, val]) => {
      const cleanKey = cleanExtractedLabel(rawKey);
      if (!isValidLinkLabelKey(cleanKey)) return;

      const isStrVal = typeof val === 'string';
      const v = isStrVal ? val.trim() : (val?.url || val?.link || '');

      if (isStrVal || v) {
        links[cleanKey] = v;
      }

      if (!v || !v.startsWith('http')) return;
      const k = cleanKey.toLowerCase();
      const vl = v.toLowerCase();
      if (vl.includes('t.me') || vl.includes('whatsapp') || vl.includes('careerdiary.in')) return;

      if (!applyUrl && (k.includes('apply') || k.includes('registration') || k.includes('online form') || k.includes('login') || k.includes('otr') || k.includes('candidate'))) {
        applyUrl = v;
      }
      if (!notificationUrl && (k.includes('notif') || k.includes('pdf') || k.includes('advt') || k.includes('notice') || k.includes('advertisement') || vl.endsWith('.pdf') || vl.includes('/notice/'))) {
        notificationUrl = v;
      }
      if (!officialUrl && (k.includes('website') || k.includes('portal') || (k.includes('official') && !k.includes('notif')))) {
        officialUrl = v;
      }
    });
  }

  // 2. Extract from HTML tables (stripping scripts/styles/svgs/comments first)
  if (html && typeof html === 'string') {
    const cleanHtml = stripNonContentTags(html);
    const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let trMatch;
    while ((trMatch = trRegex.exec(cleanHtml)) !== null) {
      const rowHtml = trMatch[1];
      const aMatches = [...rowHtml.matchAll(/<a[^>]+href=["'](https?:\/\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
      if (aMatches.length > 0) {
        const cellRegex = /<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi;
        const cellMatches = [];
        let cMatch;
        while ((cMatch = cellRegex.exec(rowHtml)) !== null) {
          cellMatches.push(cMatch);
        }

        const firstCellHtml = cellMatches.length >= 2 ? cellMatches[0][1] : '';
        const hasNestedBlockContainer = /<(?:table|tr|tbody|thead|ul|ol)\b/i.test(firstCellHtml);
        const rawBaseLabel = (!hasNestedBlockContainer && firstCellHtml) ? cleanExtractedLabel(firstCellHtml) : '';
        const baseLabel = isValidLinkLabelKey(rawBaseLabel, 120, 200) ? rawBaseLabel : '';

        for (const aMatch of aMatches) {
          const href = aMatch[1].trim();
          const aText = aMatch[2] ? cleanExtractedLabel(aMatch[2]) : '';

          let label = baseLabel;
          if (!label) {
            label = (isValidLinkLabelKey(aText, 120, 200) && !GENERIC_ANCHOR_TEXTS.has(aText.toLowerCase())) ? aText : '';
          } else if (aMatches.length > 1 && aText) {
            const combined = `${baseLabel} (${aText})`;
            label = isValidLinkLabelKey(combined, 140, 220) ? combined : baseLabel;
          }

          const signalText = (label || aText || '').toLowerCase();
          const hl = href.toLowerCase();

          if (hl.includes('t.me') || hl.includes('whatsapp') || hl.includes('careerdiary.in') || hl.includes('facebook') || hl.includes('twitter') || hl.includes('youtube')) {
            continue;
          }

          if (label && isValidLinkLabelKey(label, 140, 220) && !GENERIC_ANCHOR_TEXTS.has(label.toLowerCase()) && !links[label]) {
            links[label] = href;
          }

          if (!applyUrl && (signalText.includes('apply') || signalText.includes('registration') || signalText.includes('online form') || signalText.includes('otr') || signalText.includes('candidate') || hl.includes('apply') || hl.includes('registration') || hl.includes('/otr'))) {
            applyUrl = href;
          }
          if (!notificationUrl && (signalText.includes('notif') || signalText.includes('pdf') || signalText.includes('advertisement') || signalText.includes('advt') || signalText.includes('notice') || hl.endsWith('.pdf') || hl.includes('/notice/'))) {
            notificationUrl = href;
          }
          if (!officialUrl && (signalText.includes('website') || signalText.includes('portal') || (signalText.includes('official') && !signalText.includes('notif')))) {
            officialUrl = href;
          }
        }
      }
    }

    // 3. Fallback: inspect any standalone <a> tag if still missing
    if (!applyUrl || !notificationUrl || !officialUrl) {
      const aRegex = /<a[^>]+href=["'](https?:\/\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
      let aMatch;
      while ((aMatch = aRegex.exec(cleanHtml)) !== null) {
        const href = aMatch[1].trim();
        const text = cleanExtractedLabel(aMatch[2]).toLowerCase();
        const hl = href.toLowerCase();
        if (hl.includes('t.me') || hl.includes('whatsapp') || hl.includes('careerdiary.in') || hl.includes('facebook') || hl.includes('twitter') || hl.includes('youtube')) {
          continue;
        }
        if (!applyUrl && (text.includes('apply') || hl.includes('apply') || hl.includes('registration') || hl.includes('otr'))) {
          applyUrl = href;
        }
        if (!notificationUrl && (text.includes('notif') || text.includes('advt') || hl.endsWith('.pdf') || hl.includes('/notice/'))) {
          notificationUrl = href;
        }
        if (!officialUrl && (text.includes('official') || text.includes('website') || hl.includes('gov.in') || hl.includes('nic.in'))) {
          officialUrl = href;
        }
      }
    }
  }

  // Always ensure Telegram & WhatsApp in links
  links['Join Telegram Channel'] = CAREER_DIARY_TELEGRAM;
  links['Join WhatsApp Channel'] = CAREER_DIARY_WHATSAPP;

  return { applyUrl, notificationUrl, officialUrl, links };
};

