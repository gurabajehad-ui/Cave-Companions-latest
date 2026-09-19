import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

/**
 * Standard Bengali error message for rate-limited requests
 */
const rateLimitMessage = {
  success: false,
  error: 'TOO_MANY_REQUESTS',
  message: 'অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।'
};

const skipTestBypass = (req: any) => {
  return (
    process.env.DISABLE_RATE_LIMIT === 'true' ||
    req.headers['x-bypass-time-validation'] === 'true' ||
    req.ip === '127.0.0.1' ||
    req.ip === '::1'
  );
};

// Safe key generator compatible with IPv6, Cloud Run reverse proxies and shared NATs
const safeKeyGenerator = (req: any, res: any) => {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    const firstIp = typeof forwardedFor === 'string' ? forwardedFor.split(',')[0] : forwardedFor[0];
    if (firstIp && typeof firstIp === 'string') return firstIp.trim();
  }
  return req.ip || ipKeyGenerator(req, res);
};

/**
 * Rate limiter for Mosque prayer verification
 * Max: 300 attempts per minute
 */
export const prayerVerificationRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipTestBypass,
  message: rateLimitMessage,
  keyGenerator: safeKeyGenerator
});

export const qrVerificationRateLimiter = prayerVerificationRateLimiter;

/**
 * Rate limiter for Merchant / Partner Shop Token Redemption
 * Max: 300 attempts per minute
 */
export const redemptionRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipTestBypass,
  message: rateLimitMessage,
  keyGenerator: safeKeyGenerator
});

/**
 * Rate limiter for Authentication (Login / OTP Verify)
 * Max: 300 attempts per minute
 */
export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipTestBypass,
  message: rateLimitMessage,
  keyGenerator: safeKeyGenerator
});

/**
 * Rate limiter for OTP Generation / SMS request
 * Max: 150 attempts per minute
 */
export const otpRequestRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipTestBypass,
  message: rateLimitMessage,
  keyGenerator: safeKeyGenerator
});

/**
 * Rate limiter for Admin Verification
 * Max: 300 attempts per minute
 */
export const adminAuthRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipTestBypass,
  message: rateLimitMessage,
  keyGenerator: safeKeyGenerator
});

