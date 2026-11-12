import { fetchFirestoreJobsOnce } from '../../../firebase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const jobs = await fetchFirestoreJobsOnce();
    return Response.json(jobs, {
      headers: {
        'Cache-Control': 'public, max-age=30, s-maxage=120, stale-while-revalidate=180',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return Response.json([], { status: 500 });
  }
}
