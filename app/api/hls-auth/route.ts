import { NextRequest, NextResponse } from 'next/server';
import { verify } from '@/lib/sec';

export async function GET(request: NextRequest) {
  try {
    // Get original URI from header or request URL
    const originalUri = request.headers.get('x-original-uri') || request.url;
    
    // Parse URL to get query parameters
    const url = new URL(originalUri, `http://${request.headers.get('host')}`);
    const path = url.pathname;
    const exp = url.searchParams.get('exp');
    const sig = url.searchParams.get('sig');

    if (!exp || !sig) {
      return new NextResponse(null, { status: 403 });
    }

    // Verify signature and expiration
    const isValid = verify(path, exp, sig);
    
    if (isValid) {
      return new NextResponse(null, { status: 204 });
    } else {
      return new NextResponse(null, { status: 403 });
    }
  } catch (error) {
    console.error('Auth hook error:', error);
    return new NextResponse(null, { status: 403 });
  }
}