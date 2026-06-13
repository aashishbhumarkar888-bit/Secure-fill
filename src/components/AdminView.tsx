import { Database as DbIcon, Cpu, Key } from 'lucide-react';
import { DocumentItem } from '../types';

interface AdminViewProps {
  documents: DocumentItem[];
  folders: any[];
  setDocuments: (docs: any) => void;
  setFolders: (folders: any) => void;
  setShares: (shares: any) => void;
  setActivityLogs: (logs: any) => void;
  showToast: (msg: string) => void;
  setCurrentSyncStatus: (status: any) => void;
  setSyncProgress: (prog: number) => void;
  logSystemActivity: (action: string, details: string, status?: 'Success' | 'Warning' | 'Error') => void;
  INITIAL_DOCUMENTS: any[];
  INITIAL_FOLDERS: any[];
  INITIAL_SHARES: any[];
  INITIAL_LOGS: any[];
}

export default function AdminView({
  documents,
  folders,
  setDocuments,
  setFolders,
  setShares,
  setActivityLogs,
  showToast,
  setCurrentSyncStatus,
  setSyncProgress,
  logSystemActivity,
  INITIAL_DOCUMENTS,
  INITIAL_FOLDERS,
  INITIAL_SHARES,
  INITIAL_LOGS
}: AdminViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-[#222222]">Central SaaS Admin &amp; Diagnostics</h2>
        <p className="text-xs text-[#666666] font-semibold">Monitor hardware platform allocations, system load outputs, and database registers status.</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white border border-[#E5E5E5] rounded-2xl text-center space-y-2 shadow-sm">
          <DbIcon className="w-10 h-10 text-[#3B82F6] mx-auto opacity-75" />
          <h3 className="text-sm font-bold text-[#222222]">Sealed DB Registries</h3>
          <p className="font-mono text-xs text-[#22C55E] font-bold">🟢 ONLINE • matched 100%</p>
          <p className="text-[11px] text-[#666666]">Active documents: {documents.length}</p>
        </div>

        <div className="p-5 bg-white border border-[#E5E5E5] rounded-2xl text-center space-y-2 shadow-sm">
          <Cpu className="w-10 h-10 text-[#22C55E] mx-auto opacity-75" />
          <h3 className="text-sm font-bold text-[#222222]">CPU Engine Sandbox</h3>
          <p className="font-mono text-xs text-[#22C55E] font-bold">🟢 14% Load • Idle</p>
          <p className="text-[11px] text-[#666666]">Allocated buffer: 4.8MB memory</p>
        </div>

        <div className="p-5 bg-white border border-[#E5E5E5] rounded-2xl text-center space-y-2 shadow-sm">
          <Key className="w-10 h-10 text-[#F59E0B] mx-auto opacity-75" />
          <h3 className="text-sm font-bold text-[#222222]">Cryptographic Crypt Key</h3>
          <p className="font-mono text-xs text-[#3B82F6] font-bold">AES-GCM-256 Symmetric</p>
          <p className="text-[11px] text-[#666666]">Sealed thumbprints enabled</p>
        </div>
      </div>

      {/* Multipliers & quota settings controllers */}
      <div className="saas-card p-5 bg-white space-y-4 shadow-sm">
        <span className="text-[10px] font-bold text-[#666666] uppercase block border-b border-[#E5E5E5] pb-2">Diagnostic Commands Console</span>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-[#FAFAFA] rounded-xl border border-[#E5E5E5] space-y-2">
            <h4 className="font-bold text-[#222222]">Local Session Reset</h4>
            <p className="text-[#666666] leading-relaxed">Deletes temporary local storage data caches on-the-fly and resets document profiles back to preloaded models.</p>
            <button 
              onClick={() => {
                setDocuments(INITIAL_DOCUMENTS);
                setFolders(INITIAL_FOLDERS);
                setShares(INITIAL_SHARES);
                setActivityLogs(INITIAL_LOGS);
                showToast("Database refreshed back to INITIAL variables success.");
              }}
              className="bg-red-50 hover:bg-red-100 text-[#EF4444] border border-red-200 px-3 py-1.5 rounded font-bold text-xs cursor-pointer transition-colors"
            >
              Wipe Storage &amp; Reset Demo Cache
            </button>
          </div>

          <div className="p-3.5 bg-[#FAFAFA] rounded-xl border border-[#E5E5E5] space-y-2">
            <h4 className="font-bold text-[#222222]">Simulate Sync Jam Alert</h4>
            <p className="text-[#666666] leading-relaxed">Test system robustness in response to failed authentication tokens or offline service states.</p>
            <button 
              onClick={() => {
                setCurrentSyncStatus('Failed');
                setSyncProgress(40);
                logSystemActivity("Sync", "Cloud storage sync failed token mismatch", "Error");
                showToast("🔴 Simulated sync failure triggered.");
              }}
              className="bg-amber-50 hover:bg-amber-100 text-[#F59E0B] border border-amber-200 px-3 py-1.5 rounded font-bold text-xs cursor-pointer transition-colors"
            >
              Simulate Sync Error
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
