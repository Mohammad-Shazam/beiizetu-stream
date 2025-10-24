import { NextRequest, NextResponse } from 'next/server';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
  standardHeaders?: boolean;
  legacyHeaders?: boolean;
}

// Simple in-memory rate limiter
const requests = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(options: RateLimitOptions) {
  return async (request: any) => {
    const ip = (request.ip || request.headers?.get('x-forwarded-for')) || 'unknown';
    const now = Date.now();
    const windowStart = now - options.windowMs;

    // Clean up old entries
    for (const [key, value] of requests.entries()) {
      if (value.resetTime < now) {
        requests.delete(key);
      }
    }

    // Get or create entry for this IP
    let entry = requests.get(ip);
    if (!entry || entry.resetTime < now) {
      entry = { count: 0, resetTime: now + options.windowMs };
      requests.set(ip, entry);
    }

    // Increment count
    entry.count++;

    // Check if limit exceeded
    if (entry.count > options.max) {
      const response = NextResponse.json(
        { error: options.message || 'Too many requests' },
        { status: 429 }
      );

      if (options.standardHeaders) {
        response.headers.set('X-RateLimit-Limit', options.max.toString());
        response.headers.set('X-RateLimit-Remaining', Math.max(0, options.max - entry.count).toString());
        response.headers.set('X-RateLimit-Reset', new Date(entry.resetTime).toISOString());
      }

      if (options.legacyHeaders) {
        response.headers.set('RateLimit-Limit', options.max.toString());
        response.headers.set('RateLimit-Remaining', Math.max(0, options.max - entry.count).toString());
        response.headers.set('RateLimit-Reset', Math.floor(entry.resetTime / 1000).toString());
      }

      return response;
    }

    return null; // No rate limit response, continue with the request
  };
}