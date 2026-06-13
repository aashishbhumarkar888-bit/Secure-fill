/**
 * Extension Integration Helper
 * Use this in your React components to interact with the extension
 */

import type { UserProfile } from '../types/profile';

/**
 * Check if code is running in extension context
 */
export function isExtensionContext(): boolean {
  return typeof chrome !== 'undefined' && chrome.runtime;
}

/**
 * Hook for React components to access extension API
 */
export function useExtensionAPI() {
  if (!isExtensionContext()) {
    throw new Error('Extension API not available - not in extension context');
  }

  return (window as any).securefillAPI;
}

/**
 * Example React component using extension API
 * 
 * Usage:
 * 
 * import { ProfileManager } from '@/extension/utils/react-integration';
 * 
 * function SettingsComponent() {
 *   const api = useExtensionAPI();
 *   const [profile, setProfile] = useState<UserProfile | null>(null);
 * 
 *   useEffect(() => {
 *     api.getUserProfile().then(setProfile);
 *   }, [api]);
 * 
 *   return (
 *     <div>
 *       {profile && (
 *         <form onSubmit={(e) => {
 *           e.preventDefault();
 *           api.saveUserProfile(profile);
 *         }}>
 *           <input 
 *             value={profile.fullName}
 *             onChange={(e) => setProfile({
 *               ...profile,
 *               fullName: e.target.value
 *             })}
 *           />
 *         </form>
 *       )}
 *     </div>
 *   );
 * }
 */

/**
 * Profile Manager - centralized profile operations
 */
export class ProfileManager {
  static async loadProfile(): Promise<UserProfile> {
    const api = (window as any).securefillAPI;
    return api.getUserProfile();
  }

  static async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    const api = (window as any).securefillAPI;
    return api.updateUserProfile(profile);
  }

  static async saveProfile(profile: UserProfile): Promise<void> {
    const api = (window as any).securefillAPI;
    return api.saveUserProfile(profile);
  }
}

/**
 * Settings Manager
 */
export class SettingsManager {
  static async isAutofillEnabled(): Promise<boolean> {
    const api = (window as any).securefillAPI;
    return api.isAutofillEnabled();
  }

  static async setAutofillEnabled(enabled: boolean): Promise<void> {
    const api = (window as any).securefillAPI;
    return api.setAutofillEnabled(enabled);
  }

  static async getBlockedDomains(): Promise<string[]> {
    const api = (window as any).securefillAPI;
    return api.getBlockedDomains();
  }

  static async blockDomain(domain: string): Promise<void> {
    const api = (window as any).securefillAPI;
    return api.blockDomain(domain);
  }

  static async unblockDomain(domain: string): Promise<void> {
    const api = (window as any).securefillAPI;
    return api.unblockDomain(domain);
  }
}

/**
 * Autofill Manager
 */
export class AutofillManager {
  static async requestAutofill(): Promise<void> {
    const api = (window as any).securefillAPI;
    return api.requestAutofill();
  }

  static async clearAllData(): Promise<void> {
    const api = (window as any).securefillAPI;
    return api.clearAllData();
  }
}
