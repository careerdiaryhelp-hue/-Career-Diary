import React from 'react';
import { ArrowLeft, Send, MessageCircle } from 'lucide-react';

export default function JobDetailPage({ job, onBack }) {
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
  const notificationUrl = getLinkUrl('notification', 'brochure', 'rulebook', 'pdf', 'notice') || job.notificationUrl || officialWebUrl;
  const admitCardUrl = getLinkUrl('admit card', 'admit', 'hall ticket') || officialWebUrl;

  const importantDates = job.importantDates || job.important_dates || {};
  const applicationFee = job.applicationFee || job.application_fee || {};
  const ageLimit = job.ageLimit || job.age_limit || {};
  const vacancyDetails = job.vacancyDetails || job.vacancy_details || [];

  // Build comprehensive normalized list of important links
  const rawLinks = job.importantLinks || job.important_links || {};
  let customLinks = [];

  if (Array.isArray(rawLinks)) {
    rawLinks.forEach(item => {
      if (typeof item === 'string' && item.startsWith('http')) {
        customLinks.push({ label: 'Important Link', url: item });
      } else if (item && typeof item === 'object') {
        const label = item.label || item.key || item.name || item.title || 'Important Link';
        const url = item.url || item.link || item.href || item.value || '';
        if (label && url) customLinks.push({ label, url });
      }
    });
  } else if (typeof rawLinks === 'object' && rawLinks !== null) {
    Object.entries(rawLinks).forEach(([label, url]) => {
      const cleanUrl = typeof url === 'string' ? url : (url?.url || url?.link || '');
      if (label && cleanUrl) {
        customLinks.push({ label, url: cleanUrl });
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
    { label: 'Join Telegram Channel', url: 'https://t.me/careerdiary' },
    { label: 'Join WhatsApp Channel', url: 'https://whatsapp.com/channel/0029Va4bvoj6rsQxfA1Pzx2u' },
  ];

  const postDate = job.postDate || job.importantDates?.postDate || null;
  const shortInfo = job.uniqueDescription || job.description || `${job.organization || 'The organization'} has released the official notification for ${job.title}. Eligible candidates can apply online before the last date. Read the notification carefully before submitting the form.`;

  return (
    <div className="container" style={{ paddingTop: '20px', paddingBottom: '40px', maxWidth: '860px' }}>
      {/* Back Button */}
      <div style={{ marginBottom: '12px' }}>
        <button onClick={onBack} className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft className="w-4 h-4" /> Back to All Jobs
        </button>
      </div>

      {/* Main Detail Container */}
      <div className="sr-detail-container">

        {/* Title */}
        <h1 className="sr-main-title">{job.title}</h1>
        {postDate && (
          <div className="sr-post-date">Post Date: {postDate}</div>
        )}

        {/* Short Information */}
        <div className="sr-short-info">
          <strong>Short Information :</strong> {shortInfo}
        </div>

        {/* Social Banners */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <a href="https://t.me/careerdiary" target="_blank" rel="noopener noreferrer"
            style={{ background: '#0088cc', color: '#fff', padding: '8px 18px', borderRadius: '4px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Send className="w-4 h-4" /> Join Telegram Channel
          </a>
          <a href="https://whatsapp.com/channel/0029Va4bvoj6rsQxfA1Pzx2u" target="_blank" rel="noopener noreferrer"
            style={{ background: '#25d366', color: '#fff', padding: '8px 18px', borderRadius: '4px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <MessageCircle className="w-4 h-4" /> Join WhatsApp Channel
          </a>
        </div>

        {/* If post has HTML content from Visual Editor / Bigbooster, render it directly */}
        {job.content ? (
          <div
            className="sr-rich-html-content"
            style={{ marginBottom: '24px' }}
            dangerouslySetInnerHTML={{ __html: job.content }}
          />
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

        {/* Important Dates & Application Fee */}
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
                  <li>⚫ <strong>Application Start :</strong> {importantDates.applyStart || job.appStart || 'As per notification'}</li>
                  <li>⚫ <strong>Last Date to Apply :</strong> <span style={{ color: '#ff0000' }}>{importantDates.lastDate || importantDates.applyLastDate || job.appLast || job.lastDate || 'As per notification'}</span></li>
                  {(importantDates.feeLastDate || job.appLast) && (
                    <li>⚫ <strong>Fee Payment Last Date :</strong> {importantDates.feeLastDate || job.appLast}</li>
                  )}
                  {importantDates.examDate && (
                    <li>⚫ <strong>Exam Date :</strong> {importantDates.examDate}</li>
                  )}
                  {importantDates.admitCard && (
                    <li>⚫ <strong>Admit Card :</strong> {importantDates.admitCard}</li>
                  )}
                  {importantDates.result && (
                    <li>⚫ <strong>Result Date :</strong> {importantDates.result}</li>
                  )}
                  {Object.entries(importantDates)
                    .filter(([k]) => !['applyStart', 'lastDate', 'applyLastDate', 'feeLastDate', 'examDate', 'admitCard', 'result', 'postDate'].includes(k))
                    .map(([k, v]) => (
                      <li key={k}>⚫ <strong>{k} :</strong> {v}</li>
                    ))}
                </ul>
              </td>

              {/* Fees Column */}
              <td style={{ verticalAlign: 'top', padding: 0 }}>
                <div className="sr-dates-fees-header">Application Fee</div>
                <ul className="sr-list">
                  {applicationFee['General / OBC / EWS'] || job.feeGen ? (
                    <li>⚫ <strong>General / OBC :</strong> {applicationFee['General / OBC / EWS'] || job.feeGen}</li>
                  ) : (
                    <li>⚫ <strong>General / OBC :</strong> As per notification</li>
                  )}
                  {applicationFee['SC / ST'] || job.feeSc ? (
                    <li>⚫ <strong>SC / ST / PwD :</strong> {applicationFee['SC / ST'] || job.feeSc}</li>
                  ) : null}
                  {Object.entries(applicationFee)
                    .filter(([k]) => !['General / OBC / EWS', 'SC / ST', 'paymentMode'].includes(k))
                    .map(([k, v]) => (
                      <li key={k}>⚫ <strong>{k} :</strong> {v}</li>
                    ))}
                  <li>⚫ <strong>Payment Mode :</strong> {applicationFee.paymentMode || 'Online (Debit/Credit Card, Net Banking, UPI)'}</li>
                </ul>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Age Limit & Qualification */}
        <table className="sr-table">
          <tbody>
            <tr>
              <td colSpan={2} className="sr-table-subheading">Age Limit &amp; Educational Qualification</td>
            </tr>
            <tr>
              <td style={{ textAlign: 'center' }}>
                <strong>Minimum Age :</strong> {ageLimit.minimum || ageLimit.min || job.minAge || '18 Years'}
              </td>
              <td style={{ textAlign: 'center' }}>
                <strong>Maximum Age :</strong> {ageLimit.maximum || ageLimit.max || job.maxAge || '37 Years'}
              </td>
            </tr>
            <tr>
              <td colSpan={2} style={{ textAlign: 'center', color: '#008000' }}>
                <strong>Age Relaxation :</strong> {ageLimit.relaxation || 'As per Govt. Rules (SC/ST 5 Yrs, OBC 3 Yrs, PwD 10 Yrs)'}
              </td>
            </tr>
            <tr>
              <td colSpan={2}>
                <strong>Educational Qualification :</strong> {job.qualification || job.eligibility?.education || job.eligibility?.qualification || 'Candidates must have passed 10th / 12th / Diploma / Degree from a Recognized Board / University.'}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Mode of Selection */}
        {job.selectionProcess && Array.isArray(job.selectionProcess) && job.selectionProcess.length > 0 && (
          <table className="sr-table">
            <tbody>
              <tr>
                <td className="sr-table-subheading">Mode of Selection</td>
              </tr>
              <tr>
                <td>
                  <ol style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8' }}>
                    {job.selectionProcess.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ol>
                </td>
              </tr>
            </tbody>
          </table>
        )}

        {/* Vacancy Details Table */}
        {vacancyDetails.length > 0 && (
          <table className="sr-table sr-vacancy-table">
            <thead>
              <tr>
                <th colSpan={3} className="sr-table-heading">
                  {job.title} : Vacancy Details
                </th>
              </tr>
              <tr>
                <th>Post Name</th>
                <th>Total Posts</th>
                <th>Eligibility Criteria</th>
              </tr>
            </thead>
            <tbody>
              {vacancyDetails.map((v, idx) => (
                <tr key={idx}>
                  <td>{v['Post Name'] || v.postName || v.Post || v.name || '-'}</td>
                  <td><strong>{v.Total || v.total || v.vacancies || '-'}</strong></td>
                  <td>{v.Eligibility || v.eligibility || job.qualification || 'As per rules'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* How to Fill Form */}
        <table className="sr-table">
          <tbody>
            <tr>
              <td className="sr-table-subheading">How To Fill {job.title} Online Form</td>
            </tr>
            <tr>
              <td>
                <ol style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
                  <li>Interested candidates can submit their application online before the last date.</li>
                  <li>Use the &quot;Click Here&quot; link provided below under Important Links section to apply directly.</li>
                  <li>Alternatively, visit the official website of the organization to complete the process online.</li>
                  <li>Make sure to complete the application before the deadline: <strong style={{ color: '#ff0000' }}>{importantDates.lastDate || importantDates.applyLastDate || job.appLast || job.lastDate || 'check notification'}</strong>.</li>
                  <li><strong>Note –</strong> छात्रों से अनुरोध है की वो अपना फॉर्म भरने से पहले Official Notification को ध्यान से पढ़ें। (Last Date, Age Limit &amp; Education Qualification)</li>
                </ol>
              </td>
            </tr>
          </tbody>
        </table>
          </>
        )}

        {/* Important Links Table */}
        <table className="sr-table sr-links-table">
          <tbody>
            <tr>
              <td colSpan={2} className="sr-table-heading">
                Some Useful Important Links
              </td>
            </tr>

            {finalImportantLinks.map((item, idx) => {
              const isValidUrl = typeof item.url === 'string' && item.url.startsWith('http');
              return (
                <tr key={idx}>
                  <td style={{ textAlign: 'center', width: '60%', fontWeight: '600' }}>{item.label}</td>
                  <td style={{ textAlign: 'center' }}>
                    {isValidUrl ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#0000ff', fontWeight: 'bold' }}
                      >
                        Click Here
                      </a>
                    ) : (
                      <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>
                        {item.label.toLowerCase().includes('notif') ? 'Notification Coming Soon' : 'Link Active Soon'}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

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
