import { notFound } from 'next/navigation';
import { fetchPyqBySlug, fetchPyqOnce } from '../../../firebase';
import PyqQuizClient from '../../../components/PyqQuizClient';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await fetchPyqBySlug(slug);

  if (!post) {
    return {
      title: 'PYQ Not Found | Career Diary',
      description: 'The requested Previous Year Question paper does not exist.',
    };
  }

  const title = `${post.title} – Solved PYQ Paper & CBT Mock Test | Career Diary`;
  const description = post.description || `${post.title} - Attempt Previous Year Questions with official solutions, study mode & real CBT timer on Career Diary.`;
  const url = `https://careerdiary.in/pyq/${slug}`;

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

export default async function PyqDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, allPosts] = await Promise.all([
    fetchPyqBySlug(slug),
    fetchPyqOnce()
  ]);

  if (!post) {
    notFound();
  }

  const safeSlug = post.slug || post.id;
  const relatedPosts = (allPosts || [])
    .filter(p => (p.slug || p.id) !== safeSlug && p.status !== 'Draft')
    .slice(0, 4);

  return <PyqQuizClient post={post} relatedPosts={relatedPosts} />;
}
