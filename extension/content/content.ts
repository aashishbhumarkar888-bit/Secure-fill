/**
 * Content Script
 * Runs in the context of web pages to detect forms and handle autofill
 */

import { FormDetector } from '../utils/detector';
import { AutofillEngine } from '../utils/autofill';
import { FloatingButton } from '../utils/floatingButton';
import { StorageManager } from '../storage/storage';
import type { UserProfile, ContentMessage } from '../types/profile';

let floatingButton: FloatingButton | null = null;
let formObserver: MutationObserver | null = null;
let currentProfile: UserProfile | null = null;
let autofillEnabled = true;
let consentGiven = false;
let autofillOnLoad = false;

/**
 * Initialize content script
 */
async function initContentScript(): Promise<void> {
  try {
    // Get user preferences
    autofillEnabled = await StorageManager.isAutofillEnabled();
    consentGiven = await StorageManager.hasConsentGiven();
    autofillOnLoad = await StorageManager.isAutofillOnLoad();

    // Load user profile
    currentProfile = await StorageManager.getUserProfile();

    // Initial form detection
    detectAndSetupForms();

    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((message: ContentMessage, sender, sendResponse) => {
      handleMessage(message, sendResponse);
      return true; // Will respond asynchronously
    });

    console.log('[SecureFill] Content script initialized');

    // If autofill-on-load is enabled and user consent exists, attempt autofill automatically
    try {
      if (autofillOnLoad && autofillEnabled) {
        // respect blocked domains
        const blocked = await StorageManager.isDomainBlocked(window.location.href);
        if (!blocked) {
          if (!consentGiven) {
            const userConsent = await requestUserConsent();
            if (!userConsent) {
              console.log('[SecureFill] Autofill-on-load cancelled by user');
              return;
            }
            await StorageManager.setConsent(true);
            consentGiven = true;
          }

          // Perform autofill (silent - minimal UI feedback)
          await performAutofillOnLoad();
        }
      }
    } catch (err) {
      console.error('[SecureFill] Autofill-on-load error:', err);
    }
  } catch (error) {
    console.error('[SecureFill] Error initializing content script:', error);
  }
}

/**
 * Perform autofill automatically when page loads (opt-in)
 */
async function performAutofillOnLoad(): Promise<void> {
  try {
    const forms = FormDetector.detectForms();
    if (forms.length === 0) {
      return;
    }

    currentProfile = currentProfile ?? (await StorageManager.getUserProfile());
    if (!currentProfile) return;

    let totalFieldsFilled = 0;

    for (const form of forms) {
      const formElement = document.getElementById(form.formId) ||
        (form.formId.startsWith('form-') &&
          document.querySelectorAll('form')[parseInt(form.formId.split('-')[1])] as HTMLFormElement | null);

      if (!formElement || !(formElement instanceof HTMLFormElement)) {
        continue;
      }

      const visibleFields = AutofillEngine.getVisibleFields(form.fields);
      const fieldsToFill = visibleFields.filter((f) => !AutofillEngine.shouldSkipField(f));
      const mappings = AutofillEngine.generateFieldMappings(fieldsToFill, currentProfile);

      const results = AutofillEngine.fillForm(formElement, mappings, currentProfile);
      const filledCount = results.filter((r) => r.success).length;
      totalFieldsFilled += filledCount;

      try {
        const domain = new URL(window.location.href).hostname;
        await StorageManager.logAutofillAction(domain, filledCount, true);
      } catch {}
    }

    if (totalFieldsFilled > 0 && floatingButton) {
      floatingButton.showSuccess();
      floatingButton.showNotification(`Autofilled ${totalFieldsFilled} field${totalFieldsFilled !== 1 ? 's' : ''}`);
    }
  } catch (error) {
    console.error('[SecureFill] performAutofillOnLoad error:', error);
  }
}

/**
 * Detect forms and setup floating button
 */
function detectAndSetupForms(): void {
  if (!autofillEnabled) return;

  const forms = FormDetector.detectForms();

  if (forms.length > 0) {
    // Create floating button if it doesn't exist
    if (!floatingButton) {
      floatingButton = new FloatingButton({ position: 'bottom-right' });
      floatingButton.create(handleFloatingButtonClick);
    }

    floatingButton.show();
  }

  // Setup DOM observer for dynamically added forms
  if (!formObserver) {
    formObserver = FormDetector.observeDOMChanges(() => {
      const hasNewForms = FormDetector.hasFillableForms();
      if (hasNewForms && floatingButton) {
        floatingButton.show();
      }
    });
  }
}

/**
 * Handle floating button click
 */
async function handleFloatingButtonClick(): Promise<void> {
  if (!floatingButton || !currentProfile) return;

  // Check if user has given consent
  if (!consentGiven) {
    const userConsent = await requestUserConsent();
    if (!userConsent) {
      floatingButton.showError('Autofill cancelled');
      return;
    }
    await StorageManager.setConsent(true);
    consentGiven = true;
  }

  floatingButton.setLoading(true);

  try {
    const forms = FormDetector.detectForms();
    if (forms.length === 0) {
      floatingButton.showError('No forms detected');
      return;
    }

    let totalFieldsFilled = 0;
    let totalSuccess = true;

    for (const form of forms) {
      const formElement = document.getElementById(form.formId) ||
        (form.formId.startsWith('form-') && 
          document.querySelectorAll('form')[parseInt(form.formId.split('-')[1])] as HTMLFormElement | null);

      if (!formElement || !(formElement instanceof HTMLFormElement)) {
        continue;
      }

      // Generate field mappings
      const visibleFields = AutofillEngine.getVisibleFields(form.fields);
      const skippedFields = visibleFields.filter((f) => AutofillEngine.shouldSkipField(f));
      const fieldsToFill = visibleFields.filter((f) => !AutofillEngine.shouldSkipField(f));

      const mappings = AutofillEngine.generateFieldMappings(fieldsToFill, currentProfile);

      // Fill form
      const results = AutofillEngine.fillForm(formElement, mappings, currentProfile);
      const isValid = AutofillEngine.validateFillResults(results);

      if (!isValid) {
        totalSuccess = false;
      }

      const filledCount = results.filter((r) => r.success).length;
      totalFieldsFilled += filledCount;

      // Log autofill action
      try {
        const domain = new URL(window.location.href).hostname;
        await StorageManager.logAutofillAction(domain, filledCount, isValid);
      } catch {
        // Ignore logging errors
      }
    }

    // Show result
    if (totalSuccess && totalFieldsFilled > 0) {
      floatingButton.showSuccess();
      floatingButton.showNotification(`✓ Successfully filled ${totalFieldsFilled} field${totalFieldsFilled !== 1 ? 's' : ''}`);
    } else if (totalFieldsFilled > 0) {
      floatingButton.showSuccess();
      floatingButton.showNotification(`Filled ${totalFieldsFilled} field${totalFieldsFilled !== 1 ? 's' : ''}`);
    } else {
      floatingButton.showError('Could not fill any fields');
    }
  } catch (error) {
    console.error('[SecureFill] Error during autofill:', error);
    floatingButton.showError('Error during autofill');
  } finally {
    floatingButton.setLoading(false);
  }
}

/**
 * Request user consent for autofill
 */
function requestUserConsent(): Promise<boolean> {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 100000;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
    `;

    const dialog = document.createElement('div');
    dialog.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 24px;
      max-width: 400px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      text-align: center;
    `;

    dialog.innerHTML = `
      <h2 style="margin: 0 0 16px 0; font-size: 20px; color: #1f2937;">Allow SecureFill AI to autofill?</h2>
      <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 14px;">
        SecureFill will fill this form with your stored profile data. Your password and sensitive fields will never be autofilled.
      </p>
      <div style="display: flex; gap: 12px; justify-content: center;">
        <button id="securefill-deny" style="
          padding: 10px 20px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: #6b7280;
          transition: all 0.2s;
        ">Don't Fill</button>
        <button id="securefill-allow" style="
          padding: 10px 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        ">Allow Autofill</button>
      </div>
    `;

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    const denyBtn = dialog.querySelector('#securefill-deny') as HTMLButtonElement;
    const allowBtn = dialog.querySelector('#securefill-allow') as HTMLButtonElement;

    const cleanup = () => {
      overlay.remove();
    };

    denyBtn.addEventListener('click', () => {
      cleanup();
      resolve(false);
    });

    allowBtn.addEventListener('click', () => {
      cleanup();
      resolve(true);
    });

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        cleanup();
        resolve(false);
      }
    });
  });
}

/**
 * Handle messages from background script
 */
async function handleMessage(message: ContentMessage, sendResponse: (response: unknown) => void): Promise<void> {
  try {
    switch (message.type) {
      case 'FORM_DETECTED':
        detectAndSetupForms();
        sendResponse({ success: true });
        break;

      case 'REQUEST_AUTOFILL':
        await handleFloatingButtonClick();
        sendResponse({ success: true });
        break;

      case 'GET_PROFILE':
        sendResponse({ profile: currentProfile });
        break;

      case 'SAVE_PROFILE':
        if (message.payload) {
          currentProfile = message.payload as UserProfile;
          await StorageManager.saveUserProfile(currentProfile);
          sendResponse({ success: true });
        }
        break;

      default:
        sendResponse({ error: 'Unknown message type' });
    }
  } catch (error) {
    console.error('[SecureFill] Error handling message:', error);
    sendResponse({ error: String(error) });
  }
}

/**
 * Handle extension unload
 */
window.addEventListener('beforeunload', () => {
  if (formObserver) {
    formObserver.disconnect();
  }
  if (floatingButton) {
    floatingButton.remove();
  }
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initContentScript);
} else {
  initContentScript();
}
