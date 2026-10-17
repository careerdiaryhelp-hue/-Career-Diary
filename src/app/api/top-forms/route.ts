import { fetchTopOnlineFormsServer } from '../../../firebase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const forms = await fetchTopOnlineFormsServer();
    return Response.json(forms, {
      headers: {
        'Cache-Control': 'public, max-age=30, s-maxage=60, stale-while-revalidate=120',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return Response.json([], { status: 500 });
  }
}
