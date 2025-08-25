import { 
  isValidParentMessage, 
  isValidIframeMessage, 
  isTrustedOrigin,
  type ParentToIframe,
  type IframeToParent
} from '../sandbox-protocol';

describe('sandbox-protocol', () => {
  describe('isValidParentMessage', () => {
    it('should accept valid load message', () => {
      const message: ParentToIframe = {
        type: 'load',
        js: 'console.log("test");'
      };

      expect(isValidParentMessage(message)).toBe(true);
    });

    it('should reject message without js property', () => {
      const message = {
        type: 'load'
      };

      expect(isValidParentMessage(message)).toBe(false);
    });

    it('should reject message with invalid type', () => {
      const message = {
        type: 'invalid',
        js: 'test'
      };

      expect(isValidParentMessage(message)).toBe(false);
    });

    it('should reject non-object messages', () => {
      expect(isValidParentMessage(null)).toBe(false);
      expect(isValidParentMessage(undefined)).toBe(false);
      expect(isValidParentMessage('string')).toBe(false);
      expect(isValidParentMessage(123)).toBe(false);
    });
  });

  describe('isValidIframeMessage', () => {
    it('should accept valid ready message', () => {
      const message: IframeToParent = {
        type: 'ready'
      };

      expect(isValidIframeMessage(message)).toBe(true);
    });

    it('should accept valid runtime-error message', () => {
      const message: IframeToParent = {
        type: 'runtime-error',
        message: 'Error occurred',
        stack: 'Error stack trace'
      };

      expect(isValidIframeMessage(message)).toBe(true);
    });

    it('should accept valid runtime-log message', () => {
      const message: IframeToParent = {
        type: 'runtime-log',
        data: { log: 'test data' }
      };

      expect(isValidIframeMessage(message)).toBe(true);
    });

    it('should reject runtime-error without message', () => {
      const message = {
        type: 'runtime-error'
      };

      expect(isValidIframeMessage(message)).toBe(false);
    });

    it('should reject message with invalid type', () => {
      const message = {
        type: 'invalid'
      };

      expect(isValidIframeMessage(message)).toBe(false);
    });

    it('should reject non-object messages', () => {
      expect(isValidIframeMessage(null)).toBe(false);
      expect(isValidIframeMessage(undefined)).toBe(false);
      expect(isValidIframeMessage('string')).toBe(false);
    });
  });

  describe('isTrustedOrigin', () => {
    it('should return true for matching origins', () => {
      expect(isTrustedOrigin('https://example.com', 'https://example.com')).toBe(true);
      expect(isTrustedOrigin('http://localhost:3000', 'http://localhost:3000')).toBe(true);
    });

    it('should return false for non-matching origins', () => {
      expect(isTrustedOrigin('https://malicious.com', 'https://example.com')).toBe(false);
      expect(isTrustedOrigin('http://localhost:3000', 'https://example.com')).toBe(false);
    });

    it('should be case-sensitive', () => {
      expect(isTrustedOrigin('https://Example.com', 'https://example.com')).toBe(false);
    });
  });
});
