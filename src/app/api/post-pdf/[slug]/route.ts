import { getJobBySlug, cleanJobId } from '../../../../utils/jobsService';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return new Response('PDF Not Found', { status: 404 });
    }

    const cleanSlug = decodeURIComponent(slug).replace(/\.pdf$/i, '').trim();
    let job = await getJobBySlug(cleanSlug);
    if (!job && cleanSlug !== slug) {
      job = await getJobBySlug(slug.replace(/\.pdf$/i, '').trim());
    }
    if (!job) {
      const clean = cleanJobId(cleanSlug);
      job = await getJobBySlug(clean);
    }

    // Check for base64 or direct URL stored in job fields
    const rawPdf =
      job?.notificationPdfData ||
      job?.pdfData ||
      job?.officialPdfData ||
      job?.notificationUrl ||
      job?.importantLinks?.['Download Official Notification'] ||
      job?.importantLinks?.['Download Official Notification PDF'] ||
      job?.importantLinks?.['Download Notification PDF'] ||
      job?.importantLinks?.['Official Notification'];

    if (!rawPdf) {
      return new Response('Official Notification PDF not found for this post.', {
        status: 404,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }

    const trimmed = String(rawPdf).trim();

    // 1. If direct Base64 Data URL (e.g. data:application/pdf;base64,...)
    if (trimmed.startsWith('data:application/pdf;base64,') || trimmed.startsWith('data:application/octet-stream;base64,')) {
      const base64Data = trimmed.replace(/^data:[^;]+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const filename = `${cleanSlug || 'notification'}-official-notice.pdf`;

      return new Response(buffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Length': String(buffer.length),
          'Content-Disposition': `inline; filename="${filename}"`,
          'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // 2. If direct HTTP/HTTPS URL, redirect directly to official PDF
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return Response.redirect(trimmed, 302);
    }

    // 3. If relative path
    if (trimmed.startsWith('/')) {
      return Response.redirect(`https://careerdiary.in${trimmed}`, 302);
    }

    return new Response('Invalid PDF URL format.', { status: 400 });
  } catch (error: any) {
    return new Response(`Error serving PDF: ${error?.message || 'Internal Server Error'}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}
