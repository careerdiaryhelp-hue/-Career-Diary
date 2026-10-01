import { getJobBySlug, getAllJobsServer } from '../../../utils/jobsService';
import JobDetailWrapper from '../../../components/JobDetailWrapper';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
  const { slug } = await params;
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

export default async function AdmissionPage({ params }) {
  const { slug } = await params;
  const [job, allJobs] = await Promise.all([
    getJobBySlug(slug),
    getAllJobsServer(),
  ]);

  return <JobDetailWrapper job={job} allJobs={allJobs} slug={slug} />;
}
