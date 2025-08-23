export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return new Response('Missing url parameter', { status: 400 });
    }

    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.log('Error fetching image:', response.statusText);
      return new Response('Error fetching image', { status: response.status });
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*', // pour autoriser CORS
      },
    });
  } catch (err) {
    console.error(err);
    return new Response('Server error fetching image', { status: 500 });
  }
}
