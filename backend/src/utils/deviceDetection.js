/**
 * Parse user agent string to extract device information
 * @param {string} userAgent - User agent string from request headers
 * @returns {Object} - Parsed device information
 */
export const parseUserAgent = (userAgent) => {
  if (!userAgent) {
    return {
      platform: 'Unknown',
      browser: 'Unknown',
      version: 'Unknown',
      isMobile: false,
      isTablet: false,
      isDesktop: true
    };
  }

  const ua = userAgent.toLowerCase();
  
  // Detect platform/OS
  let platform = 'Unknown';
  if (ua.includes('windows')) {
    platform = 'Windows';
  } else if (ua.includes('macintosh') || ua.includes('mac os x')) {
    platform = 'macOS';
  } else if (ua.includes('linux')) {
    platform = 'Linux';
  } else if (ua.includes('android')) {
    platform = 'Android';
  } else if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
    platform = 'iOS';
  }

  // Detect browser
  let browser = 'Unknown';
  let version = 'Unknown';
  
  if (ua.includes('chrome') && !ua.includes('chromium') && !ua.includes('edg')) {
    browser = 'Chrome';
    const match = ua.match(/chrome\/([0-9.]+)/);
    version = match ? match[1] : 'Unknown';
  } else if (ua.includes('firefox')) {
    browser = 'Firefox';
    const match = ua.match(/firefox\/([0-9.]+)/);
    version = match ? match[1] : 'Unknown';
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    browser = 'Safari';
    const match = ua.match(/version\/([0-9.]+)/);
    version = match ? match[1] : 'Unknown';
  } else if (ua.includes('edg')) {
    browser = 'Edge';
    const match = ua.match(/edg\/([0-9.]+)/);
    version = match ? match[1] : 'Unknown';
  } else if (ua.includes('opera') || ua.includes('opr')) {
    browser = 'Opera';
    const match = ua.match(/(opera|opr)\/([0-9.]+)/);
    version = match ? match[2] : 'Unknown';
  }

  // Detect device type
  const isMobile = /mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua);
  const isTablet = /tablet|ipad|playbook|silk/i.test(ua);
  const isDesktop = !isMobile && !isTablet;

  return {
    platform,
    browser,
    version,
    isMobile,
    isTablet,
    isDesktop,
    fullUserAgent: userAgent
  };
};

/**
 * Get device information from request
 * @param {Object} req - Express request object
 * @returns {Object} - Device information
 */
export const getDeviceInfo = (req) => {
  const userAgent = req.get('User-Agent') || '';
  const ip = req.ip || req.connection.remoteAddress || 'Unknown';
  
  const deviceInfo = parseUserAgent(userAgent);
  
  return {
    userAgent,
    ip,
    platform: deviceInfo.platform,
    browser: `${deviceInfo.browser} ${deviceInfo.version}`,
    isMobile: deviceInfo.isMobile,
    isTablet: deviceInfo.isTablet,
    isDesktop: deviceInfo.isDesktop
  };
};

import crypto from 'crypto';

/**
 * Generate device fingerprint
 * @param {Object} deviceInfo - Device information
 * @returns {string} - Unique device fingerprint
 */
export const generateDeviceFingerprint = (deviceInfo) => {
  const fingerprintData = [
    deviceInfo.userAgent,
    deviceInfo.platform,
    deviceInfo.browser,
    // Note: IP is not included in fingerprint as it can change
  ].join('|');

  return crypto.createHash('sha256').update(fingerprintData).digest('hex');
};

/**
 * Check if device is suspicious based on patterns
 * @param {Object} deviceInfo - Device information
 * @param {Array} recentDevices - Recent devices for comparison
 * @returns {Object} - Suspicion analysis
 */
export const analyzeDeviceSuspicion = (deviceInfo, recentDevices = []) => {
  const suspiciousPatterns = [];
  let suspicionScore = 0;

  // Check for bot-like user agents
  const botPatterns = [
    /bot/i, /crawler/i, /spider/i, /scraper/i,
    /curl/i, /wget/i, /python/i, /java/i
  ];
  
  if (botPatterns.some(pattern => pattern.test(deviceInfo.userAgent))) {
    suspiciousPatterns.push('Bot-like user agent detected');
    suspicionScore += 50;
  }

  // Check for unusual browser/platform combinations
  const unusualCombinations = [
    { browser: 'Safari', platform: 'Windows' },
    { browser: 'Safari', platform: 'Linux' },
    { browser: 'Safari', platform: 'Android' }
  ];
  
  if (unusualCombinations.some(combo => 
    deviceInfo.browser.includes(combo.browser) && 
    deviceInfo.platform === combo.platform
  )) {
    suspiciousPatterns.push('Unusual browser/platform combination');
    suspicionScore += 20;
  }

  // Check for rapid device changes
  if (recentDevices.length > 0) {
    const uniquePlatforms = new Set(recentDevices.map(d => d.platform));
    const uniqueBrowsers = new Set(recentDevices.map(d => d.browser));
    
    if (uniquePlatforms.size > 3) {
      suspiciousPatterns.push('Multiple platforms used recently');
      suspicionScore += 30;
    }
    
    if (uniqueBrowsers.size > 4) {
      suspiciousPatterns.push('Multiple browsers used recently');
      suspicionScore += 20;
    }
  }

  // Check for missing or minimal user agent
  if (!deviceInfo.userAgent || deviceInfo.userAgent.length < 20) {
    suspiciousPatterns.push('Minimal or missing user agent');
    suspicionScore += 40;
  }

  return {
    isSuspicious: suspicionScore > 50,
    suspicionScore,
    patterns: suspiciousPatterns,
    riskLevel: suspicionScore > 80 ? 'HIGH' : 
               suspicionScore > 50 ? 'MEDIUM' : 
               suspicionScore > 20 ? 'LOW' : 'MINIMAL'
  };
};

/**
 * Get human-readable device description
 * @param {Object} deviceInfo - Device information
 * @returns {string} - Human-readable description
 */
export const getDeviceDescription = (deviceInfo) => {
  const { platform, browser, isMobile, isTablet } = deviceInfo;
  
  let deviceType = 'Desktop';
  if (isMobile) deviceType = 'Mobile';
  if (isTablet) deviceType = 'Tablet';
  
  return `${browser} on ${platform} (${deviceType})`;
};

/**
 * Compare two devices for similarity
 * @param {Object} device1 - First device info
 * @param {Object} device2 - Second device info
 * @returns {Object} - Similarity analysis
 */
export const compareDevices = (device1, device2) => {
  const similarities = [];
  const differences = [];
  
  if (device1.platform === device2.platform) {
    similarities.push('Same platform');
  } else {
    differences.push(`Different platforms: ${device1.platform} vs ${device2.platform}`);
  }
  
  if (device1.browser === device2.browser) {
    similarities.push('Same browser');
  } else {
    differences.push(`Different browsers: ${device1.browser} vs ${device2.browser}`);
  }
  
  if (device1.ip === device2.ip) {
    similarities.push('Same IP address');
  } else {
    differences.push('Different IP addresses');
  }
  
  const similarityScore = similarities.length / (similarities.length + differences.length);
  
  return {
    similarityScore,
    similarities,
    differences,
    isSameDevice: similarityScore > 0.8,
    isLikelyRelated: similarityScore > 0.5
  };
};

/**
 * Extract location info from IP (placeholder for future IP geolocation)
 * @param {string} ip - IP address
 * @returns {Object} - Location information
 */
export const getLocationFromIP = async (ip) => {
  // Placeholder for IP geolocation service integration
  // In production, you would integrate with services like:
  // - MaxMind GeoIP2
  // - IPinfo
  // - ipapi
  
  return {
    country: 'Unknown',
    city: 'Unknown',
    timezone: 'UTC',
    isp: 'Unknown'
  };
};

/**
 * Validate device info structure
 * @param {Object} deviceInfo - Device information to validate
 * @returns {boolean} - True if valid structure
 */
export const isValidDeviceInfo = (deviceInfo) => {
  const requiredFields = ['userAgent', 'ip', 'platform', 'browser'];
  
  return requiredFields.every(field => 
    deviceInfo && 
    typeof deviceInfo[field] === 'string' && 
    deviceInfo[field].length > 0
  );
};

export default {
  parseUserAgent,
  getDeviceInfo,
  generateDeviceFingerprint,
  analyzeDeviceSuspicion,
  getDeviceDescription,
  compareDevices,
  getLocationFromIP,
  isValidDeviceInfo
};
