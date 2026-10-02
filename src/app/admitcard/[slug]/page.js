import { isResult, isAdmitCard, isAnswerKey, isAdmission, isSyllabus, isDocument, isImportant } from '../../../data/categoryHelpers';
import { getJobBySlug, getAllJobsServer, getTopRecentJobsSummary } from '../../../utils/jobsService';
import JobDetailWrapper from '../../../components/JobDetailWrapper';
import { notFound } from 'next/navigation';




export async function generateStaticParams() {
  const jobs = await getAllJobsServer();
  return jobs.filter(isAdmitCard).map((job) => ({
    slug: job.slug || job.id,
  }));
}

export const revalidate = 120;


export async function generateMetadata({ params }) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);

  if (!job) {
    return {
      title: 'Admit Card Not Found | Career Diary',
      description: 'The requested admit card does not exist.',
    };
  }

  const title = `${job.title} – Download Admit Card, Hall Ticket & Exam Date | Career Diary`;
  const description = `${job.title} 2026. Download official admit card, check exam date and shift details on Career Diary.`;
  const url = `https://careerdiary.in/admitcard/${slug}`;

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

export default async function AdmitCardPage({ params }) {
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
