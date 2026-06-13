Demo: How to load the extension (no payment required)
=================================================

This repository includes a ready-to-install extension build you can load locally without publishing to the Chrome Web Store. Use this to show judges a working demo.

Steps (Windows, PowerShell):

1. Download or clone this repo and ensure `securefill-chrome-extension.zip` or the `dist/` folder exists at the project root.

2. If you have the ZIP, unzip it to a folder named `securefill-demo`:

```powershell
Expand-Archive -Path .\securefill-chrome-extension.zip -DestinationPath .\securefill-demo -Force
```

3. Open Chrome and navigate to `chrome://extensions`.

4. Enable "Developer mode" (top-right toggle).

5. Click "Load unpacked" and select the extracted folder `securefill-demo` (the folder that contains `manifest.json`).

6. Confirm the extension appears in the toolbar, open the popup, and test the autofill flow on a form page. Use the popup toggle and consent UI to demonstrate behavior.

Notes:
- This method only installs the extension locally on the judge's machine; it does not require a Chrome Web Store developer account or payment.
- For macOS/Linux, unzip with standard tools and follow the same `Load unpacked` steps.
- If you prefer, judges can also download the `dist/` folder directly from the `demo-upload` branch and use that as the unpacked folder.

If you want, I can push these instructions and create a `demo-upload` branch containing the built `dist/` and the ZIP for easy download.
