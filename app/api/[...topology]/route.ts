import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const topologyPath = pathname.replace('/api/topology', '/v1.0/topology');
  const url = new URL(topologyPath, 'http://localhost:8080');
  
  // Add timestamp to the URL to bypass cache
  url.searchParams.append('_t', Date.now().toString());

  console.log('API Route: Proxying request to:', url.toString());

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

    console.log('API Route: Proxy response status:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    console.log('API Route: Raw response:', text);

    let data = JSON.parse(text);

    console.log('API Route: Parsed data type:', typeof data);
    console.log('API Route: Is data an array?', Array.isArray(data));
    console.log('API Route: Data length:', Array.isArray(data) ? data.length : 'Not an array');

    return NextResponse.json(data);
  } catch (error) {
    console.error('API Route: Proxy error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
};
