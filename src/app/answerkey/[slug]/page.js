import { getJobBySlug, getTopRecentJobsSummary } from '../../../utils/jobsService';
import JobDetailWrapper from '../../../components/JobDetailWrapper';
import { notFound } from 'next/navigation';

export const revalidate = 120;


export async function generateMetadata({ params }) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);

  if (!job) {
    return {
      title: 'Answer Key Not Found | Career Diary',
      description: 'The requested answer key does not exist.',
    };
  }

  const title = `${job.title} – Official Answer Key & Objection Link | Career Diary`;
  const description = `${job.title} 2026. Download official answer keys, question papers, and raise objections on Career Diary.`;
  const url = `https://careerdiary.in/answerkey/${slug}`;

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

export default async function AnswerKeyPage({ params }) {
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
