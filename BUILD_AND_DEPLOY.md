# Build and Deployment Guide

## Overview

This guide covers building, testing, and deploying the SecureFill AI Chrome Extension (Manifest V3).

## Prerequisites

- Node.js 16+ 
- npm or yarn
- Chrome browser (for testing)
- (Optional) Chrome Web Store account for publishing

## Build System

### Architecture

```
Source Code
    ↓
TypeScript Compilation
    ↓
Vite Build Process
    ↓
JS Modules + Assets
    ↓
dist/
```

### Build Scripts

Located in `package.json`:

```json
{
  "scripts": {
    "dev": "tsx server.ts",
    "build": "vite build && esbuild server.ts ...",
    "build:extension": "BUILD_EXTENSION=true vite build",
    "build:extension:win": "set BUILD_EXTENSION=true && vite build",
    "start": "node dist/server.cjs",
    "clean": "rm -rf dist server.js",
    "lint": "tsc --noEmit"
  }
}
```

## Building the Extension

### On macOS/Linux

```bash
# Install dependencies (if not already done)
npm install

# Build extension
npm run build:extension

# Output will be in dist/
ls -la dist/
```

### On Windows (PowerShell)

```powershell
npm install
npm run build:extension:win
dir dist
```

### On Windows (Command Prompt)

```cmd
npm install
set BUILD_EXTENSION=true && npm run build
dir dist
```

### Build Output

The build process generates:

```
dist/
├── background.js                 # Service worker (41 KB)
├── content.js                    # Content script (38 KB)
├── popup.html                    # Popup HTML
├── manifest.json                 # Extension manifest
└── assets/                       # Images and resources
```

## Configuration

### Vite Config (vite.config.ts)

The extension build is controlled by `BUILD_EXTENSION` environment variable:

```typescript
const isExtensionBuild = process.env.BUILD_EXTENSION === 'true';

if (isExtensionBuild) {
  // Extension build config
  return {
    build: {
      rollupOptions: {
        input: {
          background: 'extension/background/background.ts',
          content: 'extension/content/content.ts',
          popup: 'extension/popup/popup.html',
        },
      },
    },
  };
}
```

### Manifest V3

Located in `extension/manifest.json`:

```json
{
  "manifest_version": 3,
  "name": "SecureFill AI",
  "version": "1.0.0",
  "permissions": ["storage", "activeTab", "scripting"],
  "host_permissions": ["<all_urls>"],
  "background": {
    "service_worker": "dist/background.js"
  },
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["dist/content.js"]
  }],
  "action": {
    "default_popup": "popup.html"
  }
}
```

## Loading in Chrome (Developer Mode)

### Step 1: Build Extension
```bash
npm run build:extension
```

### Step 2: Open Chrome Extensions
- Method 1: Click extension menu icon (top right) → Manage extensions
- Method 2: Navigate to `chrome://extensions/`

### Step 3: Enable Developer Mode
- Toggle "Developer mode" in top right corner

### Step 4: Load Unpacked
1. Click "Load unpacked" button
2. Navigate to project root folder
3. Select the folder
4. Extension appears in list

### Step 5: Test
1. Click extension icon in toolbar
2. Navigate to website with forms
3. Floating button appears
4. Test autofill functionality

## Testing

### Automated Tests

```bash
# Type checking
npm run lint

# This checks for TypeScript errors
```

### Manual Testing Checklist

- [ ] Extension loads without errors
- [ ] Floating button appears on forms
- [ ] Profile data saved correctly
- [ ] Autofill fills form fields
- [ ] Blocked fields not autofilled
- [ ] Console has no errors
- [ ] Works on multiple websites

### Testing Different Field Types

Test on these websites:
- Contact forms (simple fields)
- Multi-page forms (form changes)
- Dynamic forms (JavaScript-added forms)
- Complex forms (nested inputs)
- React/Vue forms (framework-specific)

### Performance Testing

```bash
# Check build size
ls -lh dist/*.js

# Goal: Keep under 100KB total
```

## Development Workflow

### Watch Mode (Not Available for Extension)

Extensions must be rebuilt after changes:

1. Make code changes
2. Run: `npm run build:extension`
3. Reload extension in `chrome://extensions/`
4. Refresh test page

### Quick Reload

In `chrome://extensions/`:
1. Find SecureFill AI
2. Click refresh icon
3. Changes take effect immediately

### Debugging

```bash
# View console errors
# F12 > Console tab

# View extension logs
# F12 > Sources tab > Find extension scripts

# View storage
# F12 > Application > Storage > Local Storage
```

## Optimization

### Code Splitting

Vite automatically handles splitting:
- `background.js` - Service worker
- `content.js` - Content script
- Shared modules bundled separately

### Tree Shaking

Remove unused code:
```bash
npm run lint  # TypeScript checks
```

### Minification

Enabled by default in production build:
```typescript
build: {
  minify: 'esbuild',
}
```

### Asset Handling

Images and icons are handled by Vite:
```
extension/icons/ → dist/assets/
```

## Versioning

Update version in:

1. `extension/manifest.json`
```json
"version": "1.0.1"
```

2. `package.json`
```json
"version": "1.0.1"
```

Increment following semver:
- Major (1.0.0) - Breaking changes
- Minor (0.1.0) - New features
- Patch (0.0.1) - Bug fixes

## Deployment

### To Chrome Web Store

1. **Create Web Store account**
   - Visit [Chrome Web Store Developer Console](https://chrome.google.com/webstore/developer/dashboard)
   - Create developer account

2. **Prepare for submission**
   ```bash
   npm run build:extension
   # Zip the dist folder
   ```

3. **Create new item**
   - Click "New item"
   - Upload ZIP file
   - Fill in store listing details

4. **Add branding**
   - Upload icon (128x128px)
   - Add screenshots
   - Write compelling description

5. **Set pricing**
   - Choose free or paid
   - Select target countries

6. **Submit for review**
   - Review compliance
   - Submit
   - Wait for approval (3-5 days)

### Chrome Web Store Checklist

- [ ] Manifest V3 compliant
- [ ] No MV2 deprecation warnings
- [ ] Clear privacy policy
- [ ] No misleading claims
- [ ] No permission creep
- [ ] Working functionality
- [ ] Proper error handling
- [ ] User-friendly UI

## Distribution Alternatives

### Option 1: Chrome Web Store (Recommended)
- Official distribution
- Update management
- User reviews
- Wide reach

### Option 2: Sideloading
- Direct distribution
- No review process
- Manual update management
- Limited reach

### Option 3: Enterprise
- Google Workspace integration
- Centralized deployment
- Policy management
- Business accounts only

## Troubleshooting

### Build Fails
```bash
# Clean and rebuild
npm run clean
npm run build:extension
```

### Extension won't load
1. Check `extension/manifest.json` exists
2. Verify JSON syntax: `npm run lint`
3. Check file permissions
4. Try rebuilding

### Scripts not loading
1. Check console for errors (F12)
2. Verify manifest paths
3. Check content security policy
4. View service worker logs

### Storage not working
1. Check `chrome.storage.local` available
2. View Application > Storage > Local Storage
3. Check for quota exceeded
4. Verify permission in manifest

## Performance Metrics

### Build Time
- Development: ~2-3 seconds
- Production: ~3-4 seconds

### Extension Size
- Uncompressed: ~150 KB
- Compressed (ZIP): ~30 KB

### Runtime Memory
- Baseline: ~10-15 MB
- After autofill: ~25-30 MB

## Security

### Code Review Checklist

- [ ] No hardcoded credentials
- [ ] No eval() or dangerous code
- [ ] Proper input validation
- [ ] No sensitive data logging
- [ ] HTTPS for external requests
- [ ] Content Security Policy set

### Privacy

- [ ] User data stored locally only
- [ ] No third-party tracking
- [ ] No data exfiltration
- [ ] Clear privacy policy

## Rollback Procedure

If issues arise after deployment:

1. **Identify issue** - Check user reports
2. **Fix code** - Update source files
3. **Rebuild** - Run build command
4. **Resubmit** - Submit new version to Web Store
5. **Monitor** - Watch for user feedback

## Changelog

Track changes in CHANGELOG.md:

```markdown
## [1.0.1] - 2026-06-14
### Added
- Floating button animations
- Domain blocking feature

### Fixed
- Content script loading issue
- Storage quota handling

### Changed
- Improved field detection algorithm
```

## Continuous Integration (Optional)

Use GitHub Actions for automated builds:

```yaml
name: Build Extension
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run build:extension
      - uses: actions/upload-artifact@v2
        with:
          name: extension
          path: dist/
```

## Documentation

### User Documentation
- [README.md](./README.md) - User guide
- [QUICK_START.md](./QUICK_START.md) - Quick start

### Developer Documentation
- [INTEGRATION.md](./INTEGRATION.md) - React integration guide
- API reference in code comments

## Support

For build or deployment issues:
1. Check this guide
2. Review error messages carefully
3. Check Chrome Web Store documentation
4. Contact development team

---

**Last Updated**: June 2026  
**Version**: 1.0.0
