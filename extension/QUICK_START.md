# SecureFill AI Extension - Quick Start Guide

## Installation

### 1. Build the Extension
```bash
npm run build:extension
```

### 2. Load in Chrome
1. Open `chrome://extensions/`
2. Toggle "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the project root folder
5. Extension loaded! ✓

## First Use

### Setup Profile (One-time)
1. Click SecureFill icon in Chrome toolbar
2. Fill in your profile information:
   - Full Name
   - Email
   - Phone
   - Address, City, State, Country, Pincode
   - LinkedIn, GitHub profiles
3. Click Save

### Auto-fill Forms
1. Navigate to any website with forms
2. Look for floating "✨" button (bottom-right)
3. Click button
4. Confirm autofill permission
5. Form fields automatically filled! ✓

## Command Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Build web app + server |
| `npm run build:extension` | Build Chrome Extension |
| `npm run lint` | Check TypeScript |
| `npm run clean` | Clean build files |

## Extension Structure

```
extension/
├── manifest.json          # Extension config
├── background/            # Service worker
├── content/              # Page scripts
├── popup/                # Extension popup UI
├── storage/              # Data storage
├── types/                # TypeScript types
├── utils/                # Utilities
└── icons/                # Icons
```

## Key Files

- **manifest.json** - Manifest V3 configuration
- **extension/background/background.ts** - Background service worker
- **extension/content/content.ts** - Content script with autofill logic
- **extension/utils/detector.ts** - Form detection engine
- **extension/utils/autofill.ts** - Autofill matching engine
- **extension/storage/storage.ts** - Data storage layer

## Common Tasks

### Add New Profile Field

1. Update `extension/types/profile.ts`:
```typescript
export interface UserProfile {
  // ... existing fields
  newField: string;
}
```

2. Add keywords to `FIELD_KEYWORDS`:
```typescript
newField: [/keyword1|keyword2/i],
```

3. Update storage default:
```typescript
newField: '',
```

### Change Floating Button Position
```typescript
const button = new FloatingButton({ 
  position: 'top-left' // or 'top-right', 'bottom-left'
});
```

### Modify Field Detection
Edit `extension/utils/detector.ts`:
- `analyzeField()` - Change field analysis
- `classifyField()` - Change classification logic
- `isBlockedField()` - Change blocked patterns

### Adjust Autofill Logic
Edit `extension/utils/autofill.ts`:
- `generateFieldMappings()` - Change mapping strategy
- `calculateFieldMatchScore()` - Change scoring
- `fillField()` - Change fill method

## Debugging

### View Console Logs
1. Open Chrome DevTools (F12)
2. Go to Console tab
3. Look for `[SecureFill]` messages

### Inspect Content Script
1. Right-click on page → Inspect
2. Sources tab
3. Find scripts under `chrome-extension://`

### Check Storage
1. DevTools (F12)
2. Application tab
3. Storage > Local Storage
4. Select extension
5. Look for `securefill_user_profile`

### View Background Logs
1. `chrome://extensions/`
2. Find SecureFill
3. Click "service worker" link
4. DevTools opens for service worker

## Troubleshooting

### Extension won't load
- Verify `extension/manifest.json` exists
- Check file permissions
- Rebuild: `npm run build:extension`

### Floating button not showing
- Website may have CSP restrictions
- Try different website
- Check console for errors (F12)

### Autofill not working
- Profile data not saved yet
- Form fields not recognized
- Website may have autofill prevention
- Check console logs for details

### Changes not reflecting
- Hard refresh extension
- Or go to `chrome://extensions/` and reload

## Performance Tips

1. **Minimize DOM queries** in content script
2. **Use event delegation** for form detection
3. **Debounce** DOM observer callbacks
4. **Profile heavy operations** with DevTools

## Security Checklist

- ✓ Never store passwords
- ✓ Never store payment info
- ✓ Always ask user consent
- ✓ Only use chrome.storage.local
- ✓ Check sender in message handlers
- ✓ Validate all inputs

## Next Steps

1. ✓ Read full [README.md](./README.md)
2. ✓ Review API reference
3. ✓ Check extension architecture
4. ✓ Customize for your needs
5. ✓ Test thoroughly before publishing

## Contact

Questions or issues? Check the full documentation or contact the team.

---

**Version**: 1.0.0  
**Last Updated**: June 2026
