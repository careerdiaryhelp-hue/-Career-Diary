import React from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';

export default function AutoFAQSection({ job, category = 'job' }) {
  if (!job) return null;

  const title = job.title || 'Recruitment / Examination';
  const org = job.organization || job.board || 'the authority';
  const postName = job.postName || title;
  
  const importantDates = job.importantDates || job.important_dates || {};
  const lastDate = importantDates.lastDate || importantDates.applyLastDate || job.appLast || job.lastDate || 'As per notification schedule';
  const startDate = importantDates.applyStart || job.appStart || 'Declared';
  const feeGen = job.feeGen || job.applicationFee?.['General / OBC / EWS'] || 'As per notification';
  const feeSc = job.feeSc || job.applicationFee?.['SC / ST'] || 'As per notification';
  const minAge = job.minAge || job.ageLimit?.minimum || job.ageLimit?.min || '18 Years';
  const maxAge = job.maxAge || job.ageLimit?.maximum || job.ageLimit?.max || '37 Years';
  const qualification = job.qualification || job.eligibility?.education || '10th / 12th / Diploma / Bachelor Degree from recognized board/university';

  let faqs = [];
  const catLower = (category || job.category || '').toLowerCase();

  if (catLower.includes('admit') || catLower.includes('hall ticket')) {
    faqs = [
      {
        q: `How can I download the ${title} Admit Card / Hall Ticket?`,
        a: `You can download the ${title} admit card directly by clicking on the 'Download Admit Card' link in the Important Links section on Career Diary. Use your Registration Number and Date of Birth / Password to log in.`
      },
      {
        q: `What documents are required at the ${postName} examination center?`,
        a: `Candidates must carry a clear printed copy of the Admit Card along with a valid Original Photo ID proof (Aadhaar Card, Voter ID, Driving License, or Passport) and recent passport-size photographs.`
      },
      {
        q: `What is the exam date for ${title}?`,
        a: `The written examination for ${title} is scheduled as per the official notification timeline (${lastDate}). Please verify shift timings and reporting time on your call letter.`
      },
      {
        q: `Where can I check ${org} exam center slip / city details?`,
        a: `Exam city center slip details can be checked online via the official portal link provided on Career Diary prior to hall ticket release.`
      }
    ];
  } else if (catLower.includes('result') || catLower.includes('answer key')) {
    faqs = [
      {
        q: `How to check the official result for ${title}?`,
        a: `Visit Career Diary, scroll to the Important Links table, and click on 'Check Result / Score Card'. Enter your Roll Number / Registration ID to view your score or download the Merit List PDF.`
      },
      {
        q: `Where can I download the ${title} Cut Off marks & Merit List PDF?`,
        a: `The category-wise cut off marks and qualified candidate roll number PDF are available for direct download under the official links section.`
      },
      {
        q: `How to raise objections against ${title} Answer Key?`,
        a: `If the tentative answer key is out, candidates can submit objections online through the official candidate login portal within the specified dates.`
      }
    ];
  } else if (catLower.includes('admission')) {
    faqs = [
      {
        q: `What is the last date to register for ${title} Admission?`,
        a: `The last date to submit the online admission / counseling registration form is ${lastDate}.`
      },
      {
        q: `What is the eligibility requirement for ${title}?`,
        a: `Candidates applying for admission must have passed ${qualification}.`
      },
      {
        q: `How to apply online for ${title} counseling?`,
        a: `Click on the 'Apply Online for Admission' link in the table above to fill choice preference and complete online fee payment.`
      }
    ];
  } else {
    // Default Job / Recruitment FAQs
    faqs = [
      {
        q: `What is the last date to apply online for ${title}?`,
        a: `The last date to submit the online application form for ${title} is ${lastDate}. Online registration started on ${startDate}.`
      },
      {
        q: `What is the age limit for ${title}?`,
        a: `As per official notification, the minimum age required is ${minAge} and maximum age limit is ${maxAge}. Age relaxation is applicable as per Govt rules for SC/ST/OBC/PwD candidates.`
      },
      {
        q: `What is the educational qualification for ${title}?`,
        a: `Candidates applying for ${title} must possess ${qualification}.`
      },
      {
        q: `What is the application fee for ${title}?`,
        a: `General / OBC / EWS fee is ${feeGen}, and SC / ST / Reserved category fee is ${feeSc}. Fee can be paid online via UPI, Debit Card, Credit Card, or Net Banking.`
      },
      {
        q: `How to fill the ${title} Online Application Form?`,
        a: `Visit Career Diary (careerdiary.in), go to the Important Links section, click 'Apply Online', fill required details, upload documents, pay the application fee, and print out your final confirmation receipt.`
      }
    ];
  }

  // Generate JSON-LD Schema markup for Google Rich Snippets
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.a
      }
    }))
  };

  return (
    <div className="sr-faq-container" style={{ marginTop: '24px', marginBottom: '24px' }}>
      {/* Google FAQ Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-heading, #1e293b)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <HelpCircle className="w-5 h-5" style={{ color: '#0088cc' }} /> Frequently Asked Questions (FAQs) – {title}
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {faqs.map((faq, idx) => (
          <details
            key={idx}
            open={idx === 0}
            style={{
              backgroundColor: 'var(--card-bg, #ffffff)',
              border: '1px solid var(--border-color, #cbd5e1)',
              borderRadius: '8px',
              padding: '12px 16px',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
          >
            <summary style={{ fontWeight: '700', fontSize: '0.98rem', color: '#1e293b', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>❓ {faq.q}</span>
              <ChevronDown className="w-4 h-4" style={{ color: '#64748b' }} />
            </summary>
            <p style={{ marginTop: '10px', fontSize: '0.92rem', lineHeight: '1.7', color: '#334155', borderTop: '1px dashed #cbd5e1', paddingTop: '8px', margin: '8px 0 0' }}>
              {faq.a}
            </p>
          </details>
        ))}
      </div>
    </div>
  );
}
