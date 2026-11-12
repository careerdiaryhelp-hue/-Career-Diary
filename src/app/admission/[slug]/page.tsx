import { isResult, isAdmitCard, isAnswerKey, isAdmission, isSyllabus, isDocument, isImportant } from '../../../data/categoryHelpers';
import { getJobBySlug, getAllJobsServer, getTopRecentJobsSummary, getSocialImageUrl } from '../../../utils/jobsService';
import JobDetailWrapper from '../../../components/JobDetailWrapper';
import { notFound, redirect } from 'next/navigation';
import { resolveDestinationUrl } from '../../../utils/redirectService';

export const revalidate = 120; // 2-minute edge cache protects Firestore quota while keeping data fresh

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const destination = await resolveDestinationUrl(slug, 'admission');
  if (destination && destination !== `/admission/${slug}`) {
    return {
      title: 'Redirecting... | Career Diary',
    };
  }

  const job = await getJobBySlug(slug);

  if (!job) {
    return {
      title: 'Admission Not Found | Career Diary',
      description: 'The requested admission notice does not exist.',
    };
  }

  const title = `${job.title} – Admission Form, Eligibility & Apply Online | Career Diary`;
  const description = `${job.title} 2026. Check admission notification, entrance test dates, eligibility, prospectus and apply online on Career Diary.`;
  const url = `https://careerdiary.in/admission/${slug}`;
  const socialImage = getSocialImageUrl(job, slug);

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Career Diary',
      type: 'article',
      images: [
        {
          url: socialImage,
          width: 1200,
          height: 630,
          alt: job.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [socialImage],
    },
  };
}

export default async function AdmissionPage({ params }) {
  const { slug } = await params;

  const destination = await resolveDestinationUrl(slug, 'admission');
  if (destination && destination !== `/admission/${slug}`) {
    redirect(destination);
  }

  const [job, allJobs] = await Promise.all([
    getJobBySlug(slug),
    getTopRecentJobsSummary(15),
  ]);

  if (!job) {
    notFound();
  }

  return <JobDetailWrapper job={job} allJobs={allJobs} slug={slug} />;
}
