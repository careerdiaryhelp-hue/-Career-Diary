import { notFound } from 'next/navigation';
import { fetchCurrentAffairsBySlug, fetchCurrentAffairsOnce } from '../../../firebase';
import CurrentAffairsQuizClient from '../../../components/CurrentAffairsQuizClient';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await fetchCurrentAffairsBySlug(slug);

  if (!post) {
    return {
      title: 'Current Affairs Not Found | Career Diary',
      description: 'The requested current affairs post does not exist.',
    };
  }

  const title = `${post.title} (50 MCQs • 30 Min Live Test) | Career Diary`;
  const description = post.description || `${post.title} - Attempt 50 MCQs Current Affairs practice mock test with 30-minute timer on Career Diary.`;
  const url = `https://careerdiary.in/current-affairs/${slug}`;

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
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function CurrentAffairsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, allPosts] = await Promise.all([
    fetchCurrentAffairsBySlug(slug),
    fetchCurrentAffairsOnce()
  ]);

  if (!post) {
    notFound();
  }

  const safeSlug = post.slug || post.id;
  const relatedPosts = (allPosts || [])
    .filter(p => (p.slug || p.id) !== safeSlug && p.status !== 'Draft')
    .slice(0, 4);

  return <CurrentAffairsQuizClient post={post} relatedPosts={relatedPosts} />;
}
