// SMARTFORM AI Popup Control Script
// Manages local state, pre-fill review mode, and autocomplete reporting metric cards.

// Local copy of security coordinates for review and inline editing
const VAULT_CREDENTIALS = {
  full_name: "Ashish Ghumarkar",
  email: "aashishbhumarkar888@gmail.com",
  phone: "+91 98765 43210",
  date_of_birth: "2002-09-18",
  college_name: "LNCT University",
  degree: "B.Tech Computer Science Engineering",
  graduation_year: "2026",
  linkedin: "https://linkedin.com/in/ashish_ghumarkar",
  github: "https://github.com/ashish_ghumarkar",
  portfolio: "https://ashishghumarkar.dev"
};

// Friendly user labels
const LABELS = {
  full_name: "Full Name",
  email: "Email Address",
  phone: "Phone / Cell",
  date_of_birth: "Birth Date",
  college_name: "College Name",
  degree: "Degree / Course",
  graduation_year: "Graduation Year",
  linkedin: "LinkedIn Profile",
  github: "GitHub Link",
  portfolio: "Portfolio Link"
};

// Render key-value pairs in popup for quick review prior to submitting
function renderReviewFields() {
  const container = document.getElementById('review-list');
  if (!container) return;

  container.innerHTML = '';
  
  Object.entries(VAULT_CREDENTIALS).forEach(([key, value]) => {
    const item = document.createElement('div');
    item.style.display = 'flex';
    item.style.flexDirection = 'column';
    item.style.gap = '2px';
    item.style.borderBottom = '1px solid #E5E7EB';
    item.style.paddingBottom = '5px';
    item.style.marginBottom = '3px';

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.fontSize = '9px';
    header.style.fontWeight = '700';
    header.style.color = '#4B5563';
    header.innerText = LABELS[key] || key;

    const input = document.createElement('input');
    input.type = 'text';
    input.value = value;
    input.style.border = 'none';
    input.style.background = 'transparent';
    input.style.fontSize = '11px';
    input.style.fontWeight = '600';
    input.style.color = '#111827';
    input.style.outline = 'none';
    input.style.width = '100%';
    input.style.padding = '2px 0';
    
    // Save live edits
    input.addEventListener('input', (e) => {
      VAULT_CREDENTIALS[key] = e.target.value;
    });

    item.appendChild(header);
    item.appendChild(input);
    container.appendChild(item);
  });
}

// Initial draw
document.addEventListener('DOMContentLoaded', renderReviewFields);

document.getElementById('fill-btn').addEventListener('click', async () => {
  const btn = document.getElementById('fill-btn');
  const logsEl = document.getElementById('logs');
  const metricsCard = document.getElementById('metrics-card');
  const metricsStats = document.getElementById('metrics-stats');
  
  btn.disabled = true;
  btn.innerHTML = '<span>⚡ Auto-filling...</span>';
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) {
      showError("No active browser window found.");
      return;
    }

    if (!tab.url || tab.url.startsWith("chrome://")) {
      showError("Cannot execute on Chrome system pages.");
      return;
    }

    // Send auto_fill trigger command to content script with edited vaults
    chrome.tabs.sendMessage(tab.id, { 
      action: 'auto_fill',
      profileOverride: VAULT_CREDENTIALS // Passes modified local values!
    }, (response) => {
      // Check for errors
      if (chrome.runtime.lastError) {
        showError("Content script not active. Refresh form tab first!");
        console.error(chrome.runtime.lastError);
        return;
      }

      if (response && response.success) {
        btn.innerHTML = '<span>✓ Complete! Metrics Built</span>';
        btn.style.backgroundColor = '#10B981';
        
        // Build Completion Report statistics dynamically
        if (metricsCard && metricsStats) {
          metricsCard.style.display = 'block';
          metricsStats.innerHTML = `
            <div style="background:white; border-radius:4px; padding:4px;">
              <div style="font-size:14px; font-weight:800; color:#111827;">${response.totalCount || 0}</div>
              <div style="font-size:8px; color:#6B7280; text-transform:uppercase;">Scanned</div>
            </div>
            <div style="background:white; border-radius:4px; padding:4px;">
              <div style="font-size:14px; font-weight:800; color:#059669;">${response.count || 0}</div>
              <div style="font-size:8px; color:#059669; text-transform:uppercase;">Filled</div>
            </div>
            <div style="background:white; border-radius:4px; padding:4px;">
              <div style="font-size:14px; font-weight:800; color:#DC2626;">${response.skipped || 0}</div>
              <div style="font-size:8px; color:#DC2626; text-transform:uppercase;">Empty</div>
            </div>
            <div style="background:white; border-radius:4px; padding:4px;">
              <div style="font-size:14px; font-weight:800; color:#2563EB;">${response.successRate || 0}%</div>
              <div style="font-size:8px; color:#2563EB; text-transform:uppercase;">Success</div>
            </div>
          `;
        }

        // Show logs panel with filled credentials information
        logsEl.style.display = 'block';
        if (response.count > 0 || response.skipped > 0) {
          logsEl.innerHTML = `<div style="font-weight:700; border-bottom:1px solid #374151; padding-bottom:3px; margin-bottom:4px;">Cognitive Mapping Log Tracker:</div>`;
          response.logs.forEach(log => {
            const color = log.isSkipped ? '#EF4444' : '#10B981';
            const sign = log.isSkipped ? '✗ [Empty]' : `✓ [Matched ${log.matchedKey}]`;
            logsEl.innerHTML += `
              <div style="margin-top:4px; padding-left:6px; border-left:2.5px solid ${color};">
                <span style="color:${color}; font-weight:bold;">${sign}</span>: ${log.question}...
              </div>
            `;
          });
        } else {
          logsEl.innerHTML = `<div>🔍 Scanned. No fillable HTML elements found on the page viewport.</div>`;
        }
        
        setTimeout(() => {
          btn.disabled = false;
          btn.style.backgroundColor = '';
          btn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
            <span>⚡ Run One-Click Autofill</span>
          `;
        }, 5000);
      } else {
        showError("Form population script aborted.");
      }
    });

  } catch (err) {
    showError("Aborted: Check active window states.");
    console.error(err);
  }
});

function showError(msg) {
  const btn = document.getElementById('fill-btn');
  const logsEl = document.getElementById('logs');
  
  btn.disabled = false;
  btn.style.backgroundColor = '#EF4444';
  btn.innerHTML = '<span>⚠️ Connection Failed</span>';
  
  logsEl.style.display = 'block';
  logsEl.style.color = '#EF4444';
  logsEl.innerHTML = `<div>ERROR: ${msg}</div>`;
  
  setTimeout(() => {
    btn.style.backgroundColor = '';
    btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
      </svg>
      <span>⚡ Run One-Click Autofill</span>
    `;
    logsEl.style.color = '#10B981';
  }, 4500);
}
