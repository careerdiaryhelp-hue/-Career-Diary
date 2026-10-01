import { getJobBySlug, getAllJobsServer } from '../../utils/jobsService';
import JobDetailWrapper from '../../components/JobDetailWrapper';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);

  if (!job) {
    return {
      title: 'Post Not Found | Career Diary',
      description: 'The requested job notification or result does not exist.',
    };
  }

  const title = `${job.title} | Career Diary`;
  const description = `${job.title} 2026. Check details, dates, eligibility, and direct official links on Career Diary.`;
  const url = `https://careerdiary.in/${slug}`;

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
      images: [{ url: 'https://careerdiary.in/image.png' }],
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: ['https://careerdiary.in/image.png'],
    },
  };
}

export default async function SlugRoute({ params }) {
  const { slug } = await params;
  const [job, allJobs] = await Promise.all([
    getJobBySlug(slug),
    getAllJobsServer(),
  ]);

  if (!job) {
    notFound();
  }

  return <JobDetailWrapper job={job} allJobs={allJobs} slug={slug} />;
}
