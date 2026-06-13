/**
 * Floating Autofill Button UI Component
 * Displays floating button when forms are detected
 */

export interface FloatingButtonConfig {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  zIndex?: number;
  animationDuration?: number;
}

export class FloatingButton {
  private container: HTMLDivElement | null = null;
  private button: HTMLButtonElement | null = null;
  private isVisible = false;
  private config: Required<FloatingButtonConfig>;

  constructor(config: FloatingButtonConfig = {}) {
    this.config = {
      position: config.position || 'bottom-right',
      zIndex: config.zIndex || 10000,
      animationDuration: config.animationDuration || 300,
    };
  }

  /**
   * Create and inject floating button into page
   */
  create(onClickCallback: () => void): void {
    if (this.container) {
      return; // Already created
    }

    // Create container
    this.container = document.createElement('div');
    this.container.id = 'securefill-floating-button-container';
    this.container.style.cssText = `
      position: fixed;
      ${this.getPositionStyles()}
      z-index: ${this.config.zIndex};
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    `;

    // Create button
    this.button = document.createElement('button');
    this.button.id = 'securefill-floating-button';
    this.button.setAttribute('aria-label', 'SecureFill AI - Autofill this form');
    this.button.style.cssText = `
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 50%;
      width: 56px;
      height: 56px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4), 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      padding: 0;
      margin: 0;
      font-weight: 600;
      opacity: 0;
      transform: scale(0);
    `;

    // Add icon (using Unicode magic wand emoji)
    this.button.innerHTML = '✨';

    // Add hover effects
    this.button.addEventListener('mouseenter', () => {
      this.button!.style.transform = 'scale(1.1)';
      this.button!.style.boxShadow = `0 6px 16px rgba(102, 126, 234, 0.5), 0 3px 6px rgba(0, 0, 0, 0.15)`;
    });

    this.button.addEventListener('mouseleave', () => {
      this.button!.style.transform = 'scale(1)';
      this.button!.style.boxShadow = `0 4px 12px rgba(102, 126, 234, 0.4), 0 2px 4px rgba(0, 0, 0, 0.1)`;
    });

    // Add click handler
    this.button.addEventListener('click', (e) => {
      e.stopPropagation();
      onClickCallback();
    });

    this.container.appendChild(this.button);
    document.body.appendChild(this.container);
  }

  /**
   * Show button with animation
   */
  show(): void {
    if (!this.button || this.isVisible) {
      return;
    }

    this.isVisible = true;
    this.button.style.opacity = '1';
    this.button.style.transform = 'scale(1)';
  }

  /**
   * Hide button with animation
   */
  hide(): void {
    if (!this.button || !this.isVisible) {
      return;
    }

    this.isVisible = false;
    this.button.style.opacity = '0';
    this.button.style.transform = 'scale(0)';
  }

  /**
   * Show loading state
   */
  setLoading(loading: boolean): void {
    if (!this.button) return;

    if (loading) {
      this.button.innerHTML = '⏳';
      this.button.disabled = true;
      this.button.style.opacity = '0.7';
    } else {
      this.button.innerHTML = '✨';
      this.button.disabled = false;
      this.button.style.opacity = '1';
    }
  }

  /**
   * Show success state
   */
  showSuccess(): void {
    if (!this.button) return;

    const originalContent = this.button.innerHTML;
    this.button.innerHTML = '✓';
    this.button.style.background = 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)';

    setTimeout(() => {
      if (this.button) {
        this.button.innerHTML = originalContent;
        this.button.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      }
    }, 2000);
  }

  /**
   * Show error state
   */
  showError(message?: string): void {
    if (!this.button) return;

    const originalContent = this.button.innerHTML;
    this.button.innerHTML = '✗';
    this.button.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';

    if (message) {
      this.showNotification(message, 'error');
    }

    setTimeout(() => {
      if (this.button) {
        this.button.innerHTML = originalContent;
        this.button.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      }
    }, 2000);
  }

  /**
   * Show notification toast
   */
  private showNotification(message: string, type: 'success' | 'error' = 'success'): void {
    const notification = document.createElement('div');
    notification.id = 'securefill-notification';
    notification.style.cssText = `
      position: fixed;
      bottom: 80px;
      right: 20px;
      background: ${type === 'success' ? '#10b981' : '#ef4444'};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: ${this.config.zIndex - 1};
      font-size: 14px;
      animation: slideIn 0.3s ease-out;
      max-width: 300px;
      word-wrap: break-word;
    `;

    notification.textContent = message;
    document.body.appendChild(notification);

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateY(20px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.remove();
      style.remove();
    }, 3000);
  }

  /**
   * Get position CSS styles
   */
  private getPositionStyles(): string {
    const positions: Record<string, string> = {
      'bottom-right': 'bottom: 20px; right: 20px;',
      'bottom-left': 'bottom: 20px; left: 20px;',
      'top-right': 'top: 20px; right: 20px;',
      'top-left': 'top: 20px; left: 20px;',
    };

    return positions[this.config.position];
  }

  /**
   * Remove button from page
   */
  remove(): void {
    if (this.container) {
      this.container.remove();
      this.container = null;
      this.button = null;
      this.isVisible = false;
    }
  }

  /**
   * Update button position
   */
  setPosition(position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'): void {
    this.config.position = position;
    if (this.container) {
      this.container.style.cssText = `
        position: fixed;
        ${this.getPositionStyles()}
        z-index: ${this.config.zIndex};
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      `;
    }
  }
}
