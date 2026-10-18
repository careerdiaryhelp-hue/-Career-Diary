import { isResult, isAdmitCard, isAnswerKey, isAdmission, isSyllabus, isDocument, isImportant } from '../../../data/categoryHelpers';
import { getJobBySlug, getAllJobsServer, getTopRecentJobsSummary, getSocialImageUrl } from '../../../utils/jobsService';
import JobDetailWrapper from '../../../components/JobDetailWrapper';
import { notFound } from 'next/navigation';




export const dynamic = 'force-dynamic';
export const revalidate = 0;


export async function generateMetadata({ params }) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);

  if (!job) {
    return {
      title: 'Post Not Found | Career Diary',
      description: 'The requested notification does not exist.',
    };
  }

  const title = `${job.title} – Important Notification & Online Services | Career Diary`;
  const description = `${job.title} 2026. Official notice and links on Career Diary.`;
  const url = `https://careerdiary.in/important/${slug}`;
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
          alt: job.title || 'Career Diary Post',
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

export default async function ImportantPage({ params }) {
  const { slug } = await params;
  const [job, allJobs] = await Promise.all([
    getJobBySlug(slug),
    getTopRecentJobsSummary(15),
  ]);

  if (!job) {
    notFound();
  }

  return <JobDetailWrapper job={job} allJobs={allJobs} slug={slug} />;
}
