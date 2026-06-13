/**
 * Background Service Worker
 * Handles extension-level events and storage management
 */

import { StorageManager } from '../storage/storage';
import type { UserProfile, BackgroundMessage } from '../types/profile';

console.log('[SecureFill] Background service worker starting');

/**
 * Handle runtime installation
 */
chrome.runtime.onInstalled.addListener((details: chrome.runtime.InstalledDetails) => {
  console.log('[SecureFill] Extension installed/updated:', details.reason);
});

/**
 * Listen for messages from content scripts and popup
 */
chrome.runtime.onMessage.addListener((message: BackgroundMessage, sender: chrome.runtime.MessageSender, sendResponse: (response?: unknown) => void) => {
  handleMessage(message, sender, sendResponse);
  return true;
});

/**
 * Handle messages from content scripts and popup
 */
async function handleMessage(
  message: BackgroundMessage,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: unknown) => void
): Promise<void> {
  try {
    switch (message.type) {
      case 'STORE_PROFILE': {
        if (message.data) {
          await StorageManager.saveUserProfile(message.data as UserProfile);
          sendResponse({ success: true });
        } else {
          sendResponse({ error: 'No profile data provided' });
        }
        break;
      }

      case 'GET_STORED_PROFILE': {
        const profile = await StorageManager.getUserProfile();
        sendResponse({ profile });
        break;
      }

      case 'UPDATE_PROFILE': {
        if (message.data) {
          const updated = await StorageManager.updateUserProfile(message.data as Partial<UserProfile>);
          sendResponse({ success: true, profile: updated });
        } else {
          sendResponse({ error: 'No update data provided' });
        }
        break;
      }

      case 'DELETE_PROFILE': {
        await StorageManager.deleteUserProfile();
        sendResponse({ success: true });
        break;
      }

      case 'AUTOFILL_REQUESTED': {
        if (sender.tab?.id) {
          chrome.tabs.sendMessage(
            sender.tab.id,
            { type: 'REQUEST_AUTOFILL', payload: message.data },
            (response) => {
              if (chrome.runtime.lastError) {
                console.error('[SecureFill] Tab message error:', chrome.runtime.lastError.message);
              } else if (response) {
                sendResponse(response);
              }
            }
          );
        } else {
          sendResponse({ error: 'No tab ID available' });
        }
        break;
      }

      default:
        sendResponse({ error: 'Unknown message type' });
    }
  } catch (error) {
    console.error('[SecureFill] Error handling message:', error);
    sendResponse({ error: String(error) });
  }
}

console.log('[SecureFill] Background service worker initialized');
