import dns from 'node:dns/promises';
import net from 'node:net';

const PRIVATE_IPV4_RANGES = [
  { start: ipToLong('10.0.0.0'), end: ipToLong('10.255.255.255') },
  { start: ipToLong('127.0.0.0'), end: ipToLong('127.255.255.255') },
  { start: ipToLong('169.254.0.0'), end: ipToLong('169.254.255.255') },
  { start: ipToLong('172.16.0.0'), end: ipToLong('172.31.255.255') },
  { start: ipToLong('192.168.0.0'), end: ipToLong('192.168.255.255') },
  { start: ipToLong('0.0.0.0'), end: ipToLong('0.255.255.255') },
  { start: ipToLong('100.64.0.0'), end: ipToLong('100.127.255.255') } // CGNAT
];

function ipToLong(ip) {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

function isPrivateIp(ip) {
  if (net.isIPv4(ip)) {
    const long = ipToLong(ip);
    return PRIVATE_IPV4_RANGES.some(range => long >= range.start && long <= range.end);
  }
  if (net.isIPv6(ip)) {
    const lower = ip.toLowerCase();
    return (
      lower === '::1' ||
      lower === '::' ||
      lower.startsWith('fe80:') || // Link-local
      lower.startsWith('fc00:') || // Unique local
      lower.startsWith('fd00:')
    );
  }
  return true;
}

export async function validateSafeUrl(urlString) {
  let parsed;
  try {
    parsed = new URL(urlString);
  } catch {
    return { safe: false, reason: 'Malformed URL format' };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { safe: false, reason: `Forbidden protocol: ${parsed.protocol}. Only http and https are permitted.` };
  }

  const hostname = parsed.hostname;
  if (!hostname || hostname.trim() === '') {
    return { safe: false, reason: 'URL must contain a valid hostname' };
  }

  // Reject raw localhost
  if (hostname === 'localhost' || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
    return { safe: false, reason: 'Access to local domain names is prohibited' };
  }

  // Resolve DNS to verify IP is not in private range
  try {
    const addresses = await dns.lookup(hostname, { all: true });
    if (!addresses || addresses.length === 0) {
      return { safe: false, reason: `Hostname '${hostname}' could not be resolved` };
    }

    for (const record of addresses) {
      if (isPrivateIp(record.address)) {
        return {
          safe: false,
          reason: `Resolved IP (${record.address}) for ${hostname} belongs to private or link-local address space.`
        };
      }
    }

    return { safe: true, resolvedIp: addresses[0].address };
  } catch (err) {
    return { safe: false, reason: `DNS lookup failed: ${err.message}` };
  }
}

export async function safeFetch(urlString, { maxSizeBytes = 2 * 1024 * 1024, timeoutMs = 8000 } = {}) {
  const validation = await validateSafeUrl(urlString);
  if (!validation.safe) {
    throw new Error(`SSRF Prevention: URL check failed - ${validation.reason}`);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(urlString, {
      signal: controller.signal,
      redirect: 'manual', // do not blindly follow redirects to bypass SSRF
      headers: {
        'User-Agent': 'AgentReceipt-Verifier/1.0'
      }
    });

    // Check if redirect
    if ([301, 302, 303, 307, 308].includes(res.status)) {
      const location = res.headers.get('location');
      if (!location) {
        throw new Error('Redirect returned without Location header');
      }
      const redirectUrl = new URL(location, urlString).toString();
      // Recursively validate next target
      return safeFetch(redirectUrl, { maxSizeBytes, timeoutMs });
    }

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        statusText: res.statusText,
        body: null
      };
    }

    const contentType = res.headers.get('content-type') || '';
    const contentLength = parseInt(res.headers.get('content-length') || '0', 10);
    if (contentLength > maxSizeBytes) {
      throw new Error(`Response size exceeds limit of ${maxSizeBytes} bytes`);
    }

    const text = await res.text();
    if (text.length > maxSizeBytes) {
      throw new Error(`Content exceeds limit of ${maxSizeBytes} bytes`);
    }

    return {
      ok: true,
      status: res.status,
      contentType,
      body: text
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
