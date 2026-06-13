/**
 * Autofill Engine
 * Intelligently matches and fills form fields with user profile data
 */

import type { FieldMetadata, UserProfile } from '../types/profile';

export class AutofillEngine {
  /**
   * Generate field mappings between form fields and user profile
   */
  static generateFieldMappings(
    fields: FieldMetadata[],
    profile: UserProfile
  ): Map<string, keyof UserProfile> {
    const mappings = new Map<string, keyof UserProfile>();

    fields.forEach((field) => {
      if (field.suggestedField) {
        // Verify the suggested field has data
        const profileValue = profile[field.suggestedField];
        if (profileValue && profileValue !== '') {
          mappings.set(field.id, field.suggestedField);
        }
      }
    });

    return mappings;
  }

  /**
   * Fill a single field with value
   */
  static fillField(
    fieldElement: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
    value: string
  ): boolean {
    try {
      const originalValue = fieldElement.value;

      // Set value using multiple methods to ensure it sticks
      fieldElement.value = value;

      // Trigger input events to notify any JavaScript listeners
      const inputEvent = new Event('input', { bubbles: true });
      fieldElement.dispatchEvent(inputEvent);

      const changeEvent = new Event('change', { bubbles: true });
      fieldElement.dispatchEvent(changeEvent);

      // For React and other frameworks that use blur
      const blurEvent = new Event('blur', { bubbles: true });
      fieldElement.dispatchEvent(blurEvent);

      // Also trigger focus/blur for frameworks that hook into those
      const focusEvent = new Event('focus', { bubbles: true });
      fieldElement.dispatchEvent(focusEvent);

      return fieldElement.value === value;
    } catch (error) {
      console.error('Error filling field:', error);
      return false;
    }
  }

  /**
   * Fill multiple fields in a form
   */
  static fillForm(
    form: HTMLFormElement,
    fieldMappings: Map<string, keyof UserProfile>,
    profile: UserProfile
  ): Array<{ fieldId: string; success: boolean }> {
    const results: Array<{ fieldId: string; success: boolean }> = [];

    fieldMappings.forEach((profileKey, fieldId) => {
      const fieldElement = form.querySelector(
        `[id="${fieldId}"], [name="${fieldId}"]`
      ) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;

      if (fieldElement) {
        const value = String(profile[profileKey] || '');
        const success = this.fillField(fieldElement, value);
        results.push({ fieldId, success });
      }
    });

    return results;
  }

  /**
   * Smart field matcher with fallback strategies
   */
  static findBestMatchingField(
    fields: FieldMetadata[],
    profileKey: keyof UserProfile
  ): FieldMetadata | null {
    // First pass: exact suggestions
    const exactMatch = fields.find((f) => f.suggestedField === profileKey);
    if (exactMatch) return exactMatch;

    // Second pass: confidence-based matching
    const scoredFields = fields
      .map((field) => ({
        field,
        score: this.calculateFieldMatchScore(field, profileKey),
      }))
      .filter((item) => item.score > 0.5)
      .sort((a, b) => b.score - a.score);

    return scoredFields[0]?.field || null;
  }

  /**
   * Calculate match score between a field and profile key
   */
  private static calculateFieldMatchScore(
    field: FieldMetadata,
    profileKey: keyof UserProfile
  ): number {
    let score = 0;

    const combinedText = `${field.label} ${field.placeholder} ${field.name} ${field.id}`.toLowerCase();
    const keywordVariations: Record<keyof UserProfile, string[]> = {
      fullName: ['name', 'full name', 'first name', 'last name'],
      email: ['email', 'mail', 'contact', 'inbox'],
      phone: ['phone', 'tel', 'mobile', 'cell'],
      dateOfBirth: ['date', 'birth', 'dob', 'age'],
      address: ['address', 'street', 'line 1'],
      city: ['city', 'town', 'locality'],
      state: ['state', 'province', 'region'],
      country: ['country', 'nation'],
      pincode: ['pin', 'code', 'zip', 'postal'],
      linkedin: ['linkedin', 'linked in', 'professional'],
      github: ['github', 'repository', 'coding'],
      resumeUrl: ['resume', 'cv', 'curriculum'],
      resumeText: ['resume', 'cover'],
      lastUpdated: [],
      version: [],
    };

    const keywords = keywordVariations[profileKey] || [];
    keywords.forEach((keyword) => {
      if (combinedText.includes(keyword)) {
        score += 0.3;
      }
    });

    // Boost score for exact type matches
    if (profileKey === 'email' && field.type === 'email') {
      score += 0.4;
    }
    if (profileKey === 'phone' && field.type === 'tel') {
      score += 0.4;
    }
    if (profileKey === 'dateOfBirth' && field.type === 'date') {
      score += 0.4;
    }

    // Cap score at 1
    return Math.min(score, 1);
  }

  /**
   * Validate autofill results
   */
  static validateFillResults(
    results: Array<{ fieldId: string; success: boolean }>
  ): boolean {
    const successRate = results.filter((r) => r.success).length / results.length;
    return successRate >= 0.5; // At least 50% success
  }

  /**
   * Get visible fields only (ignore hidden fields)
   */
  static getVisibleFields(fields: FieldMetadata[]): FieldMetadata[] {
    return fields.filter((field) => {
      const element = document.getElementById(field.id) ||
        document.querySelector(`[name="${field.name}"]`) as HTMLElement | null;

      if (!element) return false;

      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);

      return (
        rect.width > 0 &&
        rect.height > 0 &&
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        style.opacity !== '0'
      );
    });
  }

  /**
   * Detect if field should be skipped based on its content or attributes
   */
  static shouldSkipField(field: FieldMetadata): boolean {
    // Skip if already has value
    const element = document.getElementById(field.id) ||
      (document.querySelector(`[name="${field.name}"]`) as HTMLInputElement | null);

    if (element && element.value) {
      return true;
    }

    // Skip readonly fields
    if (element && element.hasAttribute('readonly')) {
      return true;
    }

    // Skip disabled fields
    if (element && element.hasAttribute('disabled')) {
      return true;
    }

    return false;
  }

  /**
   * Fill Google Forms specifically
   */
  static fillGoogleForm(profile: UserProfile): number {
    let filledCount = 0;

    // Get all input fields in Google Forms (they're often in divs with aria-label or data-placeholder)
    const allInputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], textarea');

    allInputs.forEach((input: Element) => {
      const inputEl = input as HTMLInputElement | HTMLTextAreaElement;
      if (inputEl.value) return; // Skip if already filled

      const ariaLabel = inputEl.getAttribute('aria-label')?.toLowerCase() || '';
      const placeholder = inputEl.getAttribute('placeholder')?.toLowerCase() || '';
      const name = inputEl.getAttribute('name')?.toLowerCase() || '';
      const id = inputEl.getAttribute('id')?.toLowerCase() || '';
      const combinedText = `${ariaLabel} ${placeholder} ${name} ${id}`.toLowerCase();

      // Map common Google Forms fields
      if (ariaLabel.includes('name') || placeholder.includes('name') || combinedText.includes('full name')) {
        if (this.fillField(inputEl, profile.fullName || profile.firstName || '')) filledCount++;
      } else if (ariaLabel.includes('email') || placeholder.includes('email')) {
        if (this.fillField(inputEl, profile.email || '')) filledCount++;
      } else if (ariaLabel.includes('phone') || placeholder.includes('phone') || ariaLabel.includes('tel')) {
        if (this.fillField(inputEl, profile.phone || '')) filledCount++;
      } else if (ariaLabel.includes('age') || placeholder.includes('age')) {
        if (this.fillField(inputEl, profile.age || '')) filledCount++;
      } else if (ariaLabel.includes('first name') || placeholder.includes('first name')) {
        if (this.fillField(inputEl, profile.firstName || profile.fullName?.split(' ')[0] || '')) filledCount++;
      } else if (ariaLabel.includes('last name') || placeholder.includes('last name')) {
        if (this.fillField(inputEl, profile.lastName || profile.fullName?.split(' ').pop() || '')) filledCount++;
      } else if (ariaLabel.includes('city') || placeholder.includes('city')) {
        if (this.fillField(inputEl, profile.city || '')) filledCount++;
      } else if (ariaLabel.includes('state') || placeholder.includes('state')) {
        if (this.fillField(inputEl, profile.state || '')) filledCount++;
      } else if (ariaLabel.includes('country') || placeholder.includes('country')) {
        if (this.fillField(inputEl, profile.country || '')) filledCount++;
      } else if (ariaLabel.includes('address') || placeholder.includes('address')) {
        if (this.fillField(inputEl, profile.address || '')) filledCount++;
      } else if (ariaLabel.includes('zip') || placeholder.includes('zip') || ariaLabel.includes('postal')) {
        if (this.fillField(inputEl, profile.pincode || '')) filledCount++;
      } else if (ariaLabel.includes('id') || placeholder.includes('id')) {
        if (this.fillField(inputEl, profile.id || profile.enrollmentNumber || '')) filledCount++;
      } else if (ariaLabel.includes('enroll') || placeholder.includes('enroll')) {
        if (this.fillField(inputEl, profile.enrollmentNumber || profile.enroll || '')) filledCount++;
      }
    });

    // Handle select/dropdown fields
    const allSelects = document.querySelectorAll('select');
    allSelects.forEach((select: Element) => {
      const selectEl = select as HTMLSelectElement;
      if (selectEl.value) return;

      const ariaLabel = selectEl.getAttribute('aria-label')?.toLowerCase() || '';
      const name = selectEl.getAttribute('name')?.toLowerCase() || '';
      const id = selectEl.getAttribute('id')?.toLowerCase() || '';

      if (ariaLabel.includes('gender') || name.includes('gender') || id.includes('gender')) {
        const options = Array.from(selectEl.options).find((opt) =>
          opt.text.toLowerCase().includes(profile.gender?.toLowerCase() || '')
        );
        if (options && this.fillField(selectEl, options.value)) {
          filledCount++;
        }
      }
    });

    return filledCount;
  }
}
