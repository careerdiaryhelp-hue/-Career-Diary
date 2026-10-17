import { fetchBreakingNewsServer } from '../../../firebase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const news = await fetchBreakingNewsServer();
    return Response.json(news, {
      headers: {
        'Cache-Control': 'public, max-age=30, s-maxage=60, stale-while-revalidate=120',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return Response.json([], { status: 500 });
  }
}
