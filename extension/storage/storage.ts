/**
 * Chrome Storage Utility Layer
 * Handles all storage operations for user profile data
 */

import type { UserProfile } from '../types/profile';
import { DEFAULT_USER_PROFILE } from '../types/profile';

const STORAGE_KEYS = {
  USER_PROFILE: 'securefill_user_profile',
  AUTOFILL_ENABLED: 'securefill_autofill_enabled',
  CONSENT_GIVEN: 'securefill_consent_given',
  BLOCKED_DOMAINS: 'securefill_blocked_domains',
  AUTOFILL_HISTORY: 'securefill_autofill_history',
  AUTOFILL_ON_LOAD: 'securefill_autofill_on_load',
} as const;

export class StorageManager {
  /**
   * Get user profile from chrome.storage.local
   */
  static async getUserProfile(): Promise<UserProfile> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get([STORAGE_KEYS.USER_PROFILE], (result) => {
        if (chrome.runtime.lastError) {
          console.error('Storage error:', chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
          return;
        }

        const profile = result[STORAGE_KEYS.USER_PROFILE];
        if (profile) {
          resolve(profile as UserProfile);
        } else {
          resolve(DEFAULT_USER_PROFILE);
        }
      });
    });
  }

  /**
   * Save or update user profile
   */
  static async saveUserProfile(profile: UserProfile): Promise<void> {
    return new Promise((resolve, reject) => {
      const profileWithTimestamp = {
        ...profile,
        lastUpdated: new Date().toISOString(),
      };

      chrome.storage.local.set(
        { [STORAGE_KEYS.USER_PROFILE]: profileWithTimestamp },
        () => {
          if (chrome.runtime.lastError) {
            console.error('Storage error:', chrome.runtime.lastError);
            reject(chrome.runtime.lastError);
            return;
          }
          resolve();
        }
      );
    });
  }

  /**
   * Update specific fields in user profile
   */
  static async updateUserProfile(
    updates: Partial<UserProfile>
  ): Promise<UserProfile> {
    const current = await this.getUserProfile();
    const updated = { ...current, ...updates };
    await this.saveUserProfile(updated);
    return updated;
  }

  /**
   * Delete user profile
   */
  static async deleteUserProfile(): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.remove([STORAGE_KEYS.USER_PROFILE], () => {
        if (chrome.runtime.lastError) {
          console.error('Storage error:', chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
          return;
        }
        resolve();
      });
    });
  }

  /**
   * Get autofill enabled status
   */
  static async isAutofillEnabled(): Promise<boolean> {
    return new Promise((resolve) => {
      chrome.storage.local.get([STORAGE_KEYS.AUTOFILL_ENABLED], (result) => {
        resolve(result[STORAGE_KEYS.AUTOFILL_ENABLED] ?? true);
      });
    });
  }

  /**
   * Get whether autofill-on-load is enabled (opt-in)
   */
  static async isAutofillOnLoad(): Promise<boolean> {
    return new Promise((resolve) => {
      chrome.storage.local.get([STORAGE_KEYS.AUTOFILL_ON_LOAD], (result) => {
        resolve(result[STORAGE_KEYS.AUTOFILL_ON_LOAD] ?? false);
      });
    });
  }

  /**
   * Set autofill-on-load flag
   */
  static async setAutofillOnLoad(enabled: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [STORAGE_KEYS.AUTOFILL_ON_LOAD]: enabled }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        resolve();
      });
    });
  }

  /**
   * Set autofill enabled status
   */
  static async setAutofillEnabled(enabled: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set(
        { [STORAGE_KEYS.AUTOFILL_ENABLED]: enabled },
        () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
            return;
          }
          resolve();
        }
      );
    });
  }

  /**
   * Check if user has given consent for autofill
   */
  static async hasConsentGiven(): Promise<boolean> {
    return new Promise((resolve) => {
      chrome.storage.local.get([STORAGE_KEYS.CONSENT_GIVEN], (result) => {
        resolve(result[STORAGE_KEYS.CONSENT_GIVEN] ?? false);
      });
    });
  }

  /**
   * Set user consent
   */
  static async setConsent(granted: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set(
        { [STORAGE_KEYS.CONSENT_GIVEN]: granted },
        () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
            return;
          }
          resolve();
        }
      );
    });
  }

  /**
   * Add domain to blocked domains list
   */
  static async addBlockedDomain(domain: string): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get([STORAGE_KEYS.BLOCKED_DOMAINS], (result) => {
        const blocked = new Set(result[STORAGE_KEYS.BLOCKED_DOMAINS] ?? []);
        blocked.add(domain);

        chrome.storage.local.set(
          { [STORAGE_KEYS.BLOCKED_DOMAINS]: Array.from(blocked) },
          () => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
              return;
            }
            resolve();
          }
        );
      });
    });
  }

  /**
   * Get blocked domains
   */
  static async getBlockedDomains(): Promise<string[]> {
    return new Promise((resolve) => {
      chrome.storage.local.get([STORAGE_KEYS.BLOCKED_DOMAINS], (result) => {
        resolve(result[STORAGE_KEYS.BLOCKED_DOMAINS] ?? []);
      });
    });
  }

  /**
   * Check if domain is blocked
   */
  static async isDomainBlocked(url: string): Promise<boolean> {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname;
      const blocked = await this.getBlockedDomains();
      return blocked.includes(domain);
    } catch {
      return false;
    }
  }

  /**
   * Remove domain from blocked list
   */
  static async removeBlockedDomain(domain: string): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get([STORAGE_KEYS.BLOCKED_DOMAINS], (result) => {
        const blocked = new Set(result[STORAGE_KEYS.BLOCKED_DOMAINS] ?? []);
        blocked.delete(domain);

        chrome.storage.local.set(
          { [STORAGE_KEYS.BLOCKED_DOMAINS]: Array.from(blocked) },
          () => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
              return;
            }
            resolve();
          }
        );
      });
    });
  }

  /**
   * Log autofill action for analytics
   */
  static async logAutofillAction(
    domain: string,
    fieldCount: number,
    success: boolean
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get([STORAGE_KEYS.AUTOFILL_HISTORY], (result) => {
        const history = result[STORAGE_KEYS.AUTOFILL_HISTORY] ?? [];

        // Keep only last 100 autofill actions
        if (history.length >= 100) {
          history.shift();
        }

        history.push({
          timestamp: new Date().toISOString(),
          domain,
          fieldCount,
          success,
        });

        chrome.storage.local.set(
          { [STORAGE_KEYS.AUTOFILL_HISTORY]: history },
          () => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
              return;
            }
            resolve();
          }
        );
      });
    });
  }

  /**
   * Clear all stored data
   */
  static async clearAll(): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.clear(() => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        resolve();
      });
    });
  }
}
