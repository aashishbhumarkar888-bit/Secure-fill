/**
 * Form Detection and Field Analysis
 * Intelligently detects forms and extracts field metadata
 */

import type { FieldMetadata, FormMetadata, UserProfile } from '../types/profile';
import { FIELD_KEYWORDS, BLOCKED_FIELDS } from '../types/profile';

export class FormDetector {
  /**
   * Detect all forms on the current page
   */
  static detectForms(): FormMetadata[] {
    const forms = document.querySelectorAll('form');
    const detectedForms: FormMetadata[] = [];

    forms.forEach((form, index) => {
      const formMetadata = this.extractFormMetadata(form, index);
      if (formMetadata.fields.length > 0) {
        detectedForms.push(formMetadata);
      }
    });

    // Also detect forms that might be created with divs and input groups
    const implicitForms = this.detectImplicitForms();
    detectedForms.push(...implicitForms);

    return detectedForms;
  }

  /**
   * Extract metadata for a specific form
   */
  private static extractFormMetadata(
    form: HTMLFormElement,
    index: number
  ): FormMetadata {
    const fields = this.extractFieldMetadata(form);

    return {
      formId: form.id || `form-${index}`,
      formName: form.name || `Form ${index + 1}`,
      formAction: form.action,
      formMethod: form.method || 'GET',
      fields,
      detectionTimestamp: new Date().toISOString(),
    };
  }

  /**
   * Extract all input fields from a form
   */
  private static extractFieldMetadata(container: HTMLElement): FieldMetadata[] {
    const fields: FieldMetadata[] = [];
    const inputs = container.querySelectorAll(
      'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]), textarea, select'
    );

    inputs.forEach((input, index) => {
      const field = this.analyzeField(input as HTMLInputElement, index);
      if (field && !this.isBlockedField(field)) {
        fields.push(field);
      }
    });

    return fields;
  }

  /**
   * Analyze individual field for metadata and classification
   */
  private static analyzeField(
    input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
    index: number
  ): FieldMetadata | null {
    try {
      // Get all potential identifiers
      const label = this.getFieldLabel(input);
      const placeholder = input.getAttribute('placeholder') || '';
      const name = input.getAttribute('name') || '';
      const id = input.id || '';
      const ariaLabel = input.getAttribute('aria-label') || '';
      const dataAttributes = this.extractDataAttributes(input);
      const classNames = input.className || '';
      const type = (input as HTMLInputElement).getAttribute('type') || 'text';

      // Combine all text for analysis
      const combinedText = `${label} ${placeholder} ${name} ${id} ${ariaLabel} ${classNames}`.toLowerCase();

      // Classify field
      const suggestedField = this.classifyField(combinedText, type);

      return {
        id: id || name || `field-${index}`,
        name,
        type,
        label,
        placeholder,
        ariaLabel,
        dataAttributes,
        classNames,
        confidenceScore: suggestedField ? 0.85 : 0,
        suggestedField,
      };
    } catch (error) {
      console.error('Error analyzing field:', error);
      return null;
    }
  }

  /**
   * Get label associated with field
   */
  private static getFieldLabel(input: HTMLInputElement): string {
    // Check for direct label association
    if (input.id) {
      const label = document.querySelector(`label[for="${input.id}"]`);
      if (label) return label.textContent || '';
    }

    // Check parent label
    const parentLabel = input.closest('label');
    if (parentLabel) return parentLabel.textContent || '';

    // Check for nearby text
    const wrapper = input.closest('[class*="form"], [class*="field"], [class*="group"]');
    if (wrapper) {
      const text = wrapper.textContent || '';
      return text.substring(0, 100);
    }

    return '';
  }

  /**
   * Extract data attributes from field
   */
  private static extractDataAttributes(
    input: HTMLInputElement
  ): Record<string, string> {
    const attributes: Record<string, string> = {};
    Array.from(input.attributes).forEach((attr) => {
      if (attr.name.startsWith('data-')) {
        attributes[attr.name] = attr.value;
      }
    });
    return attributes;
  }

  /**
   * Classify field based on keywords and patterns
   */
  private static classifyField(
    combinedText: string,
    type: string
  ): keyof UserProfile | null {
    // Check type attribute for email
    if (type === 'email') return 'email';
    if (type === 'tel' || type === 'telephone') return 'phone';
    if (type === 'date') return 'dateOfBirth';

    // Match against field keywords
    for (const [fieldName, patterns] of Object.entries(FIELD_KEYWORDS)) {
      for (const pattern of patterns) {
        if (pattern.test(combinedText)) {
          return fieldName as keyof UserProfile;
        }
      }
    }

    return null;
  }

  /**
   * Check if field is blocked from autofill
   */
  private static isBlockedField(field: FieldMetadata): boolean {
    const combinedText = `${field.label} ${field.placeholder} ${field.name} ${field.type}`.toLowerCase();

    for (const pattern of BLOCKED_FIELDS) {
      if (pattern.test(combinedText)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Detect forms created with divs and input groups
   */
  private static detectImplicitForms(): FormMetadata[] {
    const implicitForms: FormMetadata[] = [];

    // Look for common form-like structures
    const formLikeDivs = document.querySelectorAll(
      '[class*="form"], [role="form"]'
    );

    formLikeDivs.forEach((div, index) => {
      const inputs = div.querySelectorAll(
        'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]), textarea, select'
      );

      if (inputs.length > 0 && !div.closest('form')) {
        const fields = this.extractFieldMetadata(div as HTMLElement);
        if (fields.length > 0) {
          implicitForms.push({
            formId: div.id || `implicit-form-${index}`,
            formName: `Form ${index + 1}`,
            formAction: '',
            formMethod: 'POST',
            fields,
            detectionTimestamp: new Date().toISOString(),
          });
        }
      }
    });

    return implicitForms;
  }

  /**
   * Detect DOM changes and new forms
   */
  static observeDOMChanges(callback: () => void): MutationObserver {
    const observer = new MutationObserver((mutations) => {
      let shouldNotify = false;

      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          // Check if any new form or input elements were added
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              const element = node as HTMLElement;
              if (
                element.tagName === 'FORM' ||
                element.tagName === 'INPUT' ||
                element.querySelector('form, input')
              ) {
                shouldNotify = true;
              }
            }
          });
        }
      });

      if (shouldNotify) {
        callback();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false,
      characterData: false,
    });

    return observer;
  }

  /**
   * Check if page has fillable forms
   */
  static hasFillableForms(): boolean {
    const forms = this.detectForms();
    return forms.length > 0;
  }

  /**
   * Get the closest form to an element
   */
  static getFormForElement(element: HTMLElement): HTMLFormElement | null {
    return element.closest('form') || null;
  }

  /**
   * Get all fillable inputs for a form
   */
  static getFormFields(form: HTMLFormElement): FieldMetadata[] {
    return this.extractFieldMetadata(form);
  }
}
