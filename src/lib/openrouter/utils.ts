/**
 * Extracts the domain name from a URL
 * @param url The URL to extract the domain from
 * @returns The domain name or null if invalid URL
 */
export function extractDomain(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch (error) {
    return null;
  }
}

/**
 * Extracts the domain name from a URL
 * @param url The URL to extract the domain from
 * @returns The domain name or the full URL if invalid
 */
export function getDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch (error) {
    return url;
  }
}
