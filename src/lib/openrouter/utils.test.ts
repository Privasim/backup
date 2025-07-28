import { extractDomain, getDomain } from './utils';

describe('utils', () => {
  describe('extractDomain', () => {
    it('should extract domain from a valid URL', () => {
      expect(extractDomain('https://example.com')).toBe('example.com');
      expect(extractDomain('https://www.example.com')).toBe('example.com');
      expect(extractDomain('https://example.com/path/to/page')).toBe('example.com');
      expect(extractDomain('https://subdomain.example.com')).toBe('subdomain.example.com');
    });

    it('should return null for invalid URLs', () => {
      expect(extractDomain('invalid-url')).toBeNull();
      expect(extractDomain('')).toBeNull();
      expect(extractDomain('not-a-url')).toBeNull();
    });
  });

  describe('getDomain', () => {
    it('should extract domain from a valid URL', () => {
      expect(getDomain('https://example.com')).toBe('example.com');
      expect(getDomain('https://www.example.com')).toBe('example.com');
      expect(getDomain('https://example.com/path/to/page')).toBe('example.com');
      expect(getDomain('https://subdomain.example.com')).toBe('subdomain.example.com');
    });

    it('should return the original string for invalid URLs', () => {
      expect(getDomain('invalid-url')).toBe('invalid-url');
      expect(getDomain('')).toBe('');
      expect(getDomain('not-a-url')).toBe('not-a-url');
    });
  });
});
