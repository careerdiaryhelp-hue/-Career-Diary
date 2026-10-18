import { getJobBySlug, cleanJobId } from '../../../../utils/jobsService';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return Response.redirect('https://careerdiary.in/image.png', 302);
    }

    const decodedSlug = decodeURIComponent(slug);
    let job = await getJobBySlug(decodedSlug);
    if (!job && decodedSlug !== slug) {
      job = await getJobBySlug(slug);
    }
    if (!job) {
      const clean = cleanJobId(decodedSlug);
      job = await getJobBySlug(clean);
    }

    const rawImage = job?.faqImage || job?.postImage || job?.bannerImage || job?.image || job?.thumbnail;

    if (!rawImage) {
      return Response.redirect('https://careerdiary.in/image.png', 302);
    }

    const trimmed = String(rawImage).trim();

    // 1. If direct HTTP/HTTPS URL, redirect directly
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return Response.redirect(trimmed, 302);
    }

    // 2. If relative path (e.g. /image.png)
    if (trimmed.startsWith('/')) {
      return Response.redirect(`https://careerdiary.in${trimmed}`, 302);
    }

    // 3. If base64 data URL (e.g. data:image/jpeg;base64,...)
    if (trimmed.startsWith('data:image/')) {
      const matches = trimmed.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
      if (matches) {
        const mimeType = matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');

        return new Response(buffer, {
          headers: {
            'Content-Type': mimeType,
            'Content-Length': String(buffer.length),
            'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    }

    return Response.redirect('https://careerdiary.in/image.png', 302);
  } catch (error) {
    return Response.redirect('https://careerdiary.in/image.png', 302);
  }
}
