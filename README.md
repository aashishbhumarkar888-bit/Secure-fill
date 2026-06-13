<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/274747ff-05d8-44de-90b8-9cd9dad0b17b

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Demo (no Web Store payment)

To allow judges to test the extension without publishing to the Chrome Web Store, see `DEMO_INSTRUCTIONS.md` for steps to load the built extension locally using Chrome's "Load unpacked" developer feature.
