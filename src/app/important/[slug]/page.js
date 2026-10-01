import { getJobBySlug, getAllJobsServer } from '../../../utils/jobsService';
import JobDetailWrapper from '../../../components/JobDetailWrapper';
import { notFound } from 'next/navigation';

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

export default async function ImportantPage({ params }) {
  const { slug } = await params;
  const [job, allJobs] = await Promise.all([
    getJobBySlug(slug),
    getAllJobsServer(),
  ]);

  return <JobDetailWrapper job={job} allJobs={allJobs} slug={slug} />;
}
