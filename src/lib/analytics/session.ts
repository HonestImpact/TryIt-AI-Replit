// Session Management - Privacy-first fingerprinting for Noah's analytics
// Elegant, GDPR-compliant session tracking without personal data

import crypto from 'crypto';

/**
 * Generate privacy-preserving session fingerprint
 * Uses only non-PII data for anonymous user tracking
 */
export function generateSessionFingerprint(
  userAgent?: string,
  ipAddress?: string,
  environment: string = 'development'
): string {
  // Create fingerprint from available non-PII data
  const components = [
    userAgent || 'unknown-ua',
    environment,
    Date.now().toString().slice(0, -6), // Remove last 6 digits for privacy (hourly granularity)
    Math.random().toString(36).substring(2, 8) // Add randomness for uniqueness
  ];

  // Hash the components for privacy
  const fingerprint = crypto
    .createHash('sha256')
    .update(components.join('|'))
    .digest('hex')
    .substring(0, 32); // Keep first 32 characters

  return `session_${fingerprint}`;
}

/**
 * Extract basic browser info for analytics (privacy-safe)
 */
export function extractBrowserInfo(userAgent?: string): {
  browser: string;
  platform: string;
  mobile: boolean;
} {
  if (!userAgent) {
    return { browser: 'unknown', platform: 'unknown', mobile: false };
  }

  const ua = userAgent.toLowerCase();
  
  // Browser detection
  let browser = 'unknown';
  if (ua.includes('chrome')) browser = 'chrome';
  else if (ua.includes('firefox')) browser = 'firefox';
  else if (ua.includes('safari')) browser = 'safari';
  else if (ua.includes('edge')) browser = 'edge';

  // Platform detection
  let platform = 'unknown';
  if (ua.includes('windows')) platform = 'windows';
  else if (ua.includes('mac')) platform = 'macos';
  else if (ua.includes('linux')) platform = 'linux';
  else if (ua.includes('android')) platform = 'android';
  else if (ua.includes('ios')) platform = 'ios';

  // Mobile detection
  const mobile = ua.includes('mobile') || ua.includes('android') || ua.includes('iphone');

  return { browser, platform, mobile };
}

/**
 * Validate session fingerprint format
 */
export function isValidSessionFingerprint(fingerprint: string): boolean {
  return /^session_[a-f0-9]{32}$/.test(fingerprint);
}