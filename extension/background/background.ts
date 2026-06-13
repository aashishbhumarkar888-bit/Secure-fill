/**
 * Background Service Worker
 * Handles extension-level events and storage management
 */

import { StorageManager } from '../storage/storage';
import type { UserProfile, BackgroundMessage } from '../types/profile';

/**
 * Initialize background service worker
 */
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // Open options page on install (optional)
    // chrome.runtime.openOptionsPage();
    
    console.log('[SecureFill] Extension installed');
  } else if (details.reason === 'update') {
    console.log('[SecureFill] Extension updated');
  }
});

/**
 * Listen for messages from content scripts and popup
 */
chrome.runtime.onMessage.addListener((message: BackgroundMessage, sender, sendResponse) => {
  handleMessage(message, sender, sendResponse);
  return true; // Will respond asynchronously
});

/**
 * Handle messages from content scripts and popup
 */
async function handleMessage(
  message: BackgroundMessage,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: unknown) => void
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
        // Forward autofill request to content script
        if (sender.tab?.id) {
          chrome.tabs.sendMessage(
            sender.tab.id,
            { type: 'REQUEST_AUTOFILL', payload: message.data },
            (response) => {
              if (chrome.runtime.lastError) {
                sendResponse({ error: chrome.runtime.lastError.message });
              } else {
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

/**
 * Handle tab updates for form detection
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Optionally detect forms on page load
    // This is optional - forms are detected by content script on load
    console.log('[SecureFill] Tab updated:', tab.url);
  }
});

/**
 * Context menu for autofill (optional)
 */
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'autofill-form',
    title: 'SecureFill - Autofill Form',
    contexts: ['editable'],
  });

  chrome.contextMenus.create({
    id: 'open-settings',
    title: 'SecureFill - Settings',
    contexts: ['action'],
  });
});

/**
 * Handle context menu clicks
 */
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'autofill-form' && tab?.id) {
    chrome.tabs.sendMessage(tab.id, {
      type: 'REQUEST_AUTOFILL',
    });
  } else if (info.menuItemId === 'open-settings') {
    chrome.runtime.openOptionsPage();
  }
});

console.log('[SecureFill] Background service worker initialized');
