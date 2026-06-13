# Chrome Web Store Publishing Guide for SecureFill

Complete step-by-step instructions to publish your extension to the Chrome Web Store.

---

## Phase 1: Prerequisites & Setup

### Step 1: Create a Google Developer Account
1. Go to https://chrome.google.com/webstore/developer/dashboard
2. Sign in with a Google account (create one if needed)
3. Pay the **one-time $5 developer registration fee** (required to publish)
4. Verify your email address
5. You should now see the Developer Dashboard

### Step 2: Prepare Your Assets Locally

Ensure these files/folders exist in your project root:

```
securefill-chrome-extension.zip       ← Your packaged extension
extension/icons/icon-128.png          ← Icon (128x128px)
extension/screenshots/                ← Store screenshots
  └─ screenshot-popup.png             ← Popup UI screenshot
  └─ screenshot-floating.png          ← Floating button demo
docs/privacy.html                     ← Privacy policy
```

**To regenerate missing assets:**
```powershell
npm run generate:icons
npm run generate:screenshots
npm run build:extension:win
Compress-Archive -Path .\dist\* -DestinationPath .\securefill-chrome-extension.zip -Force
```

### Step 3: Host Privacy Policy on GitHub Pages

1. Go to your **GitHub repository** → **Settings** → **Pages**
2. Under "Build and deployment":
   - Branch: select `main`
   - Folder: select `/docs`
3. Click **Save**
4. Wait ~1 minute for deployment
5. You'll see: *"Your site is live at: `https://<username>.github.io/secure-fill/`"*
6. **Note the full privacy policy URL:**
   ```
   https://<username>.github.io/secure-fill/privacy.html
   ```
   *(Save this; you'll use it in the Web Store listing)*

**Test the URL:** Open it in a browser to confirm it loads.

---

## Phase 2: Upload to Chrome Web Store

### Step 4: Add a New Item

1. On the **Developer Dashboard**, click the blue **"Add new item"** button
2. Click **"Upload"**
3. Select your **`securefill-chrome-extension.zip`** file
4. Wait for Chrome to validate and extract it (~10–30 seconds)
5. You'll see a green checkmark and be redirected to the item details page

### Step 5: Fill Store Listing Details

#### 5.1 Extension Details

On the left sidebar, click **"Package"** or go directly to the form. Fill in:

- **Name:** `SecureFill` (or choose a unique name)
- **Short description** (132 characters max):
  ```
  Intelligent autofill extension for forms with consent & privacy control.
  ```

#### 5.2 Detailed Description (Long Description)

Click into the **Description** field and paste:

```
SecureFill is a Chrome extension that intelligently detects and autofills web forms 
with user-provided information, including name, email, and phone number.

Features:
- Smart form detection and field matching
- One-click autofill with user consent
- Optional automatic autofill on page load (opt-in toggle)
- Floating autofill button on compatible pages
- Secure local storage (no cloud sync)
- Privacy-first design with transparent data handling
- Built with React, TypeScript, and Vite

Data & Privacy:
- All personal data is stored locally in your browser
- No data is sent to external servers
- Full user control over autofill behavior
- Users can clear stored data anytime

For questions or feedback, visit our GitHub repository.
```

#### 5.3 Upload Icons & Store Images

1. Click **"Store icon"** section
   - Upload `extension/icons/icon-128.png` (must be exactly 128×128px)
   - File format: PNG

2. Click **"Screenshots"** section
   - Upload at least 2 screenshots (up to 5 recommended)
   - Each image must be 1280×800px or 640×400px
   - Upload from `extension/screenshots/`:
     - `screenshot-popup.png` (show the popup UI)
     - `screenshot-floating.png` (show floating button)
   - Add captions for each (e.g., "Popup: Enter your info and autofill forms", "Floating button: One-click autofill on any page")

#### 5.4 Category & Language

- **Category:** Select **"Productivity"** or **"Tools"**
- **Language:** English (or your primary language)

---

## Phase 3: Content & Permissions

### Step 6: Privacy Policy & Support

1. Scroll to **"Privacy policy URL"** field
2. Paste the GitHub Pages URL from Step 3:
   ```
   https://<username>.github.io/secure-fill/privacy.html
   ```
3. Enter **"Support URL"** (your GitHub repo):
   ```
   https://github.com/<your-username>/Secure-fill
   ```

### Step 7: Permissions & Data Safety Declaration

1. In the left sidebar, find **"Permissions"** or **"Store data privacy"** section
2. Declare data usage:
   - **Data collected:** User input (name, email, phone) for autofill purposes
   - **Where stored:** Local browser storage only
   - **Third parties:** None
   - **Data retention:** Until user manually clears it
3. Check the box confirming you've reviewed the **Permissions Policy**
4. Link your Privacy Policy URL again if prompted

### Step 8: Content Rating

1. Click **"Content rating"** or skip if optional
2. Answer questions about app content (typically "None" for a utility extension)

---

## Phase 4: Visibility & Publishing

### Step 9: Set Visibility

1. In the left sidebar, click **"Visibility"** or **"Distribution"**
2. Choose one:
   - **Public** ← Recommended (visible to all users)
   - **Unlisted** (only people with direct link can install)
   - **Private** (internal testing only)
3. For your first release, **Public** is best for judges/audience

### Step 10: Distribution & Pricing

- **Distribution:** Select **Unrestricted distribution** (available worldwide)
- **Pricing:** Select **Free**

### Step 11: Target Regions

- Select all countries or focus on your region(s)
- Default: worldwide distribution

---

## Phase 5: Final Review & Submission

### Step 12: Review Everything

Before submitting, scroll through and verify:

- ✅ Extension name and description are clear and accurate
- ✅ Icons and screenshots are professional and relevant
- ✅ Privacy policy URL is valid and reachable
- ✅ Permissions are clearly explained
- ✅ No placeholders or test text remain
- ✅ Support/GitHub URL is correct

### Step 13: Submit for Review

1. At the **bottom of the page**, click the blue **"Submit for review"** button
2. Confirm the submission
3. You'll see a confirmation message:
   ```
   "Item submitted for review. Check back later for updates."
   ```

### Step 14: Wait for Review

- **Timeline:** 1 hour to several days (typically 24–48 hours)
- **Notification:** Google will email you when review is complete
- **Status:** You can check status anytime on the Developer Dashboard

---

## Phase 6: Post-Submission (What Happens Next)

### If Approved ✅

1. Extension will appear on the Chrome Web Store publicly
2. You'll get an email with a link to your store listing
3. Your extension URL will be:
   ```
   https://chrome.google.com/webstore/detail/<EXTENSION_ID>/<NAME>
   ```
4. Share this link with judges, colleagues, and users
5. Users can install with a single click

### If Rejected ❌

1. Check your email for rejection reason
2. Common issues:
   - Permissions not justified (explain clearly in description)
   - Privacy policy missing or incomplete
   - Screenshots unclear or low quality
   - Icon too small or wrong format
3. Fix the issue and resubmit (usually same day)

---

## Phase 7: Testing & Verification

### Before Submitting (or While Waiting for Review)

1. **Local Testing:**
   ```powershell
   # Extract the ZIP
   Expand-Archive -Path .\securefill-chrome-extension.zip -DestinationPath .\securefill-demo -Force
   ```

2. **Load Unpacked in Chrome:**
   - Open `chrome://extensions`
   - Enable **Developer mode** (top-right toggle)
   - Click **"Load unpacked"**
   - Select the extracted `securefill-demo` folder
   - Verify the extension appears in your toolbar

3. **Test Core Features:**
   - Click popup icon → verify UI loads
   - Enter test data (name, email, phone)
   - Click "Save" → data persists
   - Navigate to a form page (e.g., contact form)
   - Click floating button or popup "Autofill" → verify fields fill
   - Test "Clear" button → data is removed
   - Toggle "Autofill on load" → verify preference persists

### After Approval

1. Uninstall the unpacked version
2. Go to your public store listing URL
3. Click **"Add to Chrome"**
4. Verify installation from store works identically

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **Upload fails with "Invalid manifest"** | Ensure `manifest.json` is at ZIP root, not nested |
| **"Permissions not justified"** | Add detailed explanation in description (why you access tabs, storage, etc.) |
| **Privacy policy 404** | Verify GitHub Pages is enabled; test URL in browser |
| **Screenshots rejected (wrong size)** | Use exactly 1280×800 or 640×400px; convert with online tool if needed |
| **Extension rejected, no reason** | Email Chrome Web Store support with reference number |
| **Long review time** | Check your email spam folder; resubmit if no response after 7 days |

---

## Quick Reference: Your URLs & Info

After approval, save these:

| Item | Value |
|------|-------|
| **Store Listing** | `https://chrome.google.com/webstore/detail/<EXTENSION_ID>` |
| **Privacy Policy** | `https://<username>.github.io/secure-fill/privacy.html` |
| **GitHub Repo** | `https://github.com/<your-username>/Secure-fill` |
| **Demo Branch** | `https://github.com/<your-username>/Secure-fill/tree/demo-upload` |

---

## Done! 🎉

Your SecureFill extension is now live on the Chrome Web Store. Share the store link with judges, colleagues, or anyone who wants to try it!

**For judges (or anyone without a developer account):**

Share this demo instruction link:
```
https://github.com/<your-username>/Secure-fill/blob/demo-upload/DEMO_INSTRUCTIONS.md
```

They can load the extension locally without paying or waiting for Web Store approval.
