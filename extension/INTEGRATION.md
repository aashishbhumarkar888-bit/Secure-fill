# Integrating Extension with React App

## Overview

The extension popup can be embedded in your React application to provide a seamless UI for managing user profile and autofill settings.

## Architecture

```
React App (popup/main UI)
        ↓
Extension API (window.securefillAPI)
        ↓
Chrome Storage & Content Scripts
```

## Integration Steps

### 1. Check Extension Context

```typescript
import { isExtensionContext } from '@/extension/utils/react-integration';

if (isExtensionContext()) {
  // Running in extension popup
} else {
  // Running as web app
}
```

### 2. Use Extension API in Components

```typescript
import { useExtensionAPI } from '@/extension/utils/react-integration';
import { useEffect, useState } from 'react';
import type { UserProfile } from '@/extension/types/profile';

export function ProfileSettings() {
  const api = useExtensionAPI();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    api.getUserProfile().then(setProfile);
  }, [api]);

  async function handleSave(updated: UserProfile) {
    await api.saveUserProfile(updated);
    setProfile(updated);
  }

  return (
    <div>
      {profile && (
        <form onSubmit={(e) => {
          e.preventDefault();
          handleSave(profile);
        }}>
          {/* Form fields here */}
        </form>
      )}
    </div>
  );
}
```

### 3. Use Manager Classes

```typescript
import { 
  ProfileManager, 
  SettingsManager, 
  AutofillManager 
} from '@/extension/utils/react-integration';

// Load profile
const profile = await ProfileManager.loadProfile();

// Update profile
await ProfileManager.updateProfile({ email: 'new@example.com' });

// Manage settings
const enabled = await SettingsManager.isAutofillEnabled();
await SettingsManager.setAutofillEnabled(false);

// Block domain
await SettingsManager.blockDomain('example.com');

// Request autofill
await AutofillManager.requestAutofill();
```

## Available API Methods

### User Profile

```typescript
// Get user profile
const profile = await api.getUserProfile();

// Save user profile
await api.saveUserProfile(profile);

// Update user profile (partial)
const updated = await api.updateUserProfile({ email: 'new@email.com' });
```

### Settings

```typescript
// Check if autofill is enabled
const enabled = await api.isAutofillEnabled();

// Enable/disable autofill
await api.setAutofillEnabled(true);

// Get blocked domains
const blocked = await api.getBlockedDomains();

// Block domain
await api.blockDomain('example.com');

// Unblock domain
await api.unblockDomain('example.com');
```

### Actions

```typescript
// Request autofill on current tab
await api.requestAutofill();

// Clear all data
await api.clearAllData();
```

## Component Examples

### Profile Form

```typescript
import React, { useEffect, useState } from 'react';
import { ProfileManager } from '@/extension/utils/react-integration';
import type { UserProfile } from '@/extension/types/profile';
import { DEFAULT_USER_PROFILE } from '@/extension/types/profile';

export function ProfileForm() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ProfileManager.loadProfile()
      .then(setProfile)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ProfileManager.saveProfile(profile);
      setError(null);
      // Show success message
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Full Name"
        value={profile.fullName}
        onChange={(e) => handleChange('fullName', e.target.value)}
      />
      <input
        type="email"
        placeholder="Email"
        value={profile.email}
        onChange={(e) => handleChange('email', e.target.value)}
      />
      <input
        type="tel"
        placeholder="Phone"
        value={profile.phone}
        onChange={(e) => handleChange('phone', e.target.value)}
      />
      {/* Add more fields as needed */}
      <button type="submit">Save Profile</button>
    </form>
  );
}
```

### Settings Panel

```typescript
import React, { useEffect, useState } from 'react';
import { SettingsManager } from '@/extension/utils/react-integration';

export function SettingsPanel() {
  const [autofillEnabled, setAutofillEnabled] = useState(true);
  const [blockedDomains, setBlockedDomains] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      SettingsManager.isAutofillEnabled(),
      SettingsManager.getBlockedDomains(),
    ]).then(([enabled, blocked]) => {
      setAutofillEnabled(enabled);
      setBlockedDomains(blocked);
    });
  }, []);

  const toggleAutofill = async () => {
    const newValue = !autofillEnabled;
    await SettingsManager.setAutofillEnabled(newValue);
    setAutofillEnabled(newValue);
  };

  const unblockDomain = async (domain: string) => {
    await SettingsManager.unblockDomain(domain);
    setBlockedDomains(prev => prev.filter(d => d !== domain));
  };

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={autofillEnabled}
          onChange={toggleAutofill}
        />
        Enable Autofill
      </label>

      <h3>Blocked Domains</h3>
      <ul>
        {blockedDomains.map(domain => (
          <li key={domain}>
            {domain}
            <button onClick={() => unblockDomain(domain)}>Unblock</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Autofill Button

```typescript
import React from 'react';
import { AutofillManager } from '@/extension/utils/react-integration';

export function AutofillButton() {
  const [loading, setLoading] = useState(false);

  const handleAutofill = async () => {
    setLoading(true);
    try {
      await AutofillManager.requestAutofill();
    } catch (error) {
      console.error('Autofill failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleAutofill}
      disabled={loading}
    >
      {loading ? 'Filling...' : 'Autofill Form'}
    </button>
  );
}
```

## Error Handling

```typescript
try {
  const profile = await api.getUserProfile();
} catch (error) {
  if (error.message.includes('not available')) {
    console.log('Extension not loaded yet');
  } else if (error.message.includes('No profile found')) {
    console.log('User has not set up profile');
  } else {
    console.error('Unknown error:', error);
  }
}
```

## Testing

### Test in Extension Popup
1. Build extension: `npm run build:extension`
2. Load in Chrome: `chrome://extensions/`
3. Click extension icon
4. UI loads in popup with extension API available

### Test in Web App
Set a feature flag to enable/disable extension features:
```typescript
const isExtension = isExtensionContext();
if (isExtension) {
  // Show extension-specific UI
}
```

## Performance Considerations

1. **Cache profile data** - Don't fetch on every render
2. **Debounce updates** - Batch multiple profile updates
3. **Use React.memo** - Prevent unnecessary re-renders
4. **Lazy load** - Load heavy components only when needed

Example caching:
```typescript
const [profileCache, setProfileCache] = useState<UserProfile | null>(null);

useEffect(() => {
  if (!profileCache) {
    ProfileManager.loadProfile().then(setProfileCache);
  }
}, [profileCache]);
```

## Deployment

### Build for Production
```bash
npm run build:extension
```

Generates optimized extension build in `dist/`.

### Package for Chrome Web Store
1. Zip `dist/` folder
2. Upload to Chrome Web Store Developer Console
3. Review and publish

## Troubleshooting

### API not available
```typescript
if (typeof (window as any).securefillAPI === 'undefined') {
  console.log('Extension API not initialized');
}
```

### Profile not loading
- Check if extension is installed
- Verify popup.html is being served
- Check console for initialization errors

### Changes not persisting
- Verify chrome.storage.local has space
- Check for permission errors in console
- Try clearing extension data

## Best Practices

1. ✓ Always check extension context before using API
2. ✓ Handle errors gracefully
3. ✓ Cache profile data to reduce API calls
4. ✓ Use TypeScript for type safety
5. ✓ Test in actual extension popup
6. ✓ Follow Chrome Web Store policies

---

**Version**: 1.0.0
