import { fetchTopOnlineFormsServer } from '../../../firebase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const forms = await fetchTopOnlineFormsServer();
    return Response.json(forms, {
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=120, stale-while-revalidate=300',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return Response.json([], { status: 500 });
  }
}
