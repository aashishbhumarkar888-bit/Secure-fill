/**
 * Extension Index
 * Main entry point for extension types and utilities
 */

// Types
export type {
  UserProfile,
  FieldMetadata,
  FormMetadata,
  AutofillRequest,
  ContentMessage,
  BackgroundMessage,
} from './types/profile';

export {
  DEFAULT_USER_PROFILE,
  FIELD_KEYWORDS,
  BLOCKED_FIELDS,
} from './types/profile';

// Storage
export { StorageManager } from './storage/storage';

// Utils
export { FormDetector } from './utils/detector';
export { AutofillEngine } from './utils/autofill';
export { FloatingButton } from './utils/floatingButton';
export type { FloatingButtonConfig } from './utils/floatingButton';

// React Integration
export {
  isExtensionContext,
  useExtensionAPI,
  ProfileManager,
  SettingsManager,
  AutofillManager,
} from './utils/react-integration';

// Utilities
export { extractDomain, formatDate, validateEmail, validatePhone, sanitizeString } from './utils/string';
export { withTimeout, retryAsync, createDeferredPromise } from './utils/promise';
export { Logger, LogLevel } from './utils/logger';
