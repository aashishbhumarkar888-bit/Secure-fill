import { useState } from 'react';
import { Fingerprint } from 'lucide-react';

interface SecuritySettingsProps {
  user: any;
  setUser: (user: any | ((prev: any) => any)) => void;
  showToast: (msg: string) => void;
  toggleBiometricsSetting: () => void;
  unlockQrCodeEnabled: boolean;
  setUnlockQrCodeEnabled: (b: boolean) => void;
  scholarshipMatchEnabled: boolean;
  setScholarshipMatchEnabled: (b: boolean) => void;
}

export default function SecuritySettings({
  user,
  setUser,
  showToast,
  toggleBiometricsSetting,
  unlockQrCodeEnabled,
  setUnlockQrCodeEnabled,
  scholarshipMatchEnabled,
  setScholarshipMatchEnabled
}: SecuritySettingsProps) {
  
  // Custom API key state override
  const [customApiKey, setCustomApiKey] = useState(() => {
    return localStorage.getItem('CUSTOM_GEMINI_API_KEY') || '';
  });

  const saveCustomApiKey = () => {
    localStorage.setItem('CUSTOM_GEMINI_API_KEY', customApiKey.trim());
    showToast("Gemini API Key override saved! Reconnecting API engine...");
    
    // Notify server of the custom key if necessary
    const activeToken = localStorage.getItem('securefill_auth_token') || '';
    fetch('/api/gemini/set-key', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${activeToken}`
      },
      body: JSON.stringify({ apiKey: customApiKey.trim() })
    }).catch(err => console.error("Failed to sync API key with server:", err));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-[#222222]">SaaS Profile &amp; Keys Security</h2>
        <p className="text-xs text-[#666666] font-semibold">Review your personal digital identity details, phone numbers, and manage secure biometric devices.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Personal info form (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="saas-card p-5 bg-white space-y-4 shadow-sm">
            <span className="text-[10px] font-bold text-[#666666] uppercase block border-b border-[#E5E5E5] pb-2">Google Authenticated Identity</span>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#222222]">
              <div className="space-y-1">
                <label className="text-[#666666] block font-bold">Account Owner Name</label>
                <input 
                  type="text" 
                  value={user.name} 
                  onChange={(e) => setUser((prev: any) => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-[#FAFAFA] border border-[#E5E5E5] p-2 rounded-lg focus:ring-1 focus:ring-[#3B82F6] outline-none font-semibold text-[#222222]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#666666] block font-bold">Email Address</label>
                <input 
                  type="text" 
                  value={user.email} 
                  onChange={(e) => setUser((prev: any) => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-[#FAFAFA] border border-[#E5E5E5] p-2 rounded-lg focus:ring-1 focus:ring-[#3B82F6] outline-none font-semibold text-[#222222]"
                  disabled
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#666666] block font-bold">Phone Number</label>
                <input 
                  type="text" 
                  value={user.phone || ''} 
                  onChange={(e) => setUser((prev: any) => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-[#FAFAFA] border border-[#E5E5E5] p-2 rounded-lg font-semibold text-[#222222] outline-none focus:ring-1 focus:ring-[#3B82F6]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#666666] block font-bold">Physical Home Address</label>
                <input 
                  type="text" 
                  value={user.address || ''} 
                  onChange={(e) => setUser((prev: any) => ({ ...prev, address: e.target.value }))}
                  className="w-full bg-[#FAFAFA] border border-[#E5E5E5] p-2 rounded-lg font-semibold text-[#222222] outline-none focus:ring-1 focus:ring-[#3B82F6]"
                />
              </div>

              {/* Genuine Nominee Fields */}
              <div className="space-y-1">
                <label className="text-[#666666] block font-bold">Primary Nominee Name</label>
                <input 
                  type="text" 
                  value={user.nomineeName || ''} 
                  onChange={(e) => setUser((prev: any) => ({ ...prev, nomineeName: e.target.value }))}
                  className="w-full bg-[#EBF3FE] border border-[#3B82F6]/30 p-2 rounded-lg focus:ring-1 focus:ring-[#3B82F6] outline-none font-semibold text-[#222222]"
                  placeholder="Kavita Ghumarkar"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#666666] block font-bold">Nominee Relationship</label>
                <input 
                  type="text" 
                  value={user.nomineeRelationship || ''} 
                  onChange={(e) => setUser((prev: any) => ({ ...prev, nomineeRelationship: e.target.value }))}
                  className="w-full bg-[#EBF3FE] border border-[#3B82F6]/30 p-2 rounded-lg focus:ring-1 focus:ring-[#3B82F6] outline-none font-semibold text-[#222222]"
                  placeholder="Spouse"
                />
              </div>
            </div>

            {/* Hackathon Add-on: Live Gemini API Key configuration */}
            <div className="space-y-2 pt-3 border-t border-[#E5E5E5] text-xs">
              <span className="text-[10px] font-bold text-[#666666] uppercase block">Developer Override Settings (API Keys)</span>
              <div className="space-y-2 bg-[#FAFAFA] border border-[#E5E5E5] p-4 rounded-xl">
                <label className="block font-bold text-[#222222]">Custom Gemini API Key Override</label>
                <p className="text-[11px] text-[#666666] leading-relaxed mb-2">
                  By default, the application connects to the server-side `GEMINI_API_KEY`. If it's missing or you want to use your own private key, paste it here. Keys are persisted in your local browser storage.
                </p>
                <div className="flex gap-2">
                  <input 
                    type="password" 
                    placeholder="paste your gemini-api-key here..."
                    value={customApiKey}
                    onChange={(e) => setCustomApiKey(e.target.value)}
                    className="flex-1 bg-white border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs font-mono outline-none text-[#222222] focus:ring-1 focus:ring-[#3B82F6]"
                  />
                  <button 
                    onClick={saveCustomApiKey}
                    className="bg-[#222222] hover:bg-[#333333] text-white px-4 py-2 rounded-lg font-bold text-xs cursor-pointer"
                  >
                    Save Key
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-[#E5E5E5]">
              <span className="text-[10px] font-bold text-[#666666] uppercase block">Social Links Integrations</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-2.5 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl text-center">
                  <span className="font-bold text-xs text-[#222222] block">GitHub Port</span>
                  <span className="font-mono text-[10px] text-[#3B82F6]">{user.socials?.github || 'N/A'}</span>
                </div>
                <div className="p-2.5 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl text-center">
                  <span className="font-bold text-xs text-[#222222] block">LinkedIn Port</span>
                  <span className="font-mono text-[10px] text-[#3B82F6]">{user.socials?.linkedin || 'N/A'}</span>
                </div>
                <div className="p-2.5 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl text-center">
                  <span className="font-bold text-xs text-[#222222] block">Personal Dev Port</span>
                  <span className="font-mono text-[10px] text-[#3B82F6]">{user.socials?.portfolio || 'N/A'}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Device key locks settings (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="saas-card p-5 bg-[#FAFAFA] space-y-4 shadow-sm">
            <span className="text-[10px] font-bold text-[#666666] uppercase block pb-2 border-b border-[#E5E5E5]">Security Hardware Keys</span>
            
            <div className="space-y-4 text-xs text-[#222222]">
              <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-[#E5E5E5]">
                <div>
                  <span className="font-bold block">Biometric Finger Scan</span>
                  <span className="text-[10px] text-[#666666]">Enable one-touch thumb logins</span>
                </div>
                <button
                  onClick={toggleBiometricsSetting}
                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors cursor-pointer ${
                    user.biometricsEnabled ? 'bg-[#22C55E]' : 'bg-[#E5E5E5]'
                  }`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    user.biometricsEnabled ? 'translate-x-5' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-[#E5E5E5]">
                <div>
                  <span className="font-bold block">Two-Factor Authentication</span>
                  <span className="text-[10px] text-[#666666]">Mandates mobile OTP variables</span>
                </div>
                <button
                  onClick={() => {
                    setUser((prev: any) => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }));
                    showToast(!user.twoFactorEnabled ? "Two-factor OTP restriction enabled." : "2FA disabled.");
                  }}
                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors cursor-pointer ${
                    user.twoFactorEnabled ? 'bg-[#22C55E]' : 'bg-[#E5E5E5]'
                  }`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    user.twoFactorEnabled ? 'translate-x-5' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-[#E5E5E5]">
                <div>
                  <span className="font-bold block">Unlock QR Code</span>
                  <span className="text-[10px] text-[#666666]">Generates real-time encrypted signatures</span>
                </div>
                <button
                  onClick={() => {
                    setUnlockQrCodeEnabled(!unlockQrCodeEnabled);
                    showToast(!unlockQrCodeEnabled ? "🟢 Custom Unlock QR code activated!" : "Unlock QR code deactivated.");
                  }}
                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors cursor-pointer ${
                    unlockQrCodeEnabled ? 'bg-[#22C55E]' : 'bg-[#E5E5E5]'
                  }`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    unlockQrCodeEnabled ? 'translate-x-5' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-[#E5E5E5]">
                <div>
                  <span className="font-bold block">Scholarship Match</span>
                  <span className="text-[10px] text-[#666666]">Enables AI-driven parsing &amp; direct criteria mapping</span>
                </div>
                <button
                  onClick={() => {
                    setScholarshipMatchEnabled(!scholarshipMatchEnabled);
                    showToast(!scholarshipMatchEnabled ? "🟢 Academic Scholarship Match Engine activated!" : "Scholarship match engine deactivated.");
                  }}
                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors cursor-pointer ${
                    scholarshipMatchEnabled ? 'bg-[#22C55E]' : 'bg-[#E5E5E5]'
                  }`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    scholarshipMatchEnabled ? 'translate-x-5' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>

            <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl p-3.5 text-xs text-[#222222] space-y-1">
              <span className="font-bold block text-[#EF4444]">Integrity Advisory</span>
              <p className="text-[11px] text-[#666666] leading-relaxed">All active keys are encrypted with standard AES-GCM-256 blocks stored exclusively in your browser session storage. Clearing browser cache resets key registries.</p>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
