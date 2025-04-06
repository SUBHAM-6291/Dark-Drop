import { NextRequest, NextResponse } from 'next/server';
import { RateLimiterMemory } from 'rate-limiter-flexible';

const rateLimiter = new RateLimiterMemory({
  points: 5,
  duration: 60,
});

export default async function middleware(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] 

  try {
    await rateLimiter.consume(ip??'undefined');
    return NextResponse.next();
  } catch (error) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a minute and try again.' },
      { status: 429 }
    );
  }
}

export const config = {
  matcher: '/api/:path*',
};