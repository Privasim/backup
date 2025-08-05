/**
 * Secure storage utility for sensitive data like API keys
 * Uses basic encryption for localStorage values
 */

const ENCRYPTION_KEY = 'chatbox-secure-storage-key';

// Simple encryption/decryption for localStorage
// In production, consider using Web Crypto API
function encrypt(text: string): string {
  try {
    // Simple XOR encryption with base64 encoding
    const encoded = btoa(text.split('').map((char, i) => 
      String.fromCharCode(char.charCodeAt(0) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length))
    ).join(''));
    return encoded;
  } catch (error) {
    console.error('Encryption failed:', error);
    return text; // Fallback to plain text
  }
}

function decrypt(encryptedText: string): string {
  try {
    const decoded = atob(encryptedText);
    return decoded.split('').map((char, i) => 
      String.fromCharCode(char.charCodeAt(0) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length))
    ).join('');
  } catch (error) {
    console.error('Decryption failed:', error);
    return encryptedText; // Fallback to plain text
  }
}

export const SecureStorage = {
  setItem(key: string, value: string): void {
    try {
      const encrypted = encrypt(value);
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('Failed to securely store item:', error);
      // Fallback to plain storage
      localStorage.setItem(key, value);
    }
  },

  getItem(key: string): string | null {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;
      return decrypt(encrypted);
    } catch (error) {
      console.error('Failed to securely retrieve item:', error);
      return localStorage.getItem(key); // Fallback to plain retrieval
    }
  },

  removeItem(key: string): void {
    localStorage.removeItem(key);
  },

  clear(): void {
    localStorage.clear();
  }
};
