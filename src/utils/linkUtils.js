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
