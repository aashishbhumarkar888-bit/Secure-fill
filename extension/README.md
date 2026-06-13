# SecureFill AI Chrome Extension (Manifest V3)

A production-ready Chrome Extension that provides intelligent form autofill with OCR integration, secure data storage, and advanced field detection.

## Features

### 1. **Form Detection & Analysis**
- Automatically detects forms on any website
- Analyzes form fields using multiple strategies:
  - Field labels and placeholders
  - HTML id and name attributes
  - aria-label attributes
  - Data attributes
  - CSS classes
- Supports both traditional forms and div-based form layouts
- Real-time DOM monitoring for dynamically added forms

### 2. **Intelligent Field Matching**
- AI-powered field classification
- Matches form fields to user profile data
- Supports unusual and domain-specific field names
- Confidence scoring for field matches
- Fallback matching strategies

### 3. **Autofill Engine**
- Fills matched fields automatically
- Respects user preferences
- Never autofills:
  - Password fields
  - OTP fields
  - CVV/CVC fields
  - Social Security Numbers
  - Banking information
- Event triggering for framework compatibility
- Support for React, Angular, Vue, and vanilla JavaScript forms

### 4. **Floating Autofill Button**
- Appears when forms are detected
- Beautiful gradient UI with animations
- Shows loading, success, and error states
- Floating notifications for user feedback
- Customizable position

### 5. **Storage System**
- Chrome `chrome.storage.local` integration
- Stores user profile data securely
- Supports profile updates and deletions
- Autofill action logging for analytics
- Domain blocking system

### 6. **User Profile Schema**
```typescript
{
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  linkedin: string;
  github: string;
  resumeUrl?: string;
  resumeText?: string;
}
```

### 7. **Security Features**
- User consent required before autofill
- Never stores or transmits passwords
- Chrome storage only (no cloud sync)
- Domain-based blocking
- Permission-based architecture
- Content Security Policy compliant

## Architecture

```
extension/
├── manifest.json                 # Manifest V3 configuration
├── background/
│   └── background.ts             # Service worker
├── content/
│   └── content.ts                # Content script (main logic)
├── popup/
│   ├── popup.html                # Popup UI
│   └── popup.ts                  # Popup API layer
├── storage/
│   └── storage.ts                # Storage manager
├── types/
│   └── profile.ts                # TypeScript interfaces
├── utils/
│   ├── detector.ts               # Form detection
│   ├── autofill.ts               # Autofill engine
│   ├── floatingButton.ts         # Floating UI component
│   ├── string.ts                 # String utilities
│   ├── promise.ts                # Promise utilities
│   └── logger.ts                 # Logging utilities
└── icons/
    └── icon.svg                  # Extension icon
```

## Building the Extension

### Prerequisites
- Node.js 16+
- npm or yarn

### Install Dependencies
```bash
npm install
```

### Build Extension
```bash
# On macOS/Linux
npm run build:extension

# On Windows (PowerShell)
npm run build:extension:win

# On Windows (Command Prompt)
set BUILD_EXTENSION=true && npm run build
```

This generates:
- `dist/background.js` - Background service worker
- `dist/content.js` - Content script
- `dist/popup.js` - Popup script (if applicable)
- `dist/manifest.json` - Extension manifest

## Loading in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Navigate to the project root folder and select it
5. The extension will appear in your Chrome extensions list

## Usage

### For Users
1. Click the SecureFill AI extension icon in the Chrome toolbar
2. Fill in your profile information (one-time setup)
3. Navigate to any website with forms
4. The floating "✨" button will appear when forms are detected
5. Click the button to autofill the entire form
6. Confirm the autofill in the permission dialog
7. Fields will be automatically populated with your data

### For Developers

#### Accessing User Profile
```typescript
import { StorageManager } from './extension/storage/storage';

const profile = await StorageManager.getUserProfile();
```

#### Saving Profile Data
```typescript
await StorageManager.saveUserProfile({
  fullName: 'John Doe',
  email: 'john@example.com',
  // ... other fields
});
```

#### Updating Profile
```typescript
await StorageManager.updateUserProfile({
  phone: '+1-555-0100',
});
```

#### Detecting Forms Programmatically
```typescript
import { FormDetector } from './extension/utils/detector';

const forms = FormDetector.detectForms();
forms.forEach(form => {
  console.log('Form found:', form.formName, 'Fields:', form.fields.length);
});
```

#### Manually Triggering Autofill
```typescript
chrome.tabs.sendMessage(tabId, {
  type: 'REQUEST_AUTOFILL',
});
```

## Extension Permissions

The extension requests the following permissions:

- **storage** - Store user profile data locally
- **activeTab** - Access the current tab
- **scripting** - Inject content scripts into pages
- **<all_urls>** - Run content script on all websites

## API Reference

### StorageManager

```typescript
// Get profile
const profile = await StorageManager.getUserProfile();

// Save profile
await StorageManager.saveUserProfile(profile);

// Update profile
const updated = await StorageManager.updateUserProfile(updates);

// Delete profile
await StorageManager.deleteUserProfile();

// Autofill settings
const enabled = await StorageManager.isAutofillEnabled();
await StorageManager.setAutofillEnabled(true);

// Consent management
const consented = await StorageManager.hasConsentGiven();
await StorageManager.setConsent(true);

// Domain management
await StorageManager.addBlockedDomain('example.com');
const blocked = await StorageManager.getBlockedDomains();
await StorageManager.removeBlockedDomain('example.com');

// Analytics
await StorageManager.logAutofillAction(domain, fieldCount, success);

// Clear all
await StorageManager.clearAll();
```

### FormDetector

```typescript
// Detect all forms
const forms = FormDetector.detectForms();

// Check if page has forms
const hasforms = FormDetector.hasFillableForms();

// Get form for element
const form = FormDetector.getFormForElement(inputElement);

// Get form fields
const fields = FormDetector.getFormFields(formElement);

// Observe DOM changes
const observer = FormDetector.observeDOMChanges(() => {
  // Called when forms are added to DOM
});
```

### AutofillEngine

```typescript
// Generate mappings
const mappings = AutofillEngine.generateFieldMappings(fields, profile);

// Fill single field
AutofillEngine.fillField(inputElement, 'value');

// Fill entire form
const results = AutofillEngine.fillForm(formElement, mappings, profile);

// Validate results
const valid = AutofillEngine.validateFillResults(results);

// Get visible fields only
const visible = AutofillEngine.getVisibleFields(fields);

// Check if field should be skipped
const skip = AutofillEngine.shouldSkipField(field);
```

### FloatingButton

```typescript
// Create button
const button = new FloatingButton({ position: 'bottom-right' });
button.create(() => {
  // Handle click
});

// Control button
button.show();
button.hide();

// States
button.setLoading(true);
button.showSuccess();
button.showError('Error message');

// Position
button.setPosition('top-right');

// Cleanup
button.remove();
```

## Field Classification

The extension automatically classifies form fields based on:

### Keyword Matching
- **fullName**: name, given name, first name, last name
- **email**: email, mail, contact, inbox
- **phone**: phone, tel, mobile, cell
- **address**: address, street, line 1
- **city**: city, town, locality
- **state**: state, province, region
- **country**: country, nation
- **pincode**: pin, code, zip, postal
- **linkedin**: linkedin, professional
- **github**: github, repository

### Type Matching
- `type="email"` → email field
- `type="tel"` → phone field
- `type="date"` → dateOfBirth field

### Blocked Field Patterns
- Password: password, pass, pwd, secret
- OTP: otp, one-time-password, 2fa
- CVV: cvv, cvc, security code
- Banking: ssn, account number, iban
- Credit Card: credit card, debit card, card number

## Troubleshooting

### Extension not appearing
1. Make sure it's loaded in `chrome://extensions/`
2. Check if Developer mode is enabled
3. Try reloading the extension (refresh icon)

### Autofill not working
1. Check browser console for errors (F12 > Console)
2. Ensure profile data is saved in extension settings
3. Verify form fields have proper labels or attributes
4. Check if domain is blocked

### Fields not detected
1. Inspect form HTML (right-click > Inspect)
2. Check if form uses unusual structure (divs instead of form tags)
3. Verify field labels/names/placeholders

### Storage issues
1. Check `chrome://extensions/` for storage quota
2. Clear extension data if storage is full
3. Try disabling and re-enabling extension

## Best Practices

1. **Always include form labels** for better field detection
2. **Use semantic HTML** - proper input types and attributes
3. **Test in incognito mode** - ensures fresh extension state
4. **Check console errors** - F12 > Console tab
5. **Clear extension data** between test sessions

## Security Considerations

### What SecureFill Does NOT Store
- Passwords
- Payment information
- Social Security numbers
- Bank account details

### What SecureFill DOES Store
- Name and contact information
- Professional profile links
- Resume information
- Basic personal data

### Data Protection
- All data stored locally in `chrome.storage.local`
- No cloud synchronization
- No data sharing with third parties
- No analytics tracking
- User consent required for autofill

## Development

### Run in Development Mode
```bash
npm run dev
```

### TypeScript Compilation
```bash
npm run lint
```

### Clean Build
```bash
npm run clean
npm run build:extension
```

## Contributing

To improve the extension:

1. Modify source files in `/extension`
2. Run `npm run build:extension`
3. Reload extension in `chrome://extensions/`
4. Test functionality
5. Check console for errors

## License

SecureFill AI Chrome Extension © 2026

## Support

For issues or feature requests, contact the development team.

---

**Last Updated**: June 2026  
**Version**: 1.0.0  
**Manifest**: V3
