/**
 * User Profile Schema for Chrome Extension Storage
 * Defines the structure of user data stored in chrome.storage.local
 */

export interface UserProfile {
  // Personal Information
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string; // ISO date format YYYY-MM-DD

  // Address Information
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;

  // Professional Information
  linkedin: string;
  github: string;

  // Additional Information
  resumeUrl?: string;
  resumeText?: string;

  // Metadata
  lastUpdated: string; // ISO timestamp
  version: number;
}

export interface FieldMetadata {
  id: string;
  name: string;
  type: string;
  label: string;
  placeholder: string;
  ariaLabel?: string;
  dataAttributes?: Record<string, string>;
  classNames: string;
  confidenceScore: number;
  suggestedField?: keyof UserProfile;
}

export interface FormMetadata {
  formId: string;
  formName: string;
  formAction?: string;
  formMethod: string;
  fields: FieldMetadata[];
  detectionTimestamp: string;
}

export interface AutofillRequest {
  tabId: number;
  formId: string;
  fieldMappings: Array<{
    fieldId: string;
    profileKey: keyof UserProfile;
  }>;
  userApproved: boolean;
}

export interface ContentMessage {
  type: 'FORM_DETECTED' | 'REQUEST_AUTOFILL' | 'AUTOFILL_COMPLETE' | 'AUTOFILL_ERROR' | 'GET_PROFILE' | 'SAVE_PROFILE';
  payload?: Record<string, unknown>;
  error?: string;
}

export interface BackgroundMessage {
  type: 'STORE_PROFILE' | 'GET_STORED_PROFILE' | 'UPDATE_PROFILE' | 'DELETE_PROFILE' | 'AUTOFILL_REQUESTED';
  data?: UserProfile | Partial<UserProfile>;
}

export const DEFAULT_USER_PROFILE: UserProfile = {
  fullName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  address: '',
  city: '',
  state: '',
  country: '',
  pincode: '',
  linkedin: '',
  github: '',
  resumeUrl: '',
  resumeText: '',
  lastUpdated: new Date().toISOString(),
  version: 1,
};

export const FIELD_KEYWORDS: Record<keyof UserProfile, RegExp[]> = {
  fullName: [/full.?name|name|given.?name|first.?name|last.?name|surname/i, /^name$/i],
  email: [/email|e-mail|mail|contact.?email|email.?address/i],
  phone: [/phone|tel|telephone|mobile|cell|contact.?phone|phone.?number/i],
  dateOfBirth: [/dob|date.?of.?birth|birth.?date|birthday|age/i],
  address: [/address|street|address.?line.?1/i],
  city: [/city|town|locality/i],
  state: [/state|province|region/i],
  country: [/country|nation/i],
  pincode: [/pin.?code|postal.?code|zip.?code|post.?code|zip|postcode/i],
  linkedin: [/linkedin|linked.?in|linkedin.?profile|linkedin.?url/i],
  github: [/github|github.?profile|github.?username|github.?url/i],
  resumeUrl: [/resume.?url|resume.?link|cv.?url|cv.?link/i],
  resumeText: [/resume|curriculum.?vitae|cv|cover.?letter/i],
  lastUpdated: [],
  version: [],
};

export const BLOCKED_FIELDS: RegExp[] = [
  /password|pass|pwd|secret|token/i,
  /otp|one.?time.?password|2fa|two.?factor|verification.?code/i,
  /cvv|cvc|security.?code|card.?security.?code/i,
  /ssn|social.?security|tax.?id|iban|account.?number/i,
  /credit.?card|debit.?card|card.?number/i,
];
