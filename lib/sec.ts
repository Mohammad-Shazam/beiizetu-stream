import crypto from 'crypto';

const STREAM_SECRET = process.env.STREAM_SECRET || 'change_me_super_long';

/**
 * Sign a URL with expiration and signature
 * @param path The path to sign (e.g., '/hls/videoId/master.m3u8')
 * @param ttlSec Time to live in seconds
 * @returns Signed URL with query parameters
 */
export function sign(path: string, ttlSec: number): string {
  const exp = Math.floor(Date.now() / 1000) + ttlSec;
  const data = `${path}:${exp}`;
  const sig = crypto.createHmac('sha256', STREAM_SECRET).update(data).digest('hex');
  
  return `${path}?exp=${exp}&sig=${sig}`;
}

/**
 * Verify a signed URL
 * @param pathFromHeader The original path from the request
 * @param exp Expiration timestamp from query
 * @param sig Signature from query
 * @returns True if valid, false otherwise
 */
export function verify(pathFromHeader: string, exp: string, sig: string): boolean {
  try {
    // Check if expiration is valid number
    const expNum = parseInt(exp, 10);
    if (isNaN(expNum)) return false;
    
    // Check if expired
    const now = Math.floor(Date.now() / 1000);
    if (expNum < now) return false;
    
    // Verify signature
    const data = `${pathFromHeader}:${exp}`;
    const expectedSig = crypto.createHmac('sha256', STREAM_SECRET).update(data).digest('hex');
    
    // Use timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expectedSig, 'hex'));
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}