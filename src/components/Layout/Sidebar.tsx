import { 
  LayoutDashboard, 
  FolderLock, 
  Brain, 
  Compass, 
  Share2, 
  Activity, 
  Sliders, 
  Settings 
} from 'lucide-react';
import { DocumentItem, FolderItem } from '../../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setActiveFolderId: (id: string | null) => void;
  searchCategory: 'All' | 'Identity' | 'Education' | 'Professional' | 'Financial' | 'Other';
  setSearchCategory: (cat: 'All' | 'Identity' | 'Education' | 'Professional' | 'Financial' | 'Other') => void;
  documents: DocumentItem[];
  folders: FolderItem[];
  user: any;
  syncProgress: number;
  lastSyncTime: string;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  setActiveFolderId,
  searchCategory,
  setSearchCategory,
  documents,
  folders,
  user,
  syncProgress,
  lastSyncTime
}: SidebarProps) {
  return (
    <nav className="w-full md:w-64 bg-white border-r border-[#E5E5E5] p-3 flex flex-col gap-1 md:h-[calc(100vh-64px)] overflow-y-auto no-scrollbar justify-between">
      <div className="space-y-4">
        <span className="text-[10px] uppercase font-bold tracking-widest text-[#666666] px-3">Primary Navigation</span>
        <div className="space-y-1">
          {[
            { id: 'Overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
            { id: 'Vault', label: 'Encrypted Vault', icon: <FolderLock className="w-4 h-4" /> },
            { id: 'Assistant', label: 'Vault AI Assistant', icon: <Brain className="w-4 h-4" /> },
            { id: 'Scholarships', label: 'Scholarship Matcher', icon: <Compass className="w-4 h-4" /> },
            { id: 'QRShare', label: 'QR Sharing Links', icon: <Share2 className="w-4 h-4" /> },
            { id: 'ActivityLogs', label: 'Activity & Logs', icon: <Activity className="w-4 h-4" /> },
            ...(user.email === 'aashishbhumarkar888@gmail.com' ? [
              { id: 'Admin', label: 'Admin Tools', icon: <Sliders className="w-4 h-4" /> }
            ] : []),
            { id: 'Settings', label: 'Vault Settings', icon: <Settings className="w-4 h-4" /> },
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id !== 'Vault') setActiveFolderId(null);
                }}
                className={`w-full text-left font-sans text-xs flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-semibold cursor-pointer ${
                  isActive 
                    ? 'bg-[#222222] text-white shadow-sm' 
                    : 'text-[#666666] hover:bg-[#F5F5F5] hover:text-[#222222]'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === 'Vault' && (
          <div className="mt-6 space-y-2 pt-4 border-t border-[#E5E5E5]">
            <span className="text-[9px] uppercase font-bold tracking-widest text-[#666666] px-3">Smart Folders Directory</span>
            <div className="space-y-1">
              <button 
                onClick={() => setSearchCategory('All')}
                className={`w-full text-left font-sans text-[11px] px-3 py-1.5 rounded transition-all font-semibold flex items-center justify-between cursor-pointer ${
                  searchCategory === 'All' ? 'bg-[#3B82F6]/10 text-[#3B82F6]' : 'text-[#666666] hover:bg-[#F5F5F5]'
                }`}
              >
                <span>📁 Core Vault Documents</span>
                <span className="bg-[#E5E5E5] text-[#222222] px-1.5 py-0.2 text-[9px] rounded font-mono">{documents.length}</span>
              </button>
              {(['Identity', 'Education', 'Professional', 'Financial', 'Other'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setSearchCategory(cat)}
                  className={`w-full text-left font-sans text-[11px] px-3 py-1.5 rounded transition-all font-semibold flex items-center justify-between cursor-pointer ${
                    searchCategory === cat ? 'bg-[#3B82F6]/10 text-[#3B82F6]' : 'text-[#666666] hover:bg-[#F5F5F5]'
                  }`}
                >
                  <span className="truncate">🏷️ Smart Category: {cat}</span>
                  <span className="bg-[#E5E5E5] text-[#222222] px-1.5 py-0.2 text-[9px] rounded font-mono">
                    {documents.filter(d => d.category === cat).length}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-3 bg-[#FAFAFA] rounded-xl border border-[#E5E5E5] text-xs font-sans space-y-2 mt-4">
        <div className="flex justify-between font-bold text-[#222222]">
          <span>Secure Integrity</span>
          <span className="font-mono text-[#3B82F6]">{syncProgress}%</span>
        </div>
        <div className="h-1.5 w-full bg-[#E5E5E5] rounded-full overflow-hidden">
          <div className="h-full bg-[#3B82F6] transition-all duration-300" style={{ width: `${syncProgress}%` }}></div>
        </div>
        <p className="text-[10px] text-[#666666] leading-none">Last sync: {lastSyncTime}</p>
      </div>
    </nav>
  );
}
