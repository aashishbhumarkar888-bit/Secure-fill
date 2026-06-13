import { useMemo } from 'react';
import { 
  Brain, 
  Check, 
  AlertTriangle, 
  Activity, 
  CloudUpload, 
  RefreshCw, 
  Download, 
  CalendarDays
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { DocumentItem, ShareConfig } from '../../types';

interface OverviewProps {
  documents: DocumentItem[];
  user: any;
  shares: ShareConfig[];
  uploadQueue: any[];
  isDragging: boolean;
  handleDragOver: (e: any) => void;
  handleDragLeave: () => void;
  handleDrop: (e: any) => void;
  handleFileInputChange: (e: any) => void;
  setActiveTab: (tab: string) => void;
  setSearchCategory: (cat: 'All' | 'Identity' | 'Education' | 'Professional' | 'Financial' | 'Other') => void;
  triggerManualCloudSync: () => void;
  triggerDatabaseExportType: (type: 'JSON' | 'CSV' | 'ZIP') => void;
  formattedStorageUsage: any;
  syncProgress: number;
  lastSyncTime: string;
  categoryChartData: any[];
  uploadActivityChartData: any[];
  assistantLogs: any[];
  aiAssistantQuery: string;
  setAiAssistantQuery: (q: string) => void;
  handleAiAssistantSubmit: (e?: any) => void;
  isThinking: boolean;
}

export default function Overview({
  documents,
  user,
  shares,
  uploadQueue,
  isDragging,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleFileInputChange,
  setActiveTab,
  setSearchCategory,
  triggerManualCloudSync,
  triggerDatabaseExportType,
  formattedStorageUsage,
  categoryChartData,
  uploadActivityChartData,
  assistantLogs,
  aiAssistantQuery,
  setAiAssistantQuery,
  handleAiAssistantSubmit,
  isThinking
}: OverviewProps) {

  const alertDocuments = useMemo(() => {
    return documents.filter(d => d.expiresInDays && d.expiresInDays <= 45);
  }, [documents]);

  const duplicateCertificatesCount = useMemo(() => {
    return documents.filter(d => d.name.toLowerCase().includes('duplicate') || d.name.includes('_V')).length;
  }, [documents]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E5E5E5] pb-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-[#222222]">Identity Command Center</h2>
          <p className="text-xs text-[#666666] font-semibold font-mono">Active Sandbox: {user.name} • {user.address ? user.address.split(',').slice(-3, -1).join(',').trim() : 'Bhopal, MP'}</p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={triggerManualCloudSync}
            className="bg-white border border-[#E5E5E5] hover:bg-[#FAFAFA] font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors text-[#222222] cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Re-sync Identity Registers
          </button>

          <button 
            onClick={() => triggerDatabaseExportType('ZIP')}
            className="bg-[#222222] hover:bg-[#333333] text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-white" /> Export ZIP Package
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => {
            setActiveTab('Vault');
            setSearchCategory('All');
          }}
          className="saas-card rounded-xl p-5 flex flex-col justify-between hover:border-[#3B82F6]/60 transition-all cursor-pointer"
        >
          <span className="text-[10px] uppercase font-bold text-[#666666] tracking-wider">Total Documents</span>
          <div className="my-2.5">
            <p className="text-2xl font-black text-[#222222]">{documents.length} Documents</p>
            <p className="text-[10px] text-[#22C55E] mt-0.5 font-bold">✓ Structured Entity Mappings</p>
          </div>
          <span className="text-[10px] text-[#666666] font-mono">Synced locally in sandbox</span>
        </div>

        <div className="saas-card rounded-xl p-5 flex flex-col justify-between hover:border-[#3B82F6]/60 transition-all cursor-pointer">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-bold text-[#666666] tracking-wider">Storage Usage</span>
            <span className="text-[10px] bg-[#3B82F6]/10 text-[#3B82F6] font-bold px-1.5 py-0.2 rounded">SaaS Normal</span>
          </div>
          <div className="my-2.5 space-y-1.5">
            <p className="text-2xl font-black text-[#222222]">{formattedStorageUsage.fractionString}</p>
            <div className="h-2 w-full bg-[#E5E5E5] rounded-full overflow-hidden">
              <div className="h-full bg-[#3B82F6]" style={{ width: `${formattedStorageUsage.rawPercent}%` }}></div>
            </div>
          </div>
          <span className="text-[10px] text-[#666666] font-mono">Limit constraint: 10GB</span>
        </div>

        <div 
          onClick={() => setActiveTab('QRShare')}
          className="saas-card rounded-xl p-5 flex flex-col justify-between hover:border-[#3B82F6]/60 transition-all cursor-pointer"
        >
          <span className="text-[10px] uppercase font-bold text-[#666666] tracking-wider">Shared Files</span>
          <div className="my-2.5">
            <p className="text-2xl font-black text-[#222222]">{shares.reduce((acc, s) => acc + s.scanCount, 0)} Scans</p>
            <p className="text-[10px] text-[#F59E0B] mt-0.5 font-bold">● {shares.length} Active Shared QRs</p>
          </div>
          <span className="text-[10px] text-[#666666] font-mono">Dynamic temporary QR codes</span>
        </div>

        <div 
          onClick={() => setActiveTab('ActivityLogs')}
          className="saas-card rounded-xl p-5 flex flex-col justify-between hover:border-[#3B82F6]/60 transition-all cursor-pointer"
        >
          <span className="text-[10px] uppercase font-bold text-[#666666] tracking-wider">Recent Activity</span>
          <div className="my-2.5">
            <p className="text-sm font-bold text-[#222222] truncate">
              {documents.length > 0 ? `Last file uploaded` : 'No uploads yet'}
            </p>
            <p className="text-[10px] text-[#666666] font-semibold font-mono mt-1 truncate">
              {documents.length > 0 ? documents[0].name : 'N/A'}
            </p>
          </div>
          <span className="text-[10px] text-[#666666] font-mono">Local host audited</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4">
          <div className="saas-card p-5 bg-white space-y-4">
            <h4 className="font-bold text-xs uppercase text-[#666666] tracking-widest flex items-center gap-2">
              <Brain className="w-4 h-4 text-[#3B82F6]" /> AI Insights Panel
            </h4>
            <div className="space-y-3 text-xs leading-relaxed">
              <div className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#22C55E] flex-shrink-0 mt-0.5 bg-[#22C55E]/15 rounded-full p-0.5" />
                <p className="text-[#222222] font-semibold">You have {documents.filter(d => d.category === 'Education').length} educational credentials mapped.</p>
              </div>
              
              {alertDocuments.length > 0 ? (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-[#EF4444] flex-shrink-0 mt-0.5" />
                  <p className="text-[#222222] font-semibold">{alertDocuments.length} document(s) expiring soon.</p>
                </div>
              ) : (
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#22C55E] flex-shrink-0 mt-0.5 bg-[#22C55E]/15 rounded-full p-0.5" />
                  <p className="text-[#222222] font-semibold">All documents are currently valid.</p>
                </div>
              )}

              {duplicateCertificatesCount > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-[#F59E0B] flex-shrink-0 mt-0.5" />
                  <p className="text-[#222222] font-semibold">Detected {duplicateCertificatesCount} duplicate document name tags.</p>
                </div>
              )}
            </div>
          </div>

          <div className="saas-card p-5 bg-white border border-[#E5E5E5] space-y-4">
            <h4 className="font-bold text-xs uppercase text-[#666666] tracking-widest flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-[#EF4444]" /> Expiration Calendar
            </h4>
            
            <div className="grid grid-cols-7 gap-1 text-[10px] font-mono text-center pt-2 border-t border-[#E5E5E5]">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, ix) => (
                <span key={ix} className="font-bold text-[#666666]">{day}</span>
              ))}
              {Array.from({ length: 28 }).map((_, i) => {
                const dayNum = i + 1;
                const isAlert = dayNum === 15 || dayNum === 22;
                return (
                  <span 
                    key={i} 
                    className={`p-1 rounded-md font-bold ${
                      isAlert 
                        ? 'bg-[#EF4444] text-white animate-pulse' 
                        : 'hover:bg-[#FAFAFA] text-[#666666]'
                    }`}
                    title={isAlert ? "Document Expiration warning mark!" : `Day ${dayNum}`}
                  >
                    {dayNum}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-4">
          <div className="saas-card p-5 bg-white space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-xs uppercase text-[#666666] tracking-widest flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#3B82F6]" /> Dynamic Storage &amp; Upload Analytics
              </h4>
              <span className="text-xs text-[#666666] bg-[#F5F5F5] px-2 py-0.5 rounded font-mono">Live Logs Graph</span>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={uploadActivityChartData}>
                  <defs>
                    <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                  <XAxis dataKey="name" stroke="#666666" fontSize={11} />
                  <YAxis stroke="#666666" fontSize={11} />
                  <Tooltip formatter={(value) => [`${value} files`, 'Total Syncs']} />
                  <Area type="monotone" dataKey="uploads" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorUploads)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 border-t border-[#E5E5E5] text-xs">
              {categoryChartData.map(cc => (
                <div key={cc.name} className="p-2.5 bg-[#FAFAFA] rounded-lg border border-[#E5E5E5] text-center space-y-1">
                  <span className="text-[10px] font-bold text-[#666666] uppercase block truncate">{cc.name}</span>
                  <span className="text-lg font-black text-[#222222] block">{cc.value} files</span>
                </div>
              ))}
            </div>
          </div>

          <div className="saas-card p-5 bg-[#FAFAFA] border border-[#E5E5E5] space-y-4">
            <h4 className="font-bold text-xs uppercase text-[#666666] tracking-widest flex items-center gap-2">
              <Brain className="w-4 h-4 text-[#3B82F6]" /> Decrypt AI Assistant Engine
            </h4>
            <div className="space-y-2 bg-white rounded-xl border border-[#E5E5E5] p-4 max-h-48 overflow-y-auto no-scrollbar">
              {assistantLogs.map((item, idx) => (
                <div key={idx} className={`p-2.5 rounded-lg text-xs leading-relaxed whitespace-pre-line ${
                  item.sender === 'ai' ? 'bg-[#FAFAFA] border border-[#E5E5E5] text-[#222222]' : 'bg-[#3B82F6]/15 text-[#222222] font-semibold text-right'
                }`}>
                  <p className="font-mono text-[9px] text-[#666666] mb-0.5">{item.sender === 'ai' ? '🤖 SECUREFILL AI' : '👤 USER'}</p>
                  {item.text}
                </div>
              ))}
              {isThinking && (
                <div className="text-xs text-[#666666] italic animate-pulse">Assistant is scanning database...</div>
              )}
            </div>

            <form onSubmit={handleAiAssistantSubmit} className="flex gap-2">
              <input 
                type="text" 
                value={aiAssistantQuery}
                onChange={(e) => setAiAssistantQuery(e.target.value)}
                placeholder="Type 'find my passport' or 'missing documents'..."
                className="flex-1 bg-white border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-[#3B82F6] outline-none text-[#222222]"
              />
              <button type="submit" className="bg-[#222222] text-white px-4 py-2 rounded-lg text-xs font-bold uppercase cursor-pointer">
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-xs uppercase text-[#666666] tracking-widest">Extremely Fast Upload Sandbox</h3>
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`p-10 border-2 border-dashed rounded-2xl text-center bg-white cursor-pointer transition-all ${
            isDragging ? 'border-[#3B82F6] bg-[#3B82F6]/5' : 'border-[#E5E5E5] hover:border-[#3B82F6]'
          }`}
        >
          <input 
            type="file" 
            id="dash-upload-input"
            multiple
            onChange={handleFileInputChange}
            className="hidden"
          />
          <label htmlFor="dash-upload-input" className="cursor-pointer space-y-2">
            <CloudUpload className="w-12 h-12 text-[#666666] mx-auto opacity-75 hover:scale-105 transition-transform" />
            <p className="text-sm font-bold text-[#222222]">Drag &amp; Drop or Select Local Credentials</p>
            <p className="text-xs text-[#666666]">Classifies images/documents immediately using OCR extractors under 1s.</p>
          </label>
        </div>

        {uploadQueue.length > 0 && (
          <div className="bg-white border border-[#E5E5E5] p-4 rounded-xl space-y-3.5 animate-pulse">
            <span className="text-[10px] font-bold text-[#666666] uppercase block">Background Upload Queue</span>
            {uploadQueue.map(item => (
              <div key={item.id} className="space-y-1 text-xs">
                <div className="flex justify-between font-semibold text-[#222222]">
                  <span className="truncate max-w-[200px]">📁 {item.filename}</span>
                  <span>{item.progress}% • Remaining: {item.remainingSeconds}s ({item.speedKb} KB/s)</span>
                </div>
                <div className="h-2 w-full bg-[#E5E5E5] rounded-full overflow-hidden">
                  <div className="h-full bg-[#22C55E] transition-all" style={{ width: `${item.progress}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
