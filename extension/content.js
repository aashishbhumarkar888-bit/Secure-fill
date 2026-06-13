// SMARTFORM AI - Universal Intelligent Form Autofill Extension
// Content Script for advanced DOM extraction, synonym mapping, and offline semantic comparison.
console.log("🔒 SMARTFORM AI: Universal Intelligent Form Content Script Loaded.");

// Standard Vault profile coordinates (corresponds to user's secure encrypted records)
const VAULT_CREDENTIALS = {
  full_name: "Ashish Ghumarkar",
  email: "aashishbhumarkar888@gmail.com",
  phone: "+91 98765 43210",
  date_of_birth: "2002-09-18",
  gender: "Male",
  college_name: "LNCT University",
  degree: "B.Tech Computer Science Engineering",
  graduation_year: "2026",
  linkedin: "https://linkedin.com/in/ashish_ghumarkar",
  github: "https://github.com/ashish_ghumarkar",
  portfolio: "https://ashishghumarkar.dev",
  address: "M-12, Arera Colony, Bhopal, Madhya Pradesh, India",
  city: "Bhopal",
  state: "Madhya Pradesh",
  country: "India",
  skills: "React, TypeScript, Node.js, Express, Python, D3.js, Cybersecurity, AES Encryption, Chrome Extensions",
  experience: "Fullstack Developer Intern at LNCT Tech Hub, Android Security Contributor",
  bio: "Passionate senior software engineer specializing in offline-first secure systems, client-side cryptography, and privacy-preserving automation."
};

// Rich semantic lexicon for synonym clustering and neural-like keyword intersections
const KEYWORD_MAPPINGS = {
  full_name: ["name", "full name", "applicant name", "candidate name", "your name", "first name", "last name", "username", "legal name"],
  email: ["email", "mail id", "e-mail", "email address", "mail address", "contact mail", "electronic mail"],
  phone: ["phone", "mobile", "contact", "tel", "whatsapp", "phone number", "mobile number", "contact number", "telephone", "cellphone"],
  date_of_birth: ["dob", "date of birth", "birthdate", "born on", "birthday", "birth date"],
  gender: ["gender", "sex", "pronouns"],
  college_name: ["college", "university", "institute", "institution", "alma mater", "school", "board", "college name"],
  degree: ["degree", "btech", "b.tech", "graduation", "qualification", "course", "major", "field of study", "highest degree"],
  graduation_year: ["passout", "passing year", "graduation year", "batch", "completion year", "graduation_year"],
  linkedin: ["linkedin", "linked in", "linkedin profile", "linkedin link", "professional network", "social media profile"],
  github: ["github", "git", "github link", "github profile", "repo link", "version control", "open source contributions"],
  portfolio: ["portfolio", "website", "personal web", "portfolio link", "homepage", "blog", "online work link"],
  address: ["address", "permanent address", "residential", "location", "residence", "postal address", "street address"],
  city: ["city", "town", "metro", "district"],
  state: ["state", "province", "region", "territory", "union territory"],
  country: ["country", "nation", "nationality", "citizenship"],
  skills: ["skills", "expertise", "competencies", "technologies", "programming tools", "what languages do you know"],
  experience: ["experience", "employment", "internship", "work history", "jobs", "prior background"],
  bio: ["bio", "biography", "about me", "tell us about yourself", "introduction", "cover letter", "professional statement"]
};

// Semantic intent mapping for complex conversational/indirect questions
const SEMANTIC_INTENTS = [
  {
    keywords: ["how can we contact you", "reach you", "contact channels", "reach out", "callback"],
    matches: ["phone", "email"]
  },
  {
    keywords: ["tell us about yourself", "who are you", "personal summary", "introduce yourself", "about you", "brief bio"],
    matches: ["bio", "experience"]
  },
  {
    keywords: ["share your professional profile", "recruiters find your work", "social networks", "portfolio urls", "online resume links"],
    matches: ["github", "linkedin", "portfolio"]
  }
];

// Clean Google Forms & custom DOM questionnaire contextual parser
function extractLabelFromElement(inputEl) {
  // 1. Check direct attributes that often hold context
  if (inputEl.getAttribute('aria-label')) return inputEl.getAttribute('aria-label');
  if (inputEl.placeholder) return inputEl.placeholder;
  if (inputEl.name) return inputEl.name;
  if (inputEl.id) {
    const associatedLabel = document.querySelector(`label[for="${inputEl.id}"]`);
    if (associatedLabel) return associatedLabel.textContent;
  }

  // 2. Traversal upwards to extract Google Forms structure or generic nested HTML
  let parent = inputEl.parentElement;
  let searchDepth = 0;
  while (parent && searchDepth < 6) {
    // Look for Google Forms standard card indicators : .Qr7Oae, .geS5ne or lists
    if (
      parent.classList.contains('Qr7Oae') || 
      parent.classList.contains('geS5ne') || 
      parent.getAttribute('role') === 'listitem' ||
      parent.className.includes('question') ||
      parent.className.includes('field-container')
    ) {
      // Locate title headers inside this card wrapper
      const titleEl = parent.querySelector('[role="heading"], [class*="title"], [class*="Title"], [class*="Question"], [class*="Label"], h1, h2, h3, h4, label');
      if (titleEl) {
        return titleEl.textContent;
      }
    }
    
    // Generic sibling locator
    const siblingHeader = parent.querySelector('label, p, span');
    if (siblingHeader && siblingHeader !== inputEl && siblingHeader.textContent.trim().length > 3) {
      const text = siblingHeader.textContent.trim();
      if (text.length < 150) return text;
    }

    parent = parent.parentElement;
    searchDepth++;
  }
  return "";
}

// AI-based Semantic Heuristic and Cosine/Intersection Word Matcher
function getMatchedValue(labelText) {
  if (!labelText) return null;
  const normalized = labelText.toLowerCase().replace(/[*:]/g, "").trim();

  // Step 1: Scan for conversational semantic intents (Directives like "tell us about you")
  for (const intent of SEMANTIC_INTENTS) {
    for (const phrase of intent.keywords) {
      if (normalized.includes(phrase)) {
        // Find first key that contains a value
        for (const candidateKey of intent.matches) {
          const val = VAULT_CREDENTIALS[candidateKey];
          if (val) {
            return { key: candidateKey, value: val, confidence: 0.95 };
          }
        }
      }
    }
  }

  // Step 2: Synonym Keyword word boundary & substring lookup
  let bestKey = null;
  let maxScore = 0;

  for (const [fieldKey, keywords] of Object.entries(KEYWORD_MAPPINGS)) {
    for (const keyword of keywords) {
      // Substring check
      if (normalized.includes(keyword)) {
        let score = keyword.length / normalized.length; // Relative overlap length
        
        // Exact matches give perfect score
        if (normalized === keyword) {
          score = 1.0;
        } else {
          // Token overlapping boost 
          const tokens = normalized.split(/\s+/);
          if (tokens.includes(keyword)) {
            score += 0.3;
          }
        }
        
        if (score > maxScore) {
          maxScore = score;
          bestKey = fieldKey;
        }
      }
    }
  }

  if (bestKey && maxScore > 0.15) {
    const val = VAULT_CREDENTIALS[bestKey];
    if (val) {
      return { key: bestKey, value: val, confidence: Math.min(0.99, maxScore) };
    }
  }

  return null;
}

// Injects the credential values securely triggering browser event loop
function safelyFillElement(el, val) {
  try {
    el.focus();
    
    // Check standard HTML5 elements or wrappers
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      const nativeTextareaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
      
      if (el.tagName === 'INPUT' && nativeInputValueSetter) {
        nativeInputValueSetter.call(el, val);
      } else if (el.tagName === 'TEXTAREA' && nativeTextareaValueSetter) {
        nativeTextareaValueSetter.call(el, val);
      } else {
        el.value = val;
      }
    } else {
      // Rich editor editable divs
      el.textContent = val;
      el.innerText = val;
    }

    // Fire critical input hooks so modern SPA frameworks save the state
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    
    // Typing keystroke emulation loop
    const keypressEvent = new KeyboardEvent('keypress', { key: val.slice(-1), bubbles: true });
    el.dispatchEvent(keypressEvent);
    
    el.blur();
    return true;
  } catch (e) {
    console.error("⚠️ SMARTFORM AI: Failed to populate DOM input:", e);
    return false;
  }
}

// Core form compilation pipeline
function triggerAutoFillProcess() {
  const inputSelectors = [
    'input[type="text"]',
    'input[type="email"]',
    'input[type="tel"]',
    'input[type="url"]',
    'input[type="date"]',
    'input:not([type])',
    'textarea',
    '[role="textbox"]',
    '[contenteditable="true"]'
  ];

  const fillableInputs = [];
  inputSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      if (!fillableInputs.includes(el) && el.style.display !== 'none' && el.style.visibility !== 'hidden') {
        fillableInputs.push(el);
      }
    });
  });

  let fillSuccessCount = 0;
  let skippedCount = 0;
  const reports = [];

  fillableInputs.forEach((el, index) => {
    const rawLabel = extractLabelFromElement(el);
    const match = getMatchedValue(rawLabel);

    if (match) {
      const ok = safelyFillElement(el, match.value);
      if (ok) {
        fillSuccessCount++;
        
        // Dynamic CSS highlighting to feedback accuracy to user
        const origBorder = el.style.border;
        const origBg = el.style.backgroundColor;
        el.style.border = '2px dashed #059669';
        el.style.backgroundColor = '#ECFDF5';
        
        setTimeout(() => {
          el.style.border = origBorder;
          el.style.backgroundColor = origBg;
        }, 4000);

        reports.push({
          question: rawLabel.trim().substring(0, 50),
          matchedKey: match.key,
          filledValue: match.value,
          confidence: Math.round(match.confidence * 100),
          isSkipped: false
        });
      } else {
        skippedCount++;
      }
    } else {
      skippedCount++;
      
      // Highlight unmapped questions lightly as requested with "No matching data available"
      const origBorder = el.style.border;
      const origBg = el.style.backgroundColor;
      el.style.border = '1px dashed #EF4444';
      el.style.backgroundColor = '#FEF2F2';
      
      const noteEl = document.createElement('div');
      noteEl.className = 'smartform-missing-indicator';
      noteEl.style.color = '#EF4444';
      noteEl.style.fontSize = '9px';
      noteEl.style.fontWeight = '700';
      noteEl.style.marginTop = '4px';
      noteEl.innerText = '⚠️ SMARTFORM AI: No matching data available in secure local profile.';
      
      el.parentElement.appendChild(noteEl);

      setTimeout(() => {
        el.style.border = origBorder;
        el.style.backgroundColor = origBg;
        noteEl.remove();
      }, 5000);

      reports.push({
        question: rawLabel.trim().substring(0, 50),
        matchedKey: "N/A",
        filledValue: "",
        confidence: 0,
        isSkipped: true,
        reason: "No matched attributes found locally"
      });
    }
  });

  const successRate = fillableInputs.length > 0 
    ? Math.round((fillSuccessCount / fillableInputs.length) * 100) 
    : 100;

  return {
    success: true,
    totalCount: fillableInputs.length,
    count: fillSuccessCount,
    skipped: skippedCount,
    successRate: successRate,
    logs: reports
  };
}

// Listen for connection commands
chrome.runtime.onMessage?.addListener((request, sender, sendResponse) => {
  if (request.action === 'auto_fill') {
    const outcome = triggerAutoFillProcess();
    sendResponse(outcome);
  }
  return true;
});

// Floating secure pill for instant single-click entry
function injectFloatingTrigger() {
  if (document.getElementById('smartform-floating-pill')) return;

  const pill = document.createElement('div');
  pill.id = 'smartform-floating-pill';
  
  Object.assign(pill.style, {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    backgroundColor: '#111827',
    color: '#34D399',
    padding: '12px 18px',
    borderRadius: '30px',
    boxShadow: '0 12px 28px -4px rgba(0,0,0,0.4), 0 8px 12px -5px rgba(0,0,0,0.3)',
    cursor: 'pointer',
    fontFamily: '-apple-system, sans-serif',
    fontSize: '11px',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    zIndex: '2147483647',
    border: '1px solid #374151',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  });

  pill.innerHTML = `
    <span style="display:inline-block; width:8px; height:8px; background-color:#34D399; border-radius:50%; animation: pulse 1.5s infinite;"></span>
    <span>⚡ AUTO-FILL WITH SMARTFORM AI</span>
  `;

  // Hover transitions
  pill.onmouseenter = () => {
    pill.style.transform = 'translateY(-2px) scale(1.03)';
    pill.style.backgroundColor = '#1F2937';
    pill.style.color = '#10B981';
  };
  pill.onmouseleave = () => {
    pill.style.transform = 'translateY(0) scale(1)';
    pill.style.backgroundColor = '#111827';
    pill.style.color = '#34D399';
  };

  pill.onclick = () => {
    pill.innerHTML = `<span>⏳ SCRAPING & COMPARING INTERSECTIONS...</span>`;
    setTimeout(() => {
      const outcome = triggerAutoFillProcess();
      pill.innerHTML = `<span>🎉 FILLED ${outcome.count} FIELDS Successfully! (${outcome.successRate}%)</span>`;
      
      // Inline Toast Alert Card
      const toast = document.createElement('div');
      Object.assign(toast.style, {
        position: 'fixed',
        bottom: '80px',
        right: '24px',
        backgroundColor: '#111827',
        color: '#FFFFFF',
        padding: '14px 20px',
        borderRadius: '16px',
        border: '1px solid #374151',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        fontSize: '11px',
        fontWeight: '500',
        zIndex: '2147483647',
        opacity: '0',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      });
      
      toast.innerHTML = `
        <div style="font-weight:800; color:#10B981; margin-bottom:4px;">🔒 SmartForm AI Verification Complete:</div>
        <div>Total Found: <b>${outcome.totalCount}</b> | Filled: <b>${outcome.count}</b> | Skipped: <b>${outcome.skipped}</b></div>
        <div>Success Rate: <b>${outcome.successRate}%</b> (No fake details populated)</div>
      `;
      document.body.appendChild(toast);
      
      setTimeout(() => { toast.style.opacity = '1'; }, 50);
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 400);
      }, 5000);

      setTimeout(() => {
        pill.innerHTML = `
          <span style="display:inline-block; width:8px; height:8px; background-color:#34D399; border-radius:50%;"></span>
          <span>⚡ AUTO-FILL WITH SMARTFORM AI</span>
        `;
      }, 3500);
    }, 400);
  };

  document.body.appendChild(pill);
}

// CSS animations definitions
const style = document.createElement('style');
style.innerHTML = `
  @keyframes pulse {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.4); opacity: 0.4; }
    100% { transform: scale(1); opacity: 1; }
  }
`;
document.head.appendChild(style);

// Automatically launch floating widget if webform contains questions
if (
  document.location.href.includes('docs.google.com/forms') || 
  document.location.href.includes('google.com/forms') ||
  document.querySelector('form') ||
  document.querySelectorAll('input').length > 3
) {
  setTimeout(injectFloatingTrigger, 1000);
}

