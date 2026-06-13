import { useState } from 'react';
import { Share2, Lock, Download, Check } from 'lucide-react';
import { DocumentItem, ShareConfig } from '../../types';

interface QrLinkManagerProps {
  documents: DocumentItem[];
  shares: ShareConfig[];
  setShares: (shares: ShareConfig[] | ((prev: ShareConfig[]) => ShareConfig[])) => void;
  selectedDocForQR: DocumentItem | null;
  setSelectedDocForQR: (doc: DocumentItem | null) => void;
  showToast: (msg: string) => void;
  logSystemActivity: (action: string, details: string, status?: 'Success' | 'Warning' | 'Error') => void;
  handleSimulateRemoteScan: (qr: ShareConfig) => void;
}

export default function QrLinkManager({
  documents,
  shares,
  setShares,
  selectedDocForQR,
  setSelectedDocForQR,
  showToast,
  logSystemActivity,
  handleSimulateRemoteScan
}: QrLinkManagerProps) {
  
  // Local state for QR parameters
  const [qrOptions, setQrOptions] = useState({
    viewOnly: true,
    downloadAllowed: true,
    passwordProtected: false,
    password: '',
    expiryDate: '2026-06-30'
  });

  // Local state for Password Generator settings
  const [passwordGeneratorLength, setPasswordGeneratorLength] = useState(12);
  const [passwordGeneratorSymbols, setPasswordGeneratorSymbols] = useState(true);
  const [passwordGeneratorNumbers, setPasswordGeneratorNumbers] = useState(true);
  const [passwordGeneratorCapitals, setPasswordGeneratorCapitals] = useState(true);

  // Trigger QR generation
  const triggerGenerateShareQR = () => {
    if (!selectedDocForQR) {
      showToast("Please choose a document to generate QR share links.");
      return;
    }

    const newQR: ShareConfig = {
      id: `sh-${Date.now()}`,
      documentId: selectedDocForQR.id,
      viewOnly: qrOptions.viewOnly,
      downloadAllowed: qrOptions.downloadAllowed,
      passwordProtected: qrOptions.passwordProtected,
      password: qrOptions.password,
      expiryDate: qrOptions.expiryDate,
      qrCodeUrl: "SECUREFILL_QR_" + Math.floor(Math.random() * 99999),
      scanCount: 0,
      downloadCount: 0,
      deviceType: "None yet",
      location: "Waiting scans"
    };

    setShares(prev => [newQR, ...prev]);
    logSystemActivity("Share", `Generated dynamic QR sharing link for paper ${selectedDocForQR.name}`, "Success");
    showToast(`Share link and secure QR generated for ${selectedDocForQR.name}!`);
  };

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="border-b border-[#E5E5E5] pb-4">
        <h2 className="text-xl font-extrabold tracking-tight text-[#222222]">Sealed QR Share Console</h2>
        <p className="text-xs text-[#666666] font-semibold">Generate temporary, password-protected, encrypted QR link codes for specific files to share with external verification institutions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Step-by-Step Settings (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="saas-card p-5 bg-white space-y-5 shadow-sm">
            <span className="text-[10px] font-bold text-[#666666] uppercase block border-b border-[#E5E5E5] pb-2">QR Link Builder Settings</span>
            
            {/* Select document item */}
            <div className="space-y-2 text-xs">
              <label className="font-bold text-[#222222] block">Step 1: Choose Document</label>
              <select 
                className="w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg p-2.5 text-xs text-[#222222]"
                value={selectedDocForQR?.id || ""}
                onChange={(e) => {
                  const found = documents.find(d => d.id === e.target.value);
                  if (found) setSelectedDocForQR(found);
                }}
              >
                <option value="">-- Choose file from Vault --</option>
                {documents.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.category})</option>
                ))}
              </select>
            </div>

            {/* View Options checkboxes */}
            <div className="space-y-3.5 text-xs">
              <label className="font-bold text-[#222222] block">Step 2: Access Rules Security</label>
              
              <div className="space-y-2.5">
                <label className="flex items-center gap-2.5 cursor-pointer text-[#222222]">
                  <input 
                    type="checkbox"
                    checked={qrOptions.viewOnly}
                    onChange={(e) => setQrOptions(prev => ({ ...prev, viewOnly: e.target.checked }))}
                    className="w-4 h-4 rounded border-[#E5E5E5] text-[#3B82F6]"
                  />
                  <div>
                    <span className="font-bold block">View Only Access</span>
                    <span className="text-[11px] text-[#666666]">Receiver can inspect OCR details without saving files.</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-[#222222]">
                  <input 
                    type="checkbox"
                    checked={qrOptions.downloadAllowed}
                    onChange={(e) => setQrOptions(prev => ({ ...prev, downloadAllowed: e.target.checked }))}
                    className="w-4 h-4 rounded border-[#E5E5E5] text-[#3B82F6]"
                  />
                  <div>
                    <span className="font-bold block">Download Allowed</span>
                    <span className="text-[11px] text-[#666666]">Permits direct binary download from verifier's terminal.</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-[#222222]">
                  <input 
                    type="checkbox"
                    checked={qrOptions.passwordProtected}
                    onChange={(e) => setQrOptions(prev => ({ ...prev, passwordProtected: e.target.checked }))}
                    className="w-4 h-4 rounded border-[#E5E5E5] text-[#3B82F6]"
                  />
                  <div>
                    <span className="font-bold block">Password Protected</span>
                    <span className="text-[11px] text-[#666666]">Mandates standard password entries for decryption.</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Password input if enabled */}
            {qrOptions.passwordProtected && (
              <div className="space-y-3.5 text-xs bg-[#FAFAFA] border border-[#E5E5E5] p-3.5 rounded-xl">
                <div className="space-y-1">
                  <label className="font-bold text-[#222222] block">Decryption Password KEY</label>
                  <input 
                    type="text"
                    placeholder="Enter or generate custom password strength..."
                    value={qrOptions.password}
                    onChange={(e) => setQrOptions(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full bg-white border border-[#E5E5E5] rounded-lg p-2 text-xs font-mono text-[#222222] outline-none"
                  />
                </div>

                {/* Interactive Password Generator parameters */}
                <div className="space-y-2 border-t border-[#E5E5E5] pt-2">
                  <span className="text-[10px] font-bold text-[#666666] uppercase block">Entropy Generator Tool</span>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-[#666666]">Length ({passwordGeneratorLength}):</span>
                    <input 
                      type="range" 
                      min="8" 
                      max="24"
                      value={passwordGeneratorLength}
                      onChange={(e) => setPasswordGeneratorLength(Number(e.target.value))}
                      className="flex-1 accent-[#3B82F6]"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <button 
                      onClick={() => setPasswordGeneratorCapitals(!passwordGeneratorCapitals)}
                      className={`text-[10px] font-bold px-2 py-1 rounded transition-all cursor-pointer ${passwordGeneratorCapitals ? 'bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]' : 'bg-white text-[#666666] border border-[#E5E5E5]'}`}
                    >
                      {passwordGeneratorCapitals ? '✓ A-Z' : '✕ A-Z'}
                    </button>
                    <button 
                      onClick={() => setPasswordGeneratorNumbers(!passwordGeneratorNumbers)}
                      className={`text-[10px] font-bold px-2 py-1 rounded transition-all cursor-pointer ${passwordGeneratorNumbers ? 'bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]' : 'bg-white text-[#666666] border border-[#E5E5E5]'}`}
                    >
                      {passwordGeneratorNumbers ? '✓ 0-9' : '✕ 0-9'}
                    </button>
                    <button 
                      onClick={() => setPasswordGeneratorSymbols(!passwordGeneratorSymbols)}
                      className={`text-[10px] font-bold px-2 py-1 rounded transition-all cursor-pointer ${passwordGeneratorSymbols ? 'bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]' : 'bg-white text-[#666666] border border-[#E5E5E5]'}`}
                    >
                      {passwordGeneratorSymbols ? '✓ !@#' : '✕ !@#'}
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      let chars = "abcdefghijklmnopqrstuvwxyz";
                      if (passwordGeneratorCapitals) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                      if (passwordGeneratorNumbers) chars += "0123456789";
                      if (passwordGeneratorSymbols) chars += "!@#$%^&*()_+~|}{[]:;?><,./-=";
                      
                      let generated = "";
                      for (let i = 0; i < passwordGeneratorLength; i++) {
                        generated += chars.charAt(Math.floor(Math.random() * chars.length));
                      }
                      setQrOptions(prev => ({ ...prev, password: generated }));
                      showToast("Generated high-entropy sharing password.");
                    }}
                    className="w-full bg-[#222222] text-white hover:bg-[#333333] font-bold text-[10px] py-1.5 rounded uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Generate High-Entropy Key
                  </button>
                </div>
              </div>
            )}

            {/* Link Expiration calendar */}
            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-[#222222] block">Step 3: Expiry Calendar Date</label>
              <input 
                type="date"
                value={qrOptions.expiryDate}
                onChange={(e) => setQrOptions(prev => ({ ...prev, expiryDate: e.target.value }))}
                className="w-full bg-[#FAFAFA] border border-[#E5E5E5] p-2.5 rounded-lg text-xs outline-none"
              />
            </div>

            <button 
              onClick={triggerGenerateShareQR}
              className="w-full bg-[#222222] text-white hover:bg-[#333333] font-bold text-xs p-3 rounded-lg uppercase tracking-wider cursor-pointer"
            >
              Generate Sealed QR Code
            </button>

          </div>
        </div>

        {/* QR Output and Scanner simulation (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="saas-card p-5 bg-[#FAFAFA] text-center space-y-4 shadow-sm">
            <span className="text-[10px] font-bold text-[#666666] uppercase block">Sealed QR Output</span>
            
            {selectedDocForQR ? (
              <div className="space-y-4">
                
                {/* Live simulated QR rendering */}
                <div className="w-44 h-44 bg-white border border-[#E5E5E5] rounded-xl p-3 mx-auto flex items-center justify-center relative shadow-sm">
                  <div className="w-full h-full border-4 border-black relative rounded-sm p-1">
                    <div className="absolute top-1 left-1 w-5 h-5 border-4 border-black"></div>
                    <div className="absolute top-1 right-1 w-5 h-5 border-4 border-black"></div>
                    <div className="absolute bottom-1 left-1 w-5 h-5 border-4 border-black"></div>
                    
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-black rounded flex items-center justify-center">
                      <Lock className="w-3.5 h-3.5 text-white" />
                    </div>

                    <div className="grid grid-cols-6 grid-rows-6 gap-0.5 p-4 w-full h-full opacity-70">
                      <span className="bg-black"></span><span className="bg-transparent"></span><span className="bg-black"></span>
                      <span className="bg-black"></span><span className="bg-transparent"></span><span className="bg-black"></span>
                      <span className="bg-black"></span><span className="bg-black"></span><span className="bg-transparent"></span>
                      <span className="bg-transparent"></span><span className="bg-black"></span><span className="bg-black"></span>
                    </div>
                  </div>
                </div>

                <div className="text-xs space-y-1 font-mono text-center">
                  <p className="font-bold text-[#222222]">{selectedDocForQR.name}</p>
                  <p className="text-[11px] text-[#666666]">Expiration Constraint: {qrOptions.expiryDate}</p>
                  <p className="text-[11px] text-[#3B82F6] font-semibold">Rules: {qrOptions.viewOnly ? 'View Only' : 'Shared Binary'}</p>
                </div>

              </div>
            ) : (
              <div className="p-12 text-[#666666] text-xs">
                <p>Choose a document in Step 1 to generate dynamic QR payload outputs.</p>
              </div>
            )}
          </div>

          {/* QR ANALYTICS DATABASE GRID */}
          <div className="saas-card p-5 bg-white space-y-3.5 shadow-sm">
            <span className="text-[10px] font-bold text-[#666666] uppercase block">QR Usage Analytics</span>
            
            <div className="space-y-3">
              {shares.map(sh => {
                const associatedDoc = documents.find(d => d.id === sh.documentId);
                return (
                  <div key={sh.id} className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl text-xs space-y-2">
                    <div className="flex justify-between font-bold text-[#222222]">
                      <span className="truncate max-w-[150px]">{associatedDoc ? associatedDoc.name : "System Item"}</span>
                      <span className="text-[#3B82F6]">{sh.scanCount} Scans</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-[#666666]">
                      <div>Last Scan: {sh.lastScan || "Never"}</div>
                      <div>Location: {sh.location}</div>
                      <div>Downloads: {sh.downloadCount} files</div>
                      <div>Device: {sh.deviceType}</div>
                    </div>
                    <div className="pt-1.5 flex justify-end gap-1.5 border-t border-[#E1E1E1]">
                      <button 
                        onClick={() => handleSimulateRemoteScan(sh)}
                        className="px-2 py-1 bg-white border border-[#E5E5E5] hover:bg-[#FAFAFA] rounded font-bold text-[10px] flex items-center gap-1 text-[#222222] cursor-pointer"
                      >
                        Simulate Mobile Scan Event
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
