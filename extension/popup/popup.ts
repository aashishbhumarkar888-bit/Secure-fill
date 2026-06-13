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

    // Get all input fields
    const fields: Record<keyof UserProfile, HTMLInputElement | HTMLSelectElement> = {
      fullName: document.getElementById('sf-fullName') as HTMLInputElement,
      firstName: document.getElementById('sf-firstName') as HTMLInputElement,
      lastName: document.getElementById('sf-lastName') as HTMLInputElement,
      email: document.getElementById('sf-email') as HTMLInputElement,
      phone: document.getElementById('sf-phone') as HTMLInputElement,
      age: document.getElementById('sf-age') as HTMLInputElement,
      gender: document.getElementById('sf-gender') as HTMLSelectElement,
      dateOfBirth: document.getElementById('sf-dateOfBirth') as HTMLInputElement,
      address: document.getElementById('sf-address') as HTMLInputElement,
      city: document.getElementById('sf-city') as HTMLInputElement,
      state: document.getElementById('sf-state') as HTMLInputElement,
      country: document.getElementById('sf-country') as HTMLInputElement,
      pincode: document.getElementById('sf-pincode') as HTMLInputElement,
      id: document.getElementById('sf-id') as HTMLInputElement,
      enrollmentNumber: document.getElementById('sf-enrollmentNumber') as HTMLInputElement,
      enroll: undefined as any,
      linkedin: document.getElementById('sf-linkedin') as HTMLInputElement,
      github: document.getElementById('sf-github') as HTMLInputElement,
      resumeUrl: undefined as any,
      resumeText: undefined as any,
      lastUpdated: undefined as any,
      version: undefined as any,
    };

    const saveBtn = document.getElementById('sf-save') as HTMLButtonElement;
    const autofillNow = document.getElementById('sf-autofillNow') as HTMLButtonElement;
    const clearBtn = document.getElementById('sf-clear') as HTMLButtonElement;
    const blockBtn = document.getElementById('sf-blockDomain') as HTMLButtonElement;
    const autofillOnLoad = document.getElementById('sf-autofillOnLoad') as HTMLInputElement;

    const showStatus = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
      statusEl.textContent = message;
      statusEl.className = `status ${type}`;
      statusEl.style.display = 'block';
      setTimeout(() => {
        statusEl.style.display = 'none';
      }, 3000);
    };

    // Load existing profile
    try {
      const profile = await StorageManager.getUserProfile();
      
      // Populate all fields
      Object.entries(fields).forEach(([key, element]) => {
        if (element && profile[key as keyof UserProfile]) {
          element.value = String(profile[key as keyof UserProfile]) || '';
        }
      });
    } catch (err) {
      console.warn('[SecureFill Popup] No existing profile, using defaults', err);
    }

    // Load autofill-on-load flag
    try {
      // @ts-ignore
      const onLoad = await StorageManager.isAutofillOnLoad();
      autofillOnLoad.checked = !!onLoad;
    } catch {}

    // Save button handler
    saveBtn.addEventListener('click', async () => {
      const profile: Partial<UserProfile> = {};
      
      Object.entries(fields).forEach(([key, element]) => {
        if (element && element.value) {
          profile[key as keyof UserProfile] = element.value as any;
        }
      });

      profile.lastUpdated = new Date().toISOString();
      profile.version = 1;

      try {
        await StorageManager.saveUserProfile(profile as UserProfile);
        showStatus('✓ Profile saved successfully!', 'success');
      } catch (err) {
        showStatus('✗ Failed to save profile', 'error');
        console.error(err);
      }
    });

    // Autofill button handler
    autofillNow.addEventListener('click', async () => {
      showStatus('Filling form...', 'info');
      try {
        chrome.runtime.sendMessage({ type: 'REQUEST_AUTOFILL' }, (resp) => {
          if (chrome.runtime.lastError) {
            showStatus('✗ Autofill error', 'error');
          } else if (resp?.success) {
            showStatus('✓ Form filled!', 'success');
          } else {
            showStatus('Form filled (check tab)', 'info');
          }
        });
      } catch (err) {
        showStatus('✗ Autofill failed', 'error');
        console.error(err);
      }
    });

    // Clear button handler
    clearBtn.addEventListener('click', async () => {
      if (confirm('Clear all saved data?')) {
        try {
          await StorageManager.clearAll();
          
          // Clear all form fields
          Object.values(fields).forEach((el) => {
            if (el) el.value = '';
          });
          
          showStatus('✓ All data cleared', 'success');
        } catch (err) {
          showStatus('✗ Failed to clear data', 'error');
        }
      }
    });

    // Block domain button handler
    blockBtn.addEventListener('click', async () => {
      try {
        const domain = new URL(window.location.href).hostname;
        await StorageManager.addBlockedDomain(domain);
        showStatus(`✓ Blocked ${domain}`, 'success');
      } catch (err) {
        showStatus('✗ Could not block domain', 'error');
      }
    });

    // Autofill on load checkbox
    autofillOnLoad.addEventListener('change', async () => {
      const enabled = autofillOnLoad.checked;
      // @ts-ignore
      await StorageManager.setAutofillOnLoad(enabled);
      showStatus(enabled ? '✓ Autofill on load enabled' : '✓ Autofill on load disabled', 'success');
    });

    console.log('[SecureFill Popup] Initialized');
  } catch (error) {
    console.error('[SecureFill Popup] Initialization error:', error);
  }
}

// Call init when script loads
initPopup();
