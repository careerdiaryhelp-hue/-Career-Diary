import React, { useEffect } from 'react';

export default function SEOHead({
  title,
  description,
  canonicalUrl,
  job = null,
  category = 'Latest Jobs'
}) {
  useEffect(() => {
    if (!title) return;

    // 1. Set document.title
    document.title = title;

    // Helper to set or create meta tag
    const setMeta = (nameAttr, nameVal, content) => {
      if (!content) return;
      let el = document.querySelector(`meta[${nameAttr}="${nameVal}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(nameAttr, nameVal);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // 2. Standard Description
    const metaDesc = description || (job?.title ? `${job.title} Notification 2026. Check eligibility criteria, age limit, application fee, last date to apply, and direct apply online link on Career Diary.` : 'Latest Govt Jobs, Admit Cards, Results, Syllabus & Admission Notifications 2026.');
    setMeta('name', 'description', metaDesc);

    // 3. OpenGraph Meta Tags
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', metaDesc);
    setMeta('property', 'og:type', 'article');
    if (canonicalUrl) {
      setMeta('property', 'og:url', canonicalUrl);
    }

    // 4. Twitter Card Meta Tags
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', metaDesc);

    // 5. Canonical Link Tag
    if (canonicalUrl) {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonicalUrl);
    }
  }, [title, description, canonicalUrl, job]);

  if (!job) return null;

  // Build JobPosting Schema for Google Jobs Search & Google Assistant
  const postDate = job.postDate || job.updatedAt || new Date().toISOString();
  const validThrough = job.appLast || job.lastDate ? `${job.appLast || job.lastDate}T23:59:59+05:30` : '2026-12-31T23:59:59+05:30';

  const jobPostingSchema = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.description || job.uniqueDescription || `${job.organization || 'Government Board'} notification for ${job.title}. Check eligibility, dates and apply online.`,
    "identifier": {
      "@type": "PropertyValue",
      "name": job.organization || "Govt Board",
      "value": job.id
    },
    "datePosted": postDate,
    "validThrough": validThrough,
    "employmentType": "FULL_TIME",
    "hiringOrganization": {
      "@type": "Organization",
      "name": job.organization || "Government Recruitment Board",
      "sameAs": job.officialUrl || "https://careerdiary.in"
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressRegion": job.state || "All India",
        "addressCountry": "IN"
      }
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://careerdiary.in/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": category,
        "item": `https://careerdiary.in/${category.toLowerCase().replace(/\s+/g, '-')}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": job.title,
        "item": canonicalUrl || `https://careerdiary.in/${job.id}`
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
    </>
  );
}
