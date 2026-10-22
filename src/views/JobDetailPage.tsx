'use client';
import React, { useState } from 'react';
import { ArrowLeft, Send, MessageCircle, Share2, Copy, Check } from 'lucide-react';
import AdSenseBanner, { DisplayAd, InPostAd, InArticleAd1100, MultiplexAd, MultiplexAd1963 } from '../components/AdSenseBanner';
import AutoFAQSection from '../components/AutoFAQSection';
import PostFooterSection from '../components/PostFooterSection';
import { isAdmitCard, isResult, isAnswerKey, isAdmission, getJobUrl } from '../data/categoryHelpers';
import { autoLinkSocialChannels } from '../utils/linkUtils';
import { canServeAds } from '../utils/adShield';

export default function JobDetailPage({ job, onBack, allJobs = [], onSelectJob }) {
  const [copied, setCopied] = useState(false);
  if (!job) return null;

  const getLinkUrl = (...keys) => {
    const rawLinks = job.importantLinks || job.important_links;
    if (rawLinks && typeof rawLinks === 'object') {
      for (const key of keys) {
        const foundKey = Object.keys(rawLinks).find(k => k.toLowerCase().includes(key.toLowerCase()));
        if (foundKey && rawLinks[foundKey] && typeof rawLinks[foundKey] === 'string' && rawLinks[foundKey].startsWith('http')) {
          return rawLinks[foundKey];
        }
      }
    }
    if (job.applyUrl && typeof job.applyUrl === 'string' && job.applyUrl.startsWith('http')) return job.applyUrl;
    if (job.officialUrl && typeof job.officialUrl === 'string' && job.officialUrl.startsWith('http')) return job.officialUrl;
    return null;
  };

  const officialWebUrl = getLinkUrl('official website', 'website', 'portal', 'home') || 'https://www.careerdiary.in';
  const primaryApplyUrl = getLinkUrl('apply', 'registration', 'counselling', 'counseling', 'form', 'login') || job.applyUrl || officialWebUrl;
  const pdfRouteUrl = (job.notificationPdfData || job.pdfData || job.officialPdfData) ? `/api/post-pdf/${job.slug || job.id}` : null;
  const notificationUrl = getLinkUrl('notification', 'brochure', 'rulebook', 'pdf', 'notice') || job.notificationUrl || pdfRouteUrl || officialWebUrl;
  const admitCardUrl = getLinkUrl('admit card', 'admit', 'hall ticket') || officialWebUrl;

  const importantDates = job.importantDates || job.important_dates || {};
  const applicationFee = job.applicationFee || job.application_fee || {};
  const ageLimit = job.ageLimit || job.age_limit || {};
  const vacancyDetails = job.vacancyDetails || job.vacancy_details || [];

  // Helper to sanitize links so Career Diary links point to https://careerdiary.in/
  const sanitizeLink = (label, url) => {
    let cleanLabel = (label || '').trim()
      .replace(/sarkari\s*result(?:\.com(?:\.cm)?)?/gi, 'Career Diary')
      .replace(/result\s*bharat(?:\.com)?/gi, 'Career Diary')
      .replace(/rojgar\s*result(?:\.com)?/gi, 'Career Diary')
      .replace(/bigbooster(?:\.in)?/gi, 'Career Diary');

    let cleanUrl = typeof url === 'string' ? url.trim() : (url?.url || url?.link || '');
    const ul = cleanUrl.toLowerCase();
    const ll = cleanLabel.toLowerCase();

    if (
      ll.includes('career diary') ||
      ll.includes('careerdiary') ||
      ll.includes('sarkari result') ||
      ul.includes('sarkariresult') ||
      ul.includes('resultbharat') ||
      ul.includes('rojgarresult') ||
      ul.includes('bigbooster')
    ) {
      if (!ul.endsWith('.pdf') && !ul.endsWith('.jpg') && !ul.endsWith('.png') && !ul.endsWith('.jpeg')) {
        cleanUrl = 'https://careerdiary.in/';
      }
    }

    return { label: cleanLabel, url: cleanUrl };
  };

  // Build comprehensive normalized list of important links
  const rawLinks = job.importantLinks || job.important_links || {};
  let customLinks = [];

  if (Array.isArray(rawLinks)) {
    rawLinks.forEach(item => {
      if (typeof item === 'string' && item.startsWith('http')) {
        customLinks.push(sanitizeLink('Important Link', item));
      } else if (item && typeof item === 'object') {
        const label = item.label || item.key || item.name || item.title || 'Important Link';
        const url = item.url || item.link || item.href || item.value || '';
        if (label && url) customLinks.push(sanitizeLink(label, url));
      }
    });
  } else if (typeof rawLinks === 'object' && rawLinks !== null) {
    Object.entries(rawLinks).forEach(([label, url]: [string, any]) => {
      const linkUrl = typeof url === 'string' ? url : (url?.url || url?.link || '');
      if (label && linkUrl) {
        customLinks.push(sanitizeLink(label, linkUrl));
      }
    });
  }

  // Filter out any existing telegram / whatsapp to eliminate duplicates
  const nonSocialLinks = customLinks.filter(
    l => !l.label.toLowerCase().includes('telegram') && !l.label.toLowerCase().includes('whatsapp')
  );

  // Guarantee 'Apply Online' is present if available
  const hasApply = nonSocialLinks.some(l => l.label.toLowerCase().includes('apply'));
  if (!hasApply && job.applyUrl && typeof job.applyUrl === 'string' && job.applyUrl.startsWith('http')) {
    nonSocialLinks.unshift({ label: 'Apply Online', url: job.applyUrl });
  }

  // Guarantee 'Download Official Notification PDF' is present if available
  const hasNotif = nonSocialLinks.some(l => l.label.toLowerCase().includes('notif') || l.label.toLowerCase().includes('pdf'));
  if (!hasNotif && job.notificationUrl && typeof job.notificationUrl === 'string' && job.notificationUrl.startsWith('http')) {
    const applyIdx = nonSocialLinks.findIndex(l => l.label.toLowerCase().includes('apply'));
    nonSocialLinks.splice(applyIdx >= 0 ? applyIdx + 1 : 0, 0, {
      label: 'Download Official Notification PDF',
      url: job.notificationUrl
    });
  }

  // Guarantee 'Official Website' is present if available
  const hasOfficial = nonSocialLinks.some(l => l.label.toLowerCase().includes('official') || l.label.toLowerCase().includes('website'));
  if (!hasOfficial && job.officialUrl && typeof job.officialUrl === 'string' && job.officialUrl.startsWith('http')) {
    nonSocialLinks.push({ label: 'Official Website', url: job.officialUrl });
  }

  // Default placeholders if nothing was provided
  if (nonSocialLinks.length === 0) {
    nonSocialLinks.push({
      label: 'Apply Online',
      url: primaryApplyUrl && !primaryApplyUrl.includes('careerdiary.in') ? primaryApplyUrl : null
    });
    nonSocialLinks.push({
      label: 'Download Official Notification PDF',
      url: notificationUrl && !notificationUrl.includes('careerdiary.in') ? notificationUrl : null
    });
    nonSocialLinks.push({
      label: 'Official Website',
      url: officialWebUrl
    });
  }

  // Final table links with social community channels deduplicated at the bottom
  const finalImportantLinks = [
    ...nonSocialLinks,
    { label: 'Check Career Diary', url: 'https://careerdiary.in/' },
    { label: 'Join Telegram Channel', url: 'https://t.me/careerdiary' },
    { label: 'Join WhatsApp Channel', url: 'https://whatsapp.com/channel/0029Va4bvoj6rsQxfA1Pzx2u' },
  ];

  const postDate = job.postDate || job.importantDates?.postDate || null;
  const postUpdateDate = job.postUpdateDate || job.updateDate || (job.updatedAt ? (() => {
    try {
      const d = new Date(job.updatedAt);
      if (isNaN(d.getTime())) return null;
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' });
    } catch (_) {
      return null;
    }
  })() : null);
  const displayUpdateDate = postUpdateDate || postDate;
  const isAdmit = isAdmitCard(job);
  const isRes = isResult(job) || isAnswerKey(job);
  const isAdm = isAdmission(job);

  // Derive all published jobs for cross-linking (SEO & UX) - strictly excluding drafts
  const allPublished = (Array.isArray(allJobs) ? allJobs : []).filter(
    j => j && j.title && j.status !== 'Draft' && j.status !== 'draft'
  );
  const relatedPosts = allPublished
    .filter(j => j && j.id !== job.id && (j.category === job.category || (isAdmit && isAdmitCard(j)) || (isRes && isResult(j))))
    .slice(0, 5);
  const fallbackRelated = relatedPosts.length < 5
    ? allPublished.filter(j => j && j.id !== job.id && !relatedPosts.some(r => r.id === j.id)).slice(0, 5 - relatedPosts.length)
    : [];
  const finalRelatedPosts = [...relatedPosts, ...fallbackRelated];

  const latestPosts = allPublished
    .filter(j => j && j.id !== job.id)
    .slice(0, 5);

  const youMayAlsoCheckJob = finalRelatedPosts[0] || latestPosts[0] || null;

  // Social Sharing URLs & Handler
  const postRelativeUrl = getJobUrl(job);
  const postUrl = typeof window !== 'undefined' && window.location.origin
    ? `${window.location.origin}${postRelativeUrl}`
    : `https://careerdiary.in${postRelativeUrl}`;
  const shareText = `*${job.title || 'Career Diary'}*\nCheck eligibility, important dates & apply online here:\n`;
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + postUrl)}`;
  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(job.title || 'Career Diary')}`;

  const handleCopyLink = () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(postUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (_) {}
  };

  // Rich Intro Variables
  const introOrg = job.organization || 'Government Recruitment Board';
  const introPost = job.postName || job.title;
  const introTotal = job.totalPosts || job.vacancies || (vacancyDetails?.[0]?.Total) || null;
  const introStart = importantDates.applyStart || importantDates['Online Apply Start Date'] || job.appStart || null;
  const introLast = importantDates.lastDate || importantDates.applyLastDate || importantDates['Online Apply Last Date'] || job.appLast || job.lastDate || null;
  const introMinAge = ageLimit.minimum || ageLimit.min || ageLimit['Minimum Age'] || job.minAge || '18 Years';
  const introMaxAge = ageLimit.maximum || ageLimit.max || ageLimit['Maximum Age'] || job.maxAge || '37 Years';
  const introAsOn = ageLimit.asOn || ageLimit['as on'] || ageLimit['As on'] || null;

  const richIntroParagraph = (job.description && job.description.length > 160)
    ? job.description
    : `${introOrg}, has released a notification on official website for the recruitment of ${introPost} Posts.${introTotal ? ` This recruitment is for ${introTotal} positions.` : ''}${introStart ? ` ${introOrg} Application Form will start on ${introStart}` : ''}${introLast ? ` & the candidates can apply till the ${introLast}.` : '.'} Minimum age required is ${introMinAge} & The Maximum Age Is ${introMaxAge}${introAsOn ? ` as on ${introAsOn}` : ''}. Candidates must check the complete details for ${job.title} including eligibility criteria, category-wise vacancy details, application fee, age limits, and mode of selection. Links are given below.`;

  const qualificationText = job.qualification || job.eligibility?.education || job.eligibility?.qualification || (vacancyDetails?.[0]?.Eligibility) || 'Candidate must possess required Educational Qualification from a recognized University or Institution in India.';

  let importantQuestions = [];
  if (isAdmit) {
    importantQuestions = [
      {
        q: `When will the ${job.title} Admit Card be available?`,
        a: `The admit card is available online before the examination. Candidates can download it using the direct link provided in the Important Links section on Career Diary.`
      },
      {
        q: `What is the exam date for ${job.title}?`,
        a: `The examination is scheduled as per the official timeline (${importantDates.examDate || job.examDate || introLast || 'Check Hall Ticket'}). Check your admit card for shift timings.`
      },
      {
        q: `What documents are required at the ${introPost} examination center?`,
        a: `Candidates must carry a clear printed copy of the Admit Card along with a valid Original Photo ID proof (Aadhaar Card, Voter ID, Driving License, or Passport) and recent passport photographs.`
      },
      {
        q: `What is the official website for ${introOrg}?`,
        a: `The official website for ${introOrg} is ${officialWebUrl}.`
      }
    ];
  } else if (isRes) {
    importantQuestions = [
      {
        q: `How to check the official result for ${job.title}?`,
        a: `Visit Career Diary, click on 'Check Result / Score Card' in the Important Links table, and enter your Roll Number or Registration ID to view marks or download the Merit List PDF.`
      },
      {
        q: `Where can I download the ${job.title} Cut Off marks & Merit List PDF?`,
        a: `The category-wise cut-off marks and qualified candidate roll number PDF are available for direct download in the Important Links section above.`
      },
      {
        q: `What is the official website for ${introOrg}?`,
        a: `The official website for ${introOrg} is ${officialWebUrl}.`
      }
    ];
  } else {
    importantQuestions = [
      {
        q: `When will the online application for ${job.title} Start?`,
        a: `The online application for this recruitment will start on ${introStart || 'Declared / Announced'}.`
      },
      {
        q: `What is the last date for online application for ${job.title}?`,
        a: `The last date for online application Form is ${introLast || 'As per notification schedule'}.`
      },
      {
        q: `What is the age limit for ${job.title}?`,
        a: `The age limit for ${job.title} is minimum ${introMinAge} and maximum ${introMaxAge}${introAsOn ? ` as on ${introAsOn}` : ''}. Age relaxation is applicable as per regulations.`
      },
      {
        q: `What is the eligibility for ${job.title}?`,
        a: `${qualificationText} For full eligibility details, please check the official notification.`
      },
      {
        q: `What is the official website for ${introOrg}?`,
        a: `The official website for ${introOrg} is ${officialWebUrl}.`
      }
    ];
  }

  // Sanitize any raw HTML content so external competitor links point to https://careerdiary.in/
  const sanitizedContent = React.useMemo(() => {
    const raw = job?.content || job?.htmlContent || '';
    if (!raw) return '';
    let out = autoLinkSocialChannels(raw.replace(/<\/?message-content>/gi, ''));
    out = out.replace(/href=["']https?:\/\/(?:www\.)?(?:sarkariresult|resultbharat|rojgarresult|bigbooster)[^"']*["']/gi, (match) => {
      const lower = match.toLowerCase();
      if (lower.includes('.pdf') || lower.includes('.jpg') || lower.includes('.png') || lower.includes('.jpeg')) {
        return match;
      }
      return 'href="https://careerdiary.in/"';
    });

    const competitorRegex = /sarkari\s*result(?:\.com(?:\.cm)?)?|result\s*bharat(?:\.com)?|rojgar\s*result(?:\.com)?|bigbooster(?:\.in)?/gi;
    out = out.replace(/>([^<]+)</g, (match, text) => {
      if (!competitorRegex.test(text)) return match;
      competitorRegex.lastIndex = 0;
      return '>' + text.replace(competitorRegex, 'Career Diary') + '<';
    });

    return out;
  }, [job?.content, job?.htmlContent]);

  // Inject in-content AdSense blocks directly into HTML string while preserving 100% tag balance
  const contentWithAds = React.useMemo(() => {
    if (!sanitizedContent || typeof sanitizedContent !== 'string') {
      return '';
    }

    // 1. Google Display Ad Unit (Graphical Banners & Responsive Image Ads - Slot 1202522135)
    const displaySnippet = `<div class="adsense-banner-wrapper incontent-ad" style="margin: 20px auto; text-align: center;"><div class="ad-label" style="font-size:0.65rem;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;font-weight:600;">ADVERTISEMENT</div><ins class="adsbygoogle" style="display:block;width:100%;min-height:90px;" data-ad-client="ca-pub-2108299943580613" data-ad-slot="1202522135" data-ad-format="rectangle, horizontal" data-full-width-responsive="true"></ins></div>`;

    // 2. Google In-Article Native Ad Unit 1 (Slot 2022998762)
    const inArticleSnippet1 = `<div class="adsense-banner-wrapper incontent-ad" style="margin: 20px auto; text-align: center;"><div class="ad-label" style="font-size:0.65rem;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;font-weight:600;">ADVERTISEMENT</div><ins class="adsbygoogle" style="display:block;width:100%;text-align:center;min-height:90px;" data-ad-client="ca-pub-2108299943580613" data-ad-slot="2022998762" data-ad-layout="in-article" data-ad-format="fluid"></ins></div>`;

    // 3. Google In-Article Native Ad Unit 2 (Slot 1100799336)
    const inArticleSnippet2 = `<div class="adsense-banner-wrapper incontent-ad" style="margin: 20px auto; text-align: center;"><div class="ad-label" style="font-size:0.65rem;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;font-weight:600;">ADVERTISEMENT</div><ins class="adsbygoogle" style="display:block;width:100%;text-align:center;min-height:90px;" data-ad-client="ca-pub-2108299943580613" data-ad-slot="1100799336" data-ad-layout="in-article" data-ad-format="fluid"></ins></div>`;

    const tableMatches = Array.from(sanitizedContent.matchAll(/<\/table>/gi));
    const nTables = tableMatches.length;

    let insertionIndices: number[] = [];

    if (nTables >= 2) {
      if (nTables === 2) {
        // 2 tables -> 1 in-content ad after Table 1
        insertionIndices.push(tableMatches[0].index! + tableMatches[0][0].length);
      } else if (nTables === 3) {
        // 3 tables -> 2 in-content ads: after Table 1 and Table 2
        insertionIndices.push(tableMatches[0].index! + tableMatches[0][0].length);
        insertionIndices.push(tableMatches[1].index! + tableMatches[1][0].length);
      } else if (nTables === 4) {
        // 4 tables -> 2 in-content ads: after Table 1 and Table 3
        insertionIndices.push(tableMatches[0].index! + tableMatches[0][0].length);
        insertionIndices.push(tableMatches[2].index! + tableMatches[2][0].length);
      } else if (nTables >= 5 && nTables <= 7) {
        // 5-7 tables -> 3 in-content ads: early, middle, and before last table
        const mid = Math.floor(nTables / 2);
        insertionIndices.push(tableMatches[0].index! + tableMatches[0][0].length);
        insertionIndices.push(tableMatches[mid].index! + tableMatches[mid][0].length);
        insertionIndices.push(tableMatches[nTables - 2].index! + tableMatches[nTables - 2][0].length);
      } else {
        // 8+ tables (long post with syllabus / detailed rules) -> 4-5 in-content ads evenly spaced
        const step = Math.max(2, Math.floor(nTables / 4));
        for (let i = 0; i < nTables - 1; i += step) {
          if (insertionIndices.length >= 5) break;
          insertionIndices.push(tableMatches[i].index! + tableMatches[i][0].length);
        }
        // Always place one before the last table (usually Important Links)
        const lastBeforeFinal = tableMatches[nTables - 2].index! + tableMatches[nTables - 2][0].length;
        if (!insertionIndices.includes(lastBeforeFinal)) {
          insertionIndices.push(lastBeforeFinal);
        }
      }
    } else {
      // 0 or 1 table: Look for paragraph breaks </p> or section headers <h2, <h3
      const breakMatches = Array.from(sanitizedContent.matchAll(/<\/p>|<h[2-4]/gi));
      if (breakMatches.length >= 4) {
        const step = Math.floor(breakMatches.length / 3);
        const idx1 = breakMatches[step].index! + (breakMatches[step][0].startsWith('<h') ? 0 : breakMatches[step][0].length);
        const idx2 = breakMatches[step * 2].index! + (breakMatches[step * 2][0].startsWith('<h') ? 0 : breakMatches[step * 2][0].length);
        insertionIndices.push(idx1, idx2);
      } else if (sanitizedContent.length > 800) {
        const mid = Math.floor(sanitizedContent.length / 2);
        const spaceIdx = sanitizedContent.indexOf(' ', mid);
        if (spaceIdx > 0) insertionIndices.push(spaceIdx);
      }
    }

    // Distribute display banners and in-article native ads harmoniously across the article
    const snippets = [displaySnippet, inArticleSnippet1, inArticleSnippet2, displaySnippet];
    const sortedAsc = Array.from(new Set(insertionIndices)).sort((a, b) => a - b);
    const insertions = sortedAsc.map((idx, i) => ({
      idx,
      snippet: snippets[i % snippets.length]
    }));

    // Sort descending so inserting from back to front never alters previous indices!
    insertions.sort((a, b) => b.idx - a.idx);

    let out = sanitizedContent;
    for (const item of insertions) {
      if (item.idx > 0 && item.idx < out.length) {
        out = out.substring(0, item.idx) + '\n' + item.snippet + '\n' + out.substring(item.idx);
      }
    }

    return out;
  }, [sanitizedContent]);

  // Push AdSense requests for in-article ad units safely after mount & auto-collapse unfilled ads
  React.useEffect(() => {
    if (typeof window === 'undefined' || !canServeAds()) return;

    let retryCount = 0;
    const tryPushInContentAds = () => {
      try {
        const ads = document.querySelectorAll('.sr-rich-html-content ins.adsbygoogle:not([data-adsbygoogle-status])');
        let needsRetry = false;
        ads.forEach((ad: any) => {
          if (!ad.dataset?.adPushDone) {
            const width = ad.offsetWidth || (ad.parentElement && ad.parentElement.offsetWidth) || 0;
            if (width === 0 && retryCount < 4) {
              needsRetry = true;
              return;
            }
            ad.dataset.adPushDone = 'true';
            (window.adsbygoogle = window.adsbygoogle || []).push({});
          }
        });
        if (needsRetry && retryCount < 4) {
          retryCount++;
          setTimeout(tryPushInContentAds, 250);
        }
      } catch (_) {}
    };

    const timer = setTimeout(tryPushInContentAds, 250);

    // Observer: if Google explicitly reports data-ad-status="unfilled", hide wrapper smoothly
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-ad-status') {
          const target = mutation.target as HTMLElement | null;
          if (target && typeof target.getAttribute === 'function' && target.getAttribute('data-ad-status') === 'unfilled') {
            const wrapper = target.closest ? (target.closest('.adsense-banner-wrapper') as HTMLElement | null) : null;
            if (wrapper) {
              wrapper.style.display = 'none';
              wrapper.style.margin = '0';
              wrapper.style.height = '0';
            }
          }
        }
      });
    });

    const richContentEl = document.querySelector('.sr-rich-html-content');
    if (richContentEl) {
      observer.observe(richContentEl, {
        attributes: true,
        subtree: true,
        attributeFilter: ['data-ad-status']
      });
    }

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [contentWithAds]);

  const contentLower = (job?.content || job?.htmlContent || '').toLowerCase();
  const hasHowToFill = contentLower.includes('how to fill') || contentLower.includes('how to apply') || contentLower.includes('how to check');
  const hasSelectionMode = contentLower.includes('mode of selection') || contentLower.includes('selection process');
  const hasFaqSection = contentLower.includes('important question') || contentLower.includes('frequently asked');
  const hasAlsoCheck = contentLower.includes('you may also check');

  // Check if job.content already has its own embedded Important Links table to avoid duplicates
  const hasEmbeddedLinks = Boolean(
    (job.content || job.htmlContent) &&
    (contentLower.includes('important links') ||
     contentLower.includes('click here') ||
     contentLower.includes('sr-links-table'))
  );

  const pageCategory = isAdmit
    ? 'Admit Card'
    : isRes
    ? 'Result'
    : isAdm
    ? 'Admission'
    : job.category || 'Latest Jobs';

  const faqCategory = isAdmit
    ? 'admit'
    : isRes
    ? 'result'
    : isAdm
    ? 'admission'
    : 'job';

  return (
    <div className="container" style={{ paddingTop: '20px', paddingBottom: '40px', maxWidth: '860px', width: '100%', boxSizing: 'border-box' }}>
      {/* Dynamic SEO Meta, Titles & Google Jobs Schema */}

      {/* Back Button */}
      <div style={{ marginBottom: '12px' }}>
        <button onClick={onBack} className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft className="w-4 h-4" /> Back to All Posts
        </button>
      </div>

      {/* Main Detail Container */}
      <div className="sr-detail-container">

        {/* Title */}
        <h1 className="sr-main-title">{job.title}</h1>
        {displayUpdateDate && (
          <div className="sr-post-date">
            <span>Post Update Date: {displayUpdateDate}</span>
          </div>
        )}

        {/* Rich Intro Paragraph (Sarkari Result style) */}
        <div style={{ fontSize: '1rem', lineHeight: '1.7', color: '#111827', margin: '14px 0 18px 0', padding: '14px 18px', backgroundColor: '#f8fafc', borderLeft: '4px solid #0088cc', borderRadius: '4px' }}>
          <a href={officialWebUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#0000ff', fontWeight: 'bold' }}>{introOrg}</a>, has released a notification on official website for the recruitment of <strong>{introPost}</strong>.
          {introTotal ? ` This recruitment is for ${introTotal} positions.` : ''}
          {introStart ? ` ${introOrg} Application Form will start on ${introStart}` : ''}
          {introLast ? ` & the candidates can apply till the ${introLast}.` : '.'}
          {introMinAge ? ` Minimum age required is ${introMinAge} & The Maximum Age Is ${introMaxAge}` : ''}
          {introAsOn ? ` as on ${introAsOn}.` : '.'}
          {' '}Candidates must check the complete details for <strong>{job.title}</strong>. Link are given below.
        </div>

        {/* Social Action Bar: Join Community + 1-Tap Share */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '20px' }}>
          <a
            href="https://t.me/careerdiary"
            target="_blank"
            rel="noopener noreferrer"
            style={{ background: '#0088cc', color: '#fff', padding: '8px 16px', borderRadius: '4px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', textDecoration: 'none' }}
          >
            <Send className="w-4 h-4" /> Join Telegram
          </a>
          <a
            href="https://whatsapp.com/channel/0029Va4bvoj6rsQxfA1Pzx2u"
            target="_blank"
            rel="noopener noreferrer"
            style={{ background: '#25d366', color: '#fff', padding: '8px 16px', borderRadius: '4px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', textDecoration: 'none' }}
          >
            <MessageCircle className="w-4 h-4" /> Join WhatsApp
          </a>
          <a
            href={whatsappShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Share on WhatsApp"
            style={{ background: '#128c7e', color: '#fff', padding: '8px 16px', borderRadius: '4px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', textDecoration: 'none' }}
          >
            <Share2 className="w-4 h-4" /> Share on WhatsApp
          </a>
          <a
            href={telegramShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Share on Telegram"
            style={{ background: '#229ED9', color: '#fff', padding: '8px 16px', borderRadius: '4px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', textDecoration: 'none' }}
          >
            <Send className="w-4 h-4" /> Share on Telegram
          </a>
          <button
            type="button"
            onClick={handleCopyLink}
            style={{ background: copied ? '#16a34a' : '#475569', color: '#fff', padding: '8px 16px', borderRadius: '4px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', border: 'none', cursor: 'pointer', transition: 'background 0.2s' }}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Link Copied!' : 'Copy Link'}
          </button>
        </div>

        {/* AdSense Block Ad #1: Display Ad (Slot 1202522135) */}
        <DisplayAd label="ADVERTISEMENT" style={{ margin: '16px 0' }} />

        {/* If post has HTML content from Visual Editor / Bigbooster, render it directly */}
        {(job.content || job.htmlContent) ? (
          <>
            <div
              className="sr-rich-html-content"
              suppressHydrationWarning
              dangerouslySetInnerHTML={{ __html: contentWithAds }}
            />

            {/* If content does not have You May Also Check */}
            {!hasAlsoCheck && youMayAlsoCheckJob && (
              <div className="sr-you-may-check">
                <span>You May Also Check : </span>
                <a
                  href={`https://careerdiary.in${getJobUrl(youMayAlsoCheckJob)}`}
                  onClick={(e) => {
                    if (onSelectJob) {
                      e.preventDefault();
                      onSelectJob(youMayAlsoCheckJob.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                >
                  {youMayAlsoCheckJob.title}
                </a>
              </div>
            )}

            {/* If content does not have Mode of Selection */}
            {!hasSelectionMode && (
              <>
                <InArticleAd1100 label="ADVERTISEMENT" style={{ margin: '24px 0' }} />
                <table className="sr-table">
                  <tbody>
                    <tr>
                      <td className="sr-table-subheading">{job.title} : Mode Of Selection</td>
                    </tr>
                  <tr>
                    <td>
                      <ol style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8' }}>
                        {job.selectionProcess && Array.isArray(job.selectionProcess) && job.selectionProcess.length > 0 ? (
                          job.selectionProcess.map((step, idx) => <li key={idx}>{step}</li>)
                        ) : (
                          <>
                            <li>Merit List Basis on Marks / Written Examination (CBT)</li>
                            <li>DV &amp; Local Language Test / Skill Test (if applicable)</li>
                            <li>Document Verification (DV)</li>
                            <li>Medical Examination</li>
                          </>
                        )}
                      </ol>
                    </td>
                  </tr>
                </tbody>
              </table>
            </>
          )}

            {/* If content does not have How to Fill */}
            {!hasHowToFill && (
              <table className="sr-table">
                <tbody>
                  <tr>
                    <td className="sr-table-subheading">How To Fill {job.title}</td>
                  </tr>
                  <tr>
                    <td>
                      <ol style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
                        {job.howToFill && Array.isArray(job.howToFill) && job.howToFill.length > 0 ? (
                          job.howToFill.map((step, idx) => (
                            <li key={idx} dangerouslySetInnerHTML={{ __html: step }} />
                          ))
                        ) : (
                          <>
                            <li>Interested candidates who wish to apply for the {introOrg} post can submit their application online before <strong style={{ color: '#ff0000' }}>{introLast || 'As per notification schedule'}</strong>.</li>
                            <li>Use the &quot;Apply Online&quot; link provided below under important link section to apply directly.</li>
                            <li>Alternatively, visit the official website of {introOrg} to complete the application process online.</li>
                            <li>Make sure to complete the application before the deadline <strong style={{ color: '#ff0000' }}>{introLast || 'As per notification schedule'}</strong>.</li>
                            <li><strong>Note –</strong> छात्रो से ये अनुरोध किया जाता है की वो अपना फॉर्म भरने से पहले Official Notification को ध्यान से जरूर पढे उसके बाद ही अपना फॉर्म भरे । (Last Date, Age Limit, &amp; Education Qualification)</li>
                          </>
                        )}
                      </ol>
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
          </>
        ) : (
          <>
            {/* Main Info Table */}
            <table className="sr-table">
              <tbody>
                {/* Pink Heading Row */}
                <tr>
                  <td colSpan={2} className="sr-table-heading">
                    {job.organization || 'Government Recruitment Board'} : {job.postName || job.title}<br />
                    <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>Short Details</span>
                  </td>
                </tr>

                {/* Website / Important Info */}
                <tr>
                  <td style={{ textAlign: 'center', fontWeight: 'bold', width: '50%' }}>
                    <a href={officialWebUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#0000ff', fontWeight: 'bold' }}>
                      {job.organization || 'Official Website'}
                    </a>
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                    Post Name: {job.postName || job.title}
                  </td>
                </tr>
                {(job.vacancies || job.totalPosts) && (
                  <tr>
                    <td colSpan={2} style={{ textAlign: 'center', fontWeight: 'bold', color: '#008000' }}>
                      Total Vacancies: {job.vacancies || job.totalPosts}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Important Dates & Application Fee Table */}
            <table className="sr-table">
              <tbody>
                <tr>
                  <td colSpan={2} className="sr-table-subheading">
                    Important Dates &amp; Application Fee
                  </td>
                </tr>
                <tr>
                  {/* Dates Column */}
                  <td style={{ verticalAlign: 'top', width: '50%', padding: 0 }}>
                    <div className="sr-dates-fees-header">Important Dates</div>
                    <ul className="sr-list">
                      <li>⚫ <strong>Online Apply Start Date :</strong> {importantDates.applyStart || importantDates['Online Apply Start Date'] || job.appStart || 'As per notification'}</li>
                      <li>⚫ <strong>Online Apply Last Date :</strong> <span style={{ color: '#ff0000' }}>{importantDates.lastDate || importantDates.applyLastDate || importantDates['Online Apply Last Date'] || job.appLast || job.lastDate || 'As per notification'}</span></li>
                      <li>⚫ <strong>Last Date For Fee Payment :</strong> {importantDates.feeLastDate || importantDates['Last Date For Fee Payment'] || job.appLast || importantDates.lastDate || 'As per notification'}</li>
                      <li>⚫ <strong>Exam Date :</strong> {importantDates.examDate || importantDates['Exam Date'] || 'Notify Soon'}</li>
                      <li>⚫ <strong>Admit Card :</strong> {importantDates.admitCard || importantDates['Admit Card'] || 'Before Exam'}</li>
                      <li>⚫ <strong>Result Date :</strong> {importantDates.result || importantDates['Result Date'] || 'Will Be Updated Here Soon'}</li>
                      {Object.entries(importantDates)
                        .filter(([k]) => !['applyStart', 'lastDate', 'applyLastDate', 'feeLastDate', 'examDate', 'admitCard', 'result', 'postDate', 'Online Apply Start Date', 'Online Apply Last Date', 'Last Date For Fee Payment', 'Exam Date', 'Admit Card', 'Result Date'].includes(k))
                        .map(([k, v]) => (
                          <li key={k}>⚫ <strong>{k} :</strong> {String(v ?? '')}</li>
                        ))}
                    </ul>
                  </td>

                  {/* Fees Column */}
                  <td style={{ verticalAlign: 'top', padding: 0 }}>
                    <div className="sr-dates-fees-header">Application Fee</div>
                    <ul className="sr-list">
                      <li>⚫ <strong>For General, OBC, EWS :</strong> {applicationFee['For General, OBC, EWS'] || applicationFee['General / OBC / EWS'] || applicationFee.general || job.feeGen || '₹ 500/-'}</li>
                      <li>⚫ <strong>For SC, ST, PH :</strong> {applicationFee['For SC, ST, PH'] || applicationFee['SC / ST'] || applicationFee.sc || job.feeSc || '₹ 00/-'}</li>
                      {Object.entries(applicationFee)
                        .filter(([k]) => !['For General, OBC, EWS', 'General / OBC / EWS', 'For SC, ST, PH', 'SC / ST', 'paymentMode', 'Payment Mode (Online)', 'general', 'sc'].includes(k))
                        .map(([k, v]) => (
                          <li key={k}>⚫ <strong>{k} :</strong> {String(v ?? '')}</li>
                        ))}
                      <li>
                        ⚫ <strong>Payment Mode (Online):</strong> You can make the payment using the following methods:
                        <div style={{ marginTop: '4px', paddingLeft: '14px', color: '#334155' }}>
                          Debit Card, Credit Card, Internet Banking, IMPS, Cash Card / Mobile Wallet, UPI
                        </div>
                      </li>
                    </ul>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Age Limits Table */}
            <table className="sr-table">
              <tbody>
                <tr>
                  <td colSpan={2} className="sr-table-subheading">{job.title} : Age Limits {introAsOn ? `As On ${introAsOn}` : ''}</td>
                </tr>
                <tr>
                  <td style={{ textAlign: 'center', width: '50%' }}>
                    <strong>Minimum Age :</strong> {introMinAge}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <strong>Maximum Age :</strong> {introMaxAge}
                  </td>
                </tr>
                <tr>
                  <td colSpan={2} style={{ textAlign: 'center', color: '#008000' }}>
                    {ageLimit.relaxation || `${introOrg} provides age relaxation for the Apprentice position as per regulations (SC/ST 5 Yrs, OBC 3 Yrs, PwD 10 Yrs).`}
                  </td>
                </tr>
                {introTotal && (
                  <tr>
                    <td colSpan={2} style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.05rem', color: '#b91c1c' }}>
                      Total Post: {introTotal}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Middle In-Post Ad for Standard Template */}
            <InPostAd label="ADVERTISEMENT" style={{ margin: '20px 0' }} />

            {/* Vacancy Details & Eligibility Criteria */}
            <table className="sr-table sr-vacancy-table">
              <thead>
                <tr>
                  <th colSpan={3} className="sr-table-heading">
                    {job.title} : Vacancy Details &amp; Eligibility Criteria
                  </th>
                </tr>
                <tr>
                  <th style={{ width: '35%' }}>Post Name</th>
                  <th style={{ width: '20%' }}>No. Of Post</th>
                  <th style={{ width: '45%' }}>Eligibility Criteria</th>
                </tr>
              </thead>
              <tbody>
                {vacancyDetails.length > 0 ? (
                  vacancyDetails.map((v, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 'bold' }}>{v['Post Name'] || v.postName || v.Post || v.name || job.postName || job.title}</td>
                      <td><strong>{v.Total || v.total || v.vacancies || job.vacancies || 'Check Notification'}</strong></td>
                      <td style={{ textAlign: 'left', lineHeight: '1.6' }}>{v.Eligibility || v.eligibility || qualificationText}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td style={{ fontWeight: 'bold' }}>{job.postName || job.title}</td>
                    <td><strong>{job.vacancies || job.totalPosts || '3500 Posts'}</strong></td>
                    <td style={{ textAlign: 'left', lineHeight: '1.6' }}>{qualificationText}</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* You May Also Check Banner */}
            {youMayAlsoCheckJob && (
              <div className="sr-you-may-check">
                <span>You May Also Check : </span>
                <a
                  href={`https://careerdiary.in${getJobUrl(youMayAlsoCheckJob)}`}
                  onClick={(e) => {
                    if (onSelectJob) {
                      e.preventDefault();
                      onSelectJob(youMayAlsoCheckJob.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                >
                  {youMayAlsoCheckJob.title}
                </a>
              </div>
            )}

            {/* How to Fill Form Table */}
            <table className="sr-table">
              <tbody>
                <tr>
                  <td className="sr-table-subheading">How To Fill {job.title}</td>
                </tr>
                <tr>
                  <td>
                    <ol style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
                      {job.howToFill && Array.isArray(job.howToFill) && job.howToFill.length > 0 ? (
                        job.howToFill.map((step, idx) => (
                          <li key={idx} dangerouslySetInnerHTML={{ __html: step }} />
                        ))
                      ) : (
                        <>
                          <li>Interested candidates who wish to apply for the {introOrg} post can submit their application online before <strong style={{ color: '#ff0000' }}>{introLast || 'As per notification schedule'}</strong>.</li>
                          <li>Use the click here link provided below under important link section to apply directly.</li>
                          <li>Alternatively, visit the official website of {introOrg} to complete the application process online.</li>
                          <li>Make sure to complete the application before the deadline <strong style={{ color: '#ff0000' }}>{introLast || 'As per notification schedule'}</strong>.</li>
                          <li>Keep ready all basic documents (Photograph, Signature, ID Proof, and Educational Qualification Marksheets).</li>
                          <li>Verify all column details in the preview option before submitting the form.</li>
                          <li>Pay the application fee (if applicable) and take a final printout of your submitted application form for future reference.</li>
                          <li><strong>Note –</strong> छात्रो से ये अनुरोध किया जाता है की वो अपना फॉर्म भरने से पहले Official Notification को ध्यान से जरूर पढे उसके बाद ही अपना फॉर्म भरे । (Last Date, Age Limit, &amp; Education Qualification)</li>
                        </>
                      )}
                    </ol>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Mode of Selection Table */}
            <InArticleAd1100 label="ADVERTISEMENT" style={{ margin: '24px 0' }} />
            <table className="sr-table">
              <tbody>
                <tr>
                  <td className="sr-table-subheading">{job.title} : Mode Of Selection</td>
                </tr>
                <tr>
                  <td>
                    <ol style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8' }}>
                      {job.selectionProcess && Array.isArray(job.selectionProcess) && job.selectionProcess.length > 0 ? (
                        job.selectionProcess.map((step, idx) => <li key={idx}>{step}</li>)
                      ) : (
                        <>
                          <li>Merit List Basis on Marks / Written Examination (CBT)</li>
                          <li>DV &amp; Local Language Test / Skill Test (if applicable)</li>
                          <li>Medical Examination</li>
                        </>
                      )}
                    </ol>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Social Follow Channels Table */}
            <table className="sr-table" style={{ margin: '16px 0' }}>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 'bold', color: '#25d366', width: '65%', padding: '10px 14px' }}>
                    Join Our WhatsApp Channel
                  </td>
                  <td style={{ textAlign: 'center', padding: '10px 14px' }}>
                    <a href="https://whatsapp.com/channel/0029Va4bvoj6rsQxfA1Pzx2u" target="_blank" rel="noopener noreferrer" style={{ backgroundColor: '#25d366', color: '#fff', fontWeight: 'bold', padding: '6px 16px', borderRadius: '4px', textDecoration: 'none', display: 'inline-block' }}>
                      Follow Now
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 'bold', color: '#e1306c', padding: '10px 14px' }}>
                    Follow Our Instagram Channel
                  </td>
                  <td style={{ textAlign: 'center', padding: '10px 14px' }}>
                    <a href="https://instagram.com/careerdiary" target="_blank" rel="noopener noreferrer" style={{ backgroundColor: '#e1306c', color: '#fff', fontWeight: 'bold', padding: '6px 16px', borderRadius: '4px', textDecoration: 'none', display: 'inline-block' }}>
                      Follow Now
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </>
        )}

        {/* Important Links Table - Only rendered if content does not already embed links */}
        {!hasEmbeddedLinks && (
          <>
            <DisplayAd label="ADVERTISEMENT" style={{ margin: '24px 0' }} />
            <table className="sr-table sr-links-table">
              <tbody>
                <tr>
                  <td colSpan={2} className="sr-table-heading">
                    Some Useful Important Links
                  </td>
                </tr>

              {(() => {
                const grouped: Record<string, Array<{ type: string; url: string; originalLabel: string }>> = {};
                for (const item of finalImportantLinks) {
                  let base = (item.label || '').trim();
                  let type = 'Click Here';
                  const match = base.match(/^(.*?)\s*(?:\((.*?)\)|-\s*(.*?)|:\s*(.*?))$/);
                  if (match && (match[2] || match[3] || match[4])) {
                    base = match[1].trim();
                    type = (match[2] || match[3] || match[4]).trim();
                    if (type.toLowerCase() === 'link') type = 'Click Here';
                  }

                  if (!grouped[base]) grouped[base] = [];
                  grouped[base].push({ type, url: item.url, originalLabel: item.label });
                }

                return Object.entries(grouped).map(([base, items], idx) => {
                  const isApplyLink = items.some(i => (i.originalLabel || '').toLowerCase().includes('apply'));

                  return (
                    <tr key={idx}>
                      <td style={{ textAlign: 'center', width: '60%', fontWeight: '600', padding: '8px 12px' }}>
                        {base}
                      </td>
                      <td style={{ textAlign: 'center', padding: '8px 12px' }}>
                        {items.length === 1 && items[0].type === 'Click Here' ? (
                          typeof items[0].url === 'string' && items[0].url.startsWith('http') ? (
                            <>
                              <a
                                href={items[0].url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#0000ff', fontWeight: 'bold' }}
                              >
                                Click Here
                              </a>
                              {isApplyLink && introStart && (
                                <div style={{ fontSize: '0.82rem', color: '#b91c1c', marginTop: '2px', fontWeight: 'bold' }}>
                                  Link Activate On {introStart}
                                </div>
                              )}
                            </>
                          ) : (
                            <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>
                              {(items[0].originalLabel || '').toLowerCase().includes('notif') ? 'Notification Coming Soon' : 'Link Active Soon'}
                            </span>
                          )
                        ) : (
                          items.map((item, i) => (
                            <span key={i}>
                              {typeof item.url === 'string' && item.url.startsWith('http') ? (
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: '#0000ff', fontWeight: 'bold', display: 'inline-block', margin: '0 4px' }}
                                >
                                  {item.type}
                                </a>
                              ) : (
                                <span style={{ color: '#d32f2f', fontWeight: 'bold', display: 'inline-block', margin: '0 4px' }}>
                                  {item.type.toLowerCase().includes('soon') ? item.type : `${item.type} Soon`}
                                </span>
                              )}
                              {i < items.length - 1 && <span style={{ margin: '0 4px', color: '#6b7280' }}> | </span>}
                            </span>
                          ))
                        )}
                      </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </>
      )}

        {/* Important Questions Section (Sarkari Result Visual Q&A Table) */}
        {!hasFaqSection && (
          <table className="sr-table sr-faq-table" style={{ margin: '24px 0' }}>
            <tbody>
              <tr>
                <td className="sr-table-heading" style={{ fontSize: '1.15rem' }}>
                  {job.postName || job.title} : Important Question
                </td>
              </tr>
              <tr>
                <td style={{ padding: '16px 20px', lineHeight: '1.8', backgroundColor: '#ffffff' }}>
                  {importantQuestions.map((f, idx) => (
                    <div key={idx} style={{ marginBottom: idx === importantQuestions.length - 1 ? 0 : '16px', paddingBottom: idx === importantQuestions.length - 1 ? 0 : '12px', borderBottom: idx === importantQuestions.length - 1 ? 'none' : '1px dashed #cbd5e1' }}>
                      <div style={{ fontWeight: 'bold', color: '#b91c1c', fontSize: '1.02rem', marginBottom: '4px' }}>
                        Question: {f.q}
                      </div>
                      <div style={{ color: '#1e293b', fontSize: '0.95rem' }}>
                        <strong>Answer:</strong> {f.a}
                      </div>
                    </div>
                  ))}
                </td>
              </tr>
            </tbody>
          </table>
        )}

        {/* Official Notice / FAQ Bottom Image (Sarkari Result Style) */}
        {(job.faqImage || job.postImage || job.bannerImage) && (
          <div className="sr-faq-notice-image-container" style={{ margin: '22px 0 26px', textAlign: 'center' }}>
            <div
              style={{
                display: 'inline-block',
                border: '2px solid #55a845',
                padding: '4px',
                backgroundColor: '#ffffff',
                borderRadius: '4px',
                maxWidth: '100%',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}
            >
              {job.faqImageLink ? (
                <a href={job.faqImageLink} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
                  <img
                    src={job.faqImage || job.postImage || job.bannerImage}
                    alt={job.title || job.postName || 'Official Notification'}
                    style={{
                      maxWidth: '100%',
                      height: 'auto',
                      display: 'block',
                      margin: '0 auto',
                      borderRadius: '2px'
                    }}
                    loading="lazy"
                  />
                </a>
              ) : (
                <img
                  src={job.faqImage || job.postImage || job.bannerImage}
                  alt={job.title || job.postName || 'Official Notification'}
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    display: 'block',
                    margin: '0 auto',
                    borderRadius: '2px'
                  }}
                  loading="lazy"
                />
              )}
              <div
                style={{
                  color: '#2e7d32',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  padding: '6px 0 2px 0',
                  textAlign: 'center',
                  fontFamily: 'Outfit, sans-serif'
                }}
              >
                CareerDiary.in
              </div>
            </div>
            {job.faqImageLink && (
              <div style={{ marginTop: '6px' }}>
                <a
                  href={job.faqImageLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#0000ff',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    textDecoration: 'none'
                  }}
                >
                  {job.faqImageCaption || 'Click Here for More Details'}
                </a>
              </div>
            )}

            {/* 1-Tap Share Post Card Under Banner */}
            <div
              style={{
                margin: '12px auto 0',
                maxWidth: '520px',
                padding: '10px 14px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#334155', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Share2 className="w-3.5 h-3.5" /> Share this post:
              </span>
              <a
                href={whatsappShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#25d366',
                  color: '#fff',
                  padding: '4px 12px',
                  borderRadius: '4px',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  textDecoration: 'none'
                }}
              >
                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
              </a>
              <a
                href={telegramShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#0088cc',
                  color: '#fff',
                  padding: '4px 12px',
                  borderRadius: '4px',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  textDecoration: 'none'
                }}
              >
                <Send className="w-3.5 h-3.5" /> Telegram
              </a>
              <button
                type="button"
                onClick={handleCopyLink}
                style={{
                  background: copied ? '#16a34a' : '#64748b',
                  color: '#fff',
                  padding: '4px 12px',
                  borderRadius: '4px',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        )}

        {/* AdSense Bottom Display Ad (Guarantees min 4 ads on all pages) */}
        <DisplayAd label="ADVERTISEMENT" style={{ margin: '24px 0' }} />

        {/* Latest Posts & Related Posts Section */}
        <div style={{ margin: '24px 0' }}>
          {/* Latest Posts */}
          {latestPosts.length > 0 && (
            <div className="sr-posts-box">
              <div className="sr-posts-box-header pink">
                Latest Posts
              </div>
              <ul className="sr-posts-list">
                {latestPosts.map((p) => (
                  <li key={p.id}>
                    👉 <a
                      href={`https://careerdiary.in${getJobUrl(p)}`}
                      onClick={(e) => {
                        if (onSelectJob) {
                          e.preventDefault();
                          onSelectJob(p.id);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                    >
                      {p.postName || p.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Related Posts */}
          {finalRelatedPosts.length > 0 && (
            <div className="sr-posts-box">
              <div className="sr-posts-box-header green">
                Related Posts
              </div>
              <ul className="sr-posts-list">
                {finalRelatedPosts.map((p) => (
                  <li key={p.id}>
                    👉 <a
                      href={`https://careerdiary.in${getJobUrl(p)}`}
                      onClick={(e) => {
                        if (onSelectJob) {
                          e.preventDefault();
                          onSelectJob(p.id);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                    >
                      {p.postName || p.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* AdSense Multiplex Grid Unit (Slot 1963114002 - Autorelaxed Grid) */}
        <MultiplexAd1963 label="YOU MAY ALSO LIKE" style={{ margin: '24px 0' }} />

        {/* Master Post Footer Section (Disclaimer, 6-Grid Social Media Box, Guidelines, Follow Now Table, Ads & Auto FAQ) */}
        <PostFooterSection job={job} category={faqCategory} />

        {/* Expert Tip if available */}
        {job.expertTip && (
          <div style={{ backgroundColor: '#fffde7', border: '1px solid #f9a825', padding: '12px 16px', borderRadius: '6px', marginTop: '10px', fontSize: '0.95rem', color: '#333' }}>
            💡 <strong>Expert Tip:</strong> {job.expertTip}
          </div>
        )}

      </div>
    </div>
  );
}
