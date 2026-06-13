/**
 * User Profile Schema for Chrome Extension Storage
 * Defines the structure of user data stored in chrome.storage.local
 */

export interface UserProfile {
  // Personal Information
  fullName: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  age?: string;
  gender?: string;
  dateOfBirth: string; // ISO date format YYYY-MM-DD

  // Address Information
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;

  // Identification
  id?: string; // Student ID, Employee ID, etc.
  enrollmentNumber?: string;
  enroll?: string; // Alias for enrollment

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
  fullName: 'John Alexander Smith',
  firstName: 'John',
  lastName: 'Smith',
  email: 'john.smith@example.com',
  phone: '+1-555-123-4567',
  age: '28',
  gender: 'Male',
  dateOfBirth: '1996-05-15',
  address: '123 Main Street, Apt 4B',
  city: 'New York',
  state: 'NY',
  country: 'United States',
  pincode: '10001',
  id: 'STU-2024-00156',
  enrollmentNumber: 'EN-2024-0156',
  enroll: 'EN-2024-0156',
  linkedin: 'https://linkedin.com/in/johnsmith',
  github: 'https://github.com/johnsmith',
  resumeUrl: 'https://example.com/resume/john-smith.pdf',
  resumeText: 'Experienced software developer with 5 years in web development and cloud technologies.',
  lastUpdated: new Date().toISOString(),
  version: 1,
};

export const FIELD_KEYWORDS: Record<keyof UserProfile, RegExp[]> = {
  fullName: [/full.?name|name|given.?name|first.?name|last.?name|surname/i, /^name$/i],
  firstName: [/first.?name|given.?name|fname/i],
  lastName: [/last.?name|family.?name|surname|lname/i],
  email: [/email|e-mail|mail|contact.?email|email.?address/i],
  phone: [/phone|tel|telephone|mobile|cell|contact.?phone|phone.?number/i],
  age: [/age|years?.?old/i],
  gender: [/gender|sex|male|female/i],
  dateOfBirth: [/dob|date.?of.?birth|birth.?date|birthday/i],
  address: [/address|street|address.?line.?1/i],
  city: [/city|town|locality/i],
  state: [/state|province|region/i],
  country: [/country|nation/i],
  pincode: [/pin.?code|postal.?code|zip.?code|post.?code|zip|postcode/i],
  id: [/student.?id|employee.?id|user.?id|id.?number|identification/i],
  enrollmentNumber: [/enrollment|enroll.?number|enroll.?id|student.?number/i],
  enroll: [/enroll|enrollment/i],
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
