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

  // 1. Convert any table row containing Telegram where the second/link cell has "Click Here"
  // or plain text or competitor link into an active clickable Career Diary Telegram link.
  out = out.replace(
    /(<tr[^>]*>\s*<(?:td|th)[^>]*>(?:(?!<\/(?:td|th)>)[\s\S])*?telegram(?:(?!<\/(?:td|th)>)[\s\S])*?<\/(?:td|th)>\s*<(?:td|th)[^>]*>)([\s\S]*?)(<\/(?:td|th)>)/gi,
    (match, p1, p2, p3) => {
      return `${p1}<a href="${CAREER_DIARY_TELEGRAM}" target="_blank" rel="noopener noreferrer" style="color: #0000ff; font-weight: bold;">Click Here</a>${p3}`;
    }
  );

  // 2. Convert any table row containing WhatsApp where the second/link cell has "Click Here"
  // or plain text or competitor link into an active clickable Career Diary WhatsApp link.
  out = out.replace(
    /(<tr[^>]*>\s*<(?:td|th)[^>]*>(?:(?!<\/(?:td|th)>)[\s\S])*?whatsapp(?:(?!<\/(?:td|th)>)[\s\S])*?<\/(?:td|th)>\s*<(?:td|th)[^>]*>)([\s\S]*?)(<\/(?:td|th)>)/gi,
    (match, p1, p2, p3) => {
      return `${p1}<a href="${CAREER_DIARY_WHATSAPP}" target="_blank" rel="noopener noreferrer" style="color: #0000ff; font-weight: bold;">Click Here</a>${p3}`;
    }
  );

  // 3. If an Important Links table exists (SOME IMPORTANT LINKS, Some Useful Important Links, IMPORTANT LINKS)
  // and is missing Telegram or WhatsApp rows, automatically insert them before </tbody> or </table>
  out = out.replace(
    /(<table[^>]*>[\s\S]*?(?:SOME IMPORTANT LINKS|Some Useful Important Links|IMPORTANT LINKS)[\s\S]*?)(<\/tbody>|<\/table>)/gi,
    (match, tableBody, closing) => {
      let extraRows = '';
      if (!tableBody.toLowerCase().includes('telegram')) {
        extraRows += `
    <tr>
      <td style="border: 1px solid #000; padding: 8px 12px; font-weight: bold; width: 60%;">Join Telegram Channel</td>
      <td style="border: 1px solid #000; padding: 8px 12px; text-align: center;">
        <a href="${CAREER_DIARY_TELEGRAM}" target="_blank" rel="noopener noreferrer" style="color: #0000ff; font-weight: bold;">Click Here</a>
      </td>
    </tr>`;
      }
      if (!tableBody.toLowerCase().includes('whatsapp')) {
        extraRows += `
    <tr>
      <td style="border: 1px solid #000; padding: 8px 12px; font-weight: bold; width: 60%;">Join WhatsApp Channel</td>
      <td style="border: 1px solid #000; padding: 8px 12px; text-align: center;">
        <a href="${CAREER_DIARY_WHATSAPP}" target="_blank" rel="noopener noreferrer" style="color: #0000ff; font-weight: bold;">Click Here</a>
      </td>
    </tr>`;
      }
      return `${tableBody}${extraRows}\n  ${closing}`;
    }
  );

  // 4. Redirect any competitor Telegram/WhatsApp hyperlinks to official Career Diary channels
  out = out.replace(/href=["']https?:\/\/(?:t\.me|telegram\.me)\/(?!careerdiary)[^"']*["']/gi, `href="${CAREER_DIARY_TELEGRAM}"`);
  out = out.replace(/href=["']https?:\/\/(?:chat\.)?whatsapp\.com\/(?!channel\/0029Va4bvoj6rsQxfA1Pzx2u)[^"']*["']/gi, `href="${CAREER_DIARY_WHATSAPP}"`);

  return out;
};

/**
 * Automatically extracts Direct Quick URLs (applyUrl, notificationUrl, officialUrl)
 * and all custom links from HTML tables, existing link objects, or anchor tags.
 */
export const extractQuickUrlsFromContent = (html, currentLinks = {}) => {
  let applyUrl = '';
  let notificationUrl = '';
  let officialUrl = '';
  const links = { ...(currentLinks || {}) };

  // 1. First inspect currentLinks object if provided
  if (currentLinks && typeof currentLinks === 'object') {
    Object.entries(currentLinks).forEach(([rawKey, val]) => {
      const v = typeof val === 'string' ? val.trim() : (val?.url || val?.link || '');
      if (!v || !v.startsWith('http')) return;
      const k = (rawKey || '').toLowerCase();
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

  // 2. Extract from HTML tables
  if (html && typeof html === 'string') {
    const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let trMatch;
    while ((trMatch = trRegex.exec(html)) !== null) {
      const rowHtml = trMatch[1];
      const aMatches = [...rowHtml.matchAll(/<a[^>]+href=["'](https?:\/\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
      if (aMatches.length > 0) {
        const cellRegex = /<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi;
        const cellMatches = [];
        let cMatch;
        while ((cMatch = cellRegex.exec(rowHtml)) !== null) {
          cellMatches.push(cMatch);
        }
        
        let baseLabel = cellMatches.length >= 2 ? cellMatches[0][1].replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim() : '';
        
        for (const aMatch of aMatches) {
          const href = aMatch[1].trim();
          const aText = aMatch[2] ? aMatch[2].replace(/<[^>]+>/g, '').trim() : '';
          
          let label = baseLabel;
          if (!label) {
            label = aText || 'Important Link';
          } else if (aMatches.length > 1 && aText) {
            // Append the link's text if there are multiple links in this row to differentiate them
            label = `${baseLabel} (${aText})`;
          }

          const kl = label.toLowerCase();
          const hl = href.toLowerCase();

          if (hl.includes('t.me') || hl.includes('whatsapp') || hl.includes('careerdiary.in') || hl.includes('facebook') || hl.includes('twitter') || hl.includes('youtube')) {
            continue;
          }

          if (!links[label]) {
            links[label] = href;
          }

          if (!applyUrl && (kl.includes('apply') || kl.includes('registration') || kl.includes('online form') || kl.includes('otr') || kl.includes('candidate') || hl.includes('apply') || hl.includes('registration') || hl.includes('/otr'))) {
            applyUrl = href;
          }
          if (!notificationUrl && (kl.includes('notif') || kl.includes('pdf') || kl.includes('advertisement') || kl.includes('advt') || kl.includes('notice') || hl.endsWith('.pdf') || hl.includes('/notice/'))) {
            notificationUrl = href;
          }
          if (!officialUrl && (kl.includes('website') || kl.includes('portal') || (kl.includes('official') && !kl.includes('notif')))) {
            officialUrl = href;
          }
        }
      }
    }

    // 3. Fallback: inspect any standalone <a> tag if still missing
    if (!applyUrl || !notificationUrl || !officialUrl) {
      const aRegex = /<a[^>]+href=["'](https?:\/\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
      let aMatch;
      while ((aMatch = aRegex.exec(html)) !== null) {
        const href = aMatch[1].trim();
        const text = aMatch[2].replace(/<[^>]+>/g, '').trim().toLowerCase();
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

