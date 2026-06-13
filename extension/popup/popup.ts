/**
 * Popup TypeScript Script
 * Integrates extension popup with Vite React app
 */

import { StorageManager } from '../storage/storage';
import type { UserProfile } from '../types/profile';

// API to communicate with content scripts and background
export const ExtensionAPI = {
  /**
   * Get stored user profile
   */
  async getUserProfile(): Promise<UserProfile> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { type: 'GET_STORED_PROFILE' },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else if (response?.profile) {
            resolve(response.profile);
          } else {
            reject(new Error('No profile found'));
          }
        }
      );
    });
  },

  /**
   * Save user profile
   */
  async saveUserProfile(profile: UserProfile): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { type: 'STORE_PROFILE', data: profile },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else if (response?.success) {
            resolve();
          } else {
            reject(new Error(response?.error || 'Failed to save profile'));
          }
        }
      );
    });
  },

  /**
   * Update user profile
   */
  async updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { type: 'UPDATE_PROFILE', data: updates },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else if (response?.success && response?.profile) {
            resolve(response.profile);
          } else {
            reject(new Error(response?.error || 'Failed to update profile'));
          }
        }
      );
    });
  },

  /**
   * Request autofill on current tab
   */
  async requestAutofill(): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs[0]?.id) {
          reject(new Error('No active tab found'));
          return;
        }

        chrome.tabs.sendMessage(
          tabs[0].id,
          { type: 'REQUEST_AUTOFILL' },
          (response) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else if (response?.success) {
              resolve();
            } else {
              reject(new Error(response?.error || 'Autofill request failed'));
            }
          }
        );
      });
    });
  },

  /**
   * Check if autofill is enabled
   */
  async isAutofillEnabled(): Promise<boolean> {
    return StorageManager.isAutofillEnabled();
  },

  /**
   * Set autofill enabled
   */
  async setAutofillEnabled(enabled: boolean): Promise<void> {
    return StorageManager.setAutofillEnabled(enabled);
  },

  /**
   * Get blocked domains
   */
  async getBlockedDomains(): Promise<string[]> {
    return StorageManager.getBlockedDomains();
  },

  /**
   * Block a domain
   */
  async blockDomain(domain: string): Promise<void> {
    return StorageManager.addBlockedDomain(domain);
  },

  /**
   * Unblock a domain
   */
  async unblockDomain(domain: string): Promise<void> {
    return StorageManager.removeBlockedDomain(domain);
  },

  /**
   * Clear all data
   */
  async clearAllData(): Promise<void> {
    return StorageManager.clearAll();
  },
};

// Make API available globally for the React app
declare global {
  interface Window {
    securefillAPI: typeof ExtensionAPI;
  }
}

window.securefillAPI = ExtensionAPI;

/**
 * Initialize popup - can be called from React app
 */
export async function initPopup(): Promise<void> {
  try {
    // Profile will be loaded by the React app using the API
    console.log('[SecureFill Popup] Initialized');
  } catch (error) {
    console.error('[SecureFill Popup] Initialization error:', error);
  }
}

// Call init when script loads
initPopup();
