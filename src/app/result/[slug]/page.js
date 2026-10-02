import { getJobBySlug, getTopRecentJobsSummary } from '../../../utils/jobsService';
import JobDetailWrapper from '../../../components/JobDetailWrapper';
import { notFound } from 'next/navigation';

export const revalidate = 60;


export async function generateMetadata({ params }) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);

  if (!job) {
    return {
      title: 'Result Not Found | Career Diary',
      description: 'The requested result does not exist.',
    };
  }

  const title = `${job.title} – Check Result, Merit List & Cut Off Marks | Career Diary`;
  const description = `${job.title} 2026. Check scorecard, merit list, cut off marks and direct result links on Career Diary.`;
  const url = `https://careerdiary.in/result/${slug}`;

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
          url: 'https://careerdiary.in/image.png',
          width: 800,
          height: 600,
          alt: job.title,
        },
      ],
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: ['https://careerdiary.in/image.png'],
    },
  };
}

export default async function ResultPage({ params }) {
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
