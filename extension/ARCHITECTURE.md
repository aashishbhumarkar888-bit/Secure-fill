# Architecture & Data Flow Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Chrome Browser                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Website/Web Page (DOM)                       │  │
│  │                                                           │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │         Content Script (content.ts)                 │ │  │
│  │  │  ┌───────────────────────────────────────────────┐  │ │  │
│  │  │  │  • FormDetector - Detect forms               │  │ │  │
│  │  │  │  • FloatingButton - Show UI                  │  │ │  │
│  │  │  │  • AutofillEngine - Fill fields              │  │ │  │
│  │  │  │  • Event Listeners - Handle user actions     │  │ │  │
│  │  │  └───────────────────────────────────────────────┘  │ │  │
│  │  │                     ↕ (Messages)                     │ │  │
│  │  │  ┌───────────────────────────────────────────────┐  │ │  │
│  │  │  │     Floating Button Component                 │  │ │  │
│  │  │  │  • Shows on form detection                    │  │ │  │
│  │  │  │  • Animated UI                               │  │ │  │
│  │  │  │  • Handles clicks                            │  │ │  │
│  │  │  └───────────────────────────────────────────────┘  │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            ↕ (Chrome API)                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │        Extension Popup (popup.html/popup.ts)             │  │
│  │  • Profile form                                          │  │
│  │  • Settings                                              │  │
│  │  • Integration layer                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                     ↕ (Messages)                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │    Background Service Worker (background.ts)             │  │
│  │  ┌───────────────────────────────────────────────────┐   │  │
│  │  │  • Message Router                                │   │  │
│  │  │  • Storage Manager                               │   │  │
│  │  │  • Context Menu Handler                          │   │  │
│  │  └───────────────────────────────────────────────────┘   │  │
│  │                     ↓                                      │  │
│  │  ┌───────────────────────────────────────────────────┐   │  │
│  │  │     Storage Manager (storage.ts)                  │   │  │
│  │  │  • User Profile CRUD                             │   │  │
│  │  │  • Settings Management                           │   │  │
│  │  │  • Domain Blocking                               │   │  │
│  │  │  • Analytics Logging                             │   │  │
│  │  └───────────────────────────────────────────────────┘   │  │
│  │                     ↓                                      │  │
│  │  ┌───────────────────────────────────────────────────┐   │  │
│  │  │   chrome.storage.local (User Data)               │   │  │
│  │  │  • Profile: Name, Email, Phone, etc.             │   │  │
│  │  │  • Settings: Autofill enabled, blocked domains   │   │  │
│  │  │  • History: Last 100 autofill actions            │   │  │
│  │  └───────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Message Flow Diagram

### User Interacts with Form

```
User Navigates to Website
         ↓
Content Script Loads (document_start)
         ↓
FormDetector.detectForms()
         ↓
Forms Found?
    ├─→ Yes ──→ FloatingButton.show()
    │           ↓
    │      User sees "✨" button
    │
    └─→ No ──→ Wait for DOM changes
               ↓
           FormDetector.observeDOMChanges()
```

### User Clicks Floating Button

```
User clicks "✨" button
         ↓
hasConsentGiven()?
    ├─→ Yes ──→ Skip to Autofill
    │
    └─→ No ──→ Show Consent Dialog
               ↓
            User confirms
               ↓
            setConsent(true)
               ↓
            ↓
┌─────────────────────────────────────┐
│        AUTOFILL PROCESS             │
├─────────────────────────────────────┤
│ 1. Get stored UserProfile           │
│ 2. FormDetector.detectForms()       │
│ 3. For each form:                   │
│    - Get visible fields             │
│    - Filter skipped fields          │
│    - Generate mappings              │
│    - Fill form with profile data    │
│    - Validate results               │
│ 4. Log action to storage            │
│ 5. Show success/error notification  │
└─────────────────────────────────────┘
         ↓
    User sees filled form
    with success message
```

### Data Storage Flow

```
User Profile
    ↓
│
├─→ [ProfileManager.saveProfile()]
│        ↓
│   [StorageManager.saveUserProfile()]
│        ↓
│   [chrome.storage.local.set()]
│        ↓
│   User Data Stored Locally
│
├─→ [FormDetector - Field Analysis]
│        ↓
│   [FIELD_KEYWORDS matching]
│        ↓
│   [Generate Mappings]
│        ↓
│   [AutofillEngine.fillForm()]
│        ↓
│   [AutofillEngine.fillField()]
│        ↓
│   [Field filled with data]
│
└─→ [StorageManager.logAutofillAction()]
         ↓
    Analytics logged
```

## Component Interaction Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                    Popup Component                            │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  ReactApp (Your existing app)                          │  │
│  │  - Profile Form                                        │  │
│  │  - Settings Panel                                      │  │
│  │  - Autofill Button                                     │  │
│  └────────────────────────────────────────────────────────┘  │
│           ↕ (window.securefillAPI)                           │
├──────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────┐  │
│  │        Extension API Layer (popup.ts)                  │  │
│  │  • getUserProfile()                                    │  │
│  │  • saveUserProfile()                                   │  │
│  │  • requestAutofill()                                   │  │
│  │  • getBlockedDomains()                                 │  │
│  │  • etc.                                                │  │
│  └────────────────────────────────────────────────────────┘  │
│           ↕ (chrome.runtime.sendMessage)                     │
├──────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────┐  │
│  │    Background Service Worker (background.ts)           │  │
│  │  • Route messages                                      │  │
│  │  • Call StorageManager                                 │  │
│  │  • Forward to content scripts                          │  │
│  └────────────────────────────────────────────────────────┘  │
│           ↕                                                  │
├──────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────┐  │
│  │    Storage Layer (storage.ts)                          │  │
│  │  • StorageManager class                                │  │
│  │  • Chrome API wrapper                                  │  │
│  │  • Async operations                                    │  │
│  └────────────────────────────────────────────────────────┘  │
│           ↕ (chrome.storage.local)                           │
├──────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────┐  │
│  │    Chrome Local Storage                                │  │
│  │  • User profile data                                   │  │
│  │  • Settings                                            │  │
│  │  • Blocked domains                                     │  │
│  │  • History                                             │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

## Field Detection Algorithm

```
Form Element
    ↓
FormDetector.extractFieldMetadata(form)
    ↓
For each input/textarea/select:
    ↓
    ├─→ analyzeField()
    │      ↓
    │      1. Extract identifiers:
    │         • label (via <label> tag)
    │         • placeholder
    │         • name attribute
    │         • id attribute
    │         • aria-label
    │         • data-* attributes
    │         • class names
    │      ↓
    │      2. Combine all text
    │      ↓
    │      3. classifyField()
    │         • Check HTML type first
    │         • Match against FIELD_KEYWORDS
    │         • Calculate confidence score
    │      ↓
    │      4. isBlockedField()
    │         • Match against BLOCKED_FIELDS
    │         • Skip passwords, OTPs, etc.
    │      ↓
    │      5. Return FieldMetadata
    │
    └─→ Repeat for all fields
        ↓
    Return array of FieldMetadata
```

## Autofill Matching Algorithm

```
Form Fields + User Profile
    ↓
AutofillEngine.generateFieldMappings()
    ↓
For each field:
    ├─→ Has suggestedField?
    │      ├─→ Yes ──→ Add to mappings
    │      └─→ No ──→ Skip field
    │
    └─→ Field has value in profile?
           ├─→ Yes ──→ Add mapping
           └─→ No ──→ Skip field
    ↓
Return Map<fieldId → profileKey>
    ↓
For each mapping:
    ├─→ Find HTML element
    │      ↓
    │   fillField(element, profileValue)
    │      ↓
    │   1. Set element.value = profileValue
    │   2. Trigger events:
    │      • input event (JavaScript listeners)
    │      • change event (form validation)
    │      • blur event (field processing)
    │      • focus event (framework hooks)
    │   3. Verify value set correctly
    │      ↓
    │   Return success/failure
    │
    └─→ Collect results
        ↓
    validateFillResults()
        ↓
    Success rate ≥ 50%?
        ├─→ Yes ──→ Show success message
        └─→ No ──→ Show partial warning
```

## State Management

```
Extension State:

1. Storage State
   ├─ UserProfile (loaded on demand)
   ├─ Settings (autofill enabled, consent given)
   ├─ BlockedDomains (list of domains)
   └─ History (autofill actions)

2. Content Script State
   ├─ currentProfile (cached in memory)
   ├─ autofillEnabled (from storage)
   ├─ consentGiven (from storage)
   ├─ floatingButton (FloatingButton instance)
   └─ formObserver (MutationObserver)

3. Popup State
   ├─ profile (in React component state)
   ├─ settings (in React component state)
   ├─ loading (UI state)
   └─ error (error message)
```

## Permission Flow

```
Extension Manifest Permissions
    ├─ storage
    │  └─ Can use chrome.storage.local
    │     └─ Read/write user profile
    │
    ├─ activeTab
    │  └─ Can access current tab
    │     └─ Send messages to content script
    │
    ├─ scripting
    │  └─ Can inject content scripts
    │     └─ Run on all pages
    │
    ├─ <all_urls>
    │  └─ Host permission for all websites
    │     └─ Content script runs everywhere
    │
    └─ webRequest (optional)
       └─ Can intercept web requests
          └─ Future: Detect form types
```

## Error Handling Flow

```
Any operation
    ↓
Try block
    ├─→ Success ──→ Return result
    │
    └─→ Error ──→ Catch block
                  ↓
              Catch error type:
              ├─ Storage error
              │  └─ Retry or fallback to default
              ├─ DOM error
              │  └─ Skip element, continue
              ├─ Message error
              │  └─ Log and respond with error
              └─ Unknown error
                 └─ Log full stack, show generic message
                 ↓
              Log to console (if debug)
                 ↓
              Show user notification (if critical)
                 ↓
              Continue gracefully
```

## Timing Diagram

```
Timeline of Events:

T0: Chrome Extension Loads
    └─ Manifest parsed
    └─ Background worker started
    └─ Icons loaded
    └─ Permissions registered

T1: User navigates to website
    └─ Content script injected
    └─ DOM listener attached
    └─ DOM observer started

T2: Page DOM ready
    └─ FormDetector.detectForms()
    └─ Forms found
    └─ FloatingButton.create()
    └─ Button hidden (opacity: 0)

T3: Forms rendered
    └─ FloatingButton.show()
    └─ Floating button visible to user

T4: User sees floating button
    └─ Button ready for interaction

T5: User clicks button
    ├─ Check consent
    ├─ If no consent → Show dialog
    ├─ User confirms
    ├─ FloatingButton.setLoading(true)
    ├─ Get profile from storage
    ├─ Detect current forms
    ├─ Generate mappings
    ├─ Fill fields (each ~1ms)
    ├─ Validate results
    ├─ Log action
    ├─ Show success/error
    └─ FloatingButton.setLoading(false)

T6: User sees result
    └─ Form fields filled
    └─ Notification shown
    └─ Button returns to normal
```

## Module Dependencies

```
profile.ts (Types)
    ↑
    │ (imports)
    │
    ├─ storage.ts
    ├─ detector.ts
    ├─ autofill.ts
    ├─ floatingButton.ts
    ├─ react-integration.ts
    ├─ popup.ts
    ├─ content.ts
    └─ background.ts

Utilities (no dependencies on other utils)
    ├─ string.ts
    ├─ promise.ts
    └─ logger.ts

Extension Scripts
    ├─ background.ts
    │  └─ depends on: storage, profile
    │
    ├─ content.ts
    │  └─ depends on: detector, autofill, floatingButton, storage, profile
    │
    └─ popup.ts
       └─ depends on: storage, profile, react-integration
```

---

**Architecture Version**: 1.0  
**Last Updated**: June 2026
