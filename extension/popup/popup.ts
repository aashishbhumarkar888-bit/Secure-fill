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
  async isAutofillOnLoad(): Promise<boolean> {
    // @ts-ignore
    return StorageManager.isAutofillOnLoad();
  },
  async setAutofillOnLoad(enabled: boolean): Promise<void> {
    // @ts-ignore
    return StorageManager.setAutofillOnLoad(enabled);
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
    console.log('[SecureFill Popup] Initializing popup UI');

    const statusEl = document.getElementById('sf-status') as HTMLDivElement;
    const fullName = document.getElementById('sf-fullName') as HTMLInputElement;
    const email = document.getElementById('sf-email') as HTMLInputElement;
    const phone = document.getElementById('sf-phone') as HTMLInputElement;
    const saveBtn = document.getElementById('sf-save') as HTMLButtonElement;
    const autofillNow = document.getElementById('sf-autofillNow') as HTMLButtonElement;
    const clearBtn = document.getElementById('sf-clear') as HTMLButtonElement;
    const blockBtn = document.getElementById('sf-blockDomain') as HTMLButtonElement;
    const autofillOnLoad = document.getElementById('sf-autofillOnLoad') as HTMLInputElement;

    // Load existing profile
    try {
      const profile = await StorageManager.getUserProfile();
      fullName.value = profile.fullName ?? '';
      email.value = profile.email ?? '';
      phone.value = profile.phone ?? '';
    } catch (err) {
      console.warn('[SecureFill Popup] No existing profile', err);
    }

    // Load autofill-on-load flag
    try {
      // @ts-ignore
      const onLoad = await StorageManager.isAutofillOnLoad();
      autofillOnLoad.checked = !!onLoad;
    } catch {}

    saveBtn.addEventListener('click', async () => {
      const profile: UserProfile = {
        fullName: fullName.value,
        email: email.value,
        phone: phone.value,
      } as unknown as UserProfile;

      try {
        await StorageManager.saveUserProfile(profile);
        statusEl.textContent = 'Profile saved.';
      } catch (err) {
        statusEl.textContent = 'Failed to save profile';
      }
    });

    autofillNow.addEventListener('click', async () => {
      statusEl.textContent = 'Sending autofill request...';
      try {
        chrome.runtime.sendMessage({ type: 'REQUEST_AUTOFILL' }, (resp) => {
          if (chrome.runtime.lastError) {
            statusEl.textContent = 'Autofill error';
          } else {
            statusEl.textContent = 'Autofill requested';
          }
        });
      } catch (err) {
        statusEl.textContent = 'Autofill failed';
      }
    });

    clearBtn.addEventListener('click', async () => {
      await StorageManager.clearAll();
      statusEl.textContent = 'Cleared stored data';
    });

    blockBtn.addEventListener('click', async () => {
      try {
        const domain = new URL(window.location.href).hostname;
        await StorageManager.addBlockedDomain(domain);
        statusEl.textContent = `Blocked ${domain}`;
      } catch (err) {
        statusEl.textContent = 'Could not block domain';
      }
    });

    autofillOnLoad.addEventListener('change', async () => {
      const enabled = autofillOnLoad.checked;
      // @ts-ignore
      await StorageManager.setAutofillOnLoad(enabled);
      statusEl.textContent = enabled ? 'Autofill on load enabled' : 'Autofill on load disabled';
    });

    console.log('[SecureFill Popup] Initialized');
  } catch (error) {
    console.error('[SecureFill Popup] Initialization error:', error);
  }
}

// Call init when script loads
initPopup();
