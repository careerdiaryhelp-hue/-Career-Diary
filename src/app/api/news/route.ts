import { fetchBreakingNewsServer } from '../../../firebase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const news = await fetchBreakingNewsServer();
    return Response.json(news, {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=600, stale-while-revalidate=1800',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return Response.json([], { status: 500 });
  }
}
