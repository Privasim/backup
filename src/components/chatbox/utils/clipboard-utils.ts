'use client';

/**
 * Clipboard utilities for copying content with fallback support
 */
export class ClipboardUtils {
  /**
   * Copy text to clipboard with fallback for older browsers
   */
  static async copyToClipboard(text: string): Promise<boolean> {
    try {
      // Modern clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      
      // Fallback for older browsers
      return this.fallbackCopyToClipboard(text);
    } catch (error) {
      console.warn('Failed to copy to clipboard:', error);
      return this.fallbackCopyToClipboard(text);
    }
  }

  /**
   * Fallback method using document.execCommand (deprecated but widely supported)
   */
  private static fallbackCopyToClipboard(text: string): boolean {
    try {
      // Create a temporary textarea element
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      
      // Select and copy the text
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      return successful;
    } catch (error) {
      console.error('Fallback copy failed:', error);
      return false;
    }
  }

  /**
   * Copy formatted content with HTML support
   */
  static async copyFormattedContent(
    plainText: string, 
    htmlContent?: string
  ): Promise<boolean> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        const clipboardItems = [];
        
        // Add plain text
        clipboardItems.push(new ClipboardItem({
          'text/plain': new Blob([plainText], { type: 'text/plain' })
        }));
        
        // Add HTML if provided
        if (htmlContent) {
          clipboardItems.push(new ClipboardItem({
            'text/html': new Blob([htmlContent], { type: 'text/html' })
          }));
        }
        
        await navigator.clipboard.write(clipboardItems);
        return true;
      }
      
      // Fallback to plain text only
      return this.fallbackCopyToClipboard(plainText);
    } catch (error) {
      console.warn('Failed to copy formatted content:', error);
      return this.fallbackCopyToClipboard(plainText);
    }
  }

  /**
   * Check if clipboard API is available
   */
  static isClipboardSupported(): boolean {
    return !!(navigator.clipboard || document.execCommand);
  }

  /**
   * Read text from clipboard (requires user permission)
   */
  static async readFromClipboard(): Promise<string | null> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        const text = await navigator.clipboard.readText();
        return text;
      }
      
      // No fallback for reading clipboard in older browsers
      return null;
    } catch (error) {
      console.warn('Failed to read from clipboard:', error);
      return null;
    }
  }

  /**
   * Copy content with user feedback
   */
  static async copyWithFeedback(
    text: string,
    onSuccess?: (message: string) => void,
    onError?: (error: string) => void
  ): Promise<void> {
    const success = await this.copyToClipboard(text);
    
    if (success) {
      const message = `Copied ${text.length} characters to clipboard`;
      if (onSuccess) {
        onSuccess(message);
      } else {
        // Show temporary notification if no callback provided
        this.showTemporaryNotification(message, 'success');
      }
    } else {
      const error = 'Failed to copy to clipboard';
      if (onError) {
        onError(error);
      } else {
        this.showTemporaryNotification(error, 'error');
      }
    }
  }

  /**
   * Show a temporary notification (simple implementation)
   */
  private static showTemporaryNotification(message: string, type: 'success' | 'error'): void {
    // Create notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 16px;
      border-radius: 6px;
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      z-index: 10000;
      transition: opacity 0.3s ease;
      ${type === 'success' 
        ? 'background-color: #10b981;' 
        : 'background-color: #ef4444;'
      }
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  /**
   * Copy analysis result with metadata
   */
  static async copyAnalysisResult(
    content: string,
    metadata?: {
      model?: string;
      timestamp?: string;
      analysisType?: string;
    }
  ): Promise<boolean> {
    let textToCopy = content;
    
    if (metadata) {
      const metadataLines = [];
      if (metadata.analysisType) metadataLines.push(`Analysis Type: ${metadata.analysisType}`);
      if (metadata.model) metadataLines.push(`Model: ${metadata.model}`);
      if (metadata.timestamp) metadataLines.push(`Generated: ${new Date(metadata.timestamp).toLocaleString()}`);
      
      if (metadataLines.length > 0) {
        textToCopy = `${metadataLines.join('\n')}\n\n${content}`;
      }
    }
    
    return this.copyToClipboard(textToCopy);
  }

  /**
   * Copy multiple messages as a conversation
   */
  static async copyConversation(
    messages: Array<{
      type: string;
      content: string;
      timestamp: string;
    }>,
    includeMetadata = true
  ): Promise<boolean> {
    const lines: string[] = [];
    
    if (includeMetadata) {
      lines.push(`Conversation Export - ${new Date().toLocaleString()}`);
      lines.push(`Messages: ${messages.length}`);
      lines.push('');
      lines.push('='.repeat(50));
      lines.push('');
    }
    
    messages.forEach((message, index) => {
      if (includeMetadata) {
        lines.push(`[${index + 1}] ${message.type.toUpperCase()}`);
        lines.push(`Time: ${new Date(message.timestamp).toLocaleString()}`);
        lines.push('');
      }
      
      lines.push(message.content);
      lines.push('');
      
      if (index < messages.length - 1) {
        lines.push('-'.repeat(30));
        lines.push('');
      }
    });
    
    return this.copyToClipboard(lines.join('\n'));
  }
}