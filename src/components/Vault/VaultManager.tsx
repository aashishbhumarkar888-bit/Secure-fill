import { useState, useMemo } from 'react';
import { 
  Search, 
  FolderPlus, 
  CloudUpload, 
  FolderLock, 
  ShieldAlert, 
  FileText, 
  Eye, 
  Trash2, 
  ZoomOut, 
  ZoomIn, 
  RotateCw, 
  Share2, 
  Download, 
  Check 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DocumentItem, FolderItem } from '../../types';

interface VaultManagerProps {
  documents: DocumentItem[];
  folders: FolderItem[];
  activeFolderId: string | null;
  setActiveFolderId: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchCategory: 'All' | 'Identity' | 'Education' | 'Professional' | 'Financial' | 'Other';
  setSearchCategory: (cat: 'All' | 'Identity' | 'Education' | 'Professional' | 'Financial' | 'Other') => void;
  setNewFolderModal: (b: boolean) => void;
  setSelectedParentId: (id: string | null) => void;
  handleFileInputChange: (e: any) => void;
  selectedDoc: DocumentItem | null;
  setSelectedDoc: (doc: DocumentItem | null) => void;
  handleDeleteDocument: (id: string, name: string) => void;
  selectedDocIds: string[];
  setSelectedDocIds: (ids: string[] | ((prev: string[]) => string[])) => void;
  showToast: (msg: string) => void;
  setDocuments: (docs: DocumentItem[] | ((prev: DocumentItem[]) => DocumentItem[])) => void;
  setSelectedDocForQR: (doc: DocumentItem | null) => void;
  setActiveTab: (tab: string) => void;
  triggerDatabaseExportType: (type: 'JSON' | 'CSV' | 'ZIP') => void;
}

export default function VaultManager({
  documents,
  folders,
  activeFolderId,
  setActiveFolderId,
  searchQuery,
  setSearchQuery,
  searchCategory,
  setSearchCategory,
  setNewFolderModal,
  setSelectedParentId,
  handleFileInputChange,
  selectedDoc,
  setSelectedDoc,
  handleDeleteDocument,
  selectedDocIds,
  setSelectedDocIds,
  showToast,
  setDocuments,
  setSelectedDocForQR,
  setActiveTab,
  triggerDatabaseExportType
}: VaultManagerProps) {

  // Local state for interactive preview zoom/rotation
  const [previewZoom, setPreviewZoom] = useState(100);
  const [previewRotation, setPreviewRotation] = useState(0);
  const [quickPreviewDoc, setQuickPreviewDoc] = useState<DocumentItem | null>(null);

  // Compute filtered documents based on current filters
  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      // Filter by folder if any is active
      if (activeFolderId && doc.folderId !== activeFolderId) {
        return false;
      }
      
      // Filter by category
      if (searchCategory !== 'All' && doc.category !== searchCategory) {
        return false;
      }

      const q = searchQuery.toLowerCase();
      if (!q) return true;

      // Smart search includes: Name, Document Type, OCR contents, or institution names
      const matchName = doc.name.toLowerCase().includes(q);
      const matchType = doc.category.toLowerCase().includes(q);
      const matchOcrExtracted = doc.metadata?.documentType?.toLowerCase().includes(q) || false;
      const matchOcrDate = doc.metadata?.extractedDate?.toLowerCase().includes(q) || false;
      const matchInstitution = doc.metadata?.institutionName?.toLowerCase().includes(q) || false;
      const matchSummary = doc.dataSummary.toLowerCase().includes(q);

      return matchName || matchType || matchOcrExtracted || matchOcrDate || matchInstitution || matchSummary;
    });
  }, [documents, searchQuery, searchCategory, activeFolderId]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-[#222222]">Encrypted Vault Manager</h2>
        <p className="text-xs text-[#666666] font-semibold">Classify, browse, zoom preview, and configure parent or nested folder directory structures.</p>
      </div>

      {/* Sub Action controls & folder creators */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center bg-white border border-[#E5E5E5] rounded-xl p-4 shadow-sm">
        
        {/* Search filters inside vault */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666] w-4 h-4" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Name, Expiry, Institution..."
            className="w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg py-2 pl-9 pr-4 text-xs focus:ring-1 focus:ring-[#3B82F6] outline-none text-[#222222]"
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <button 
            onClick={() => {
              setSelectedParentId(null);
              setNewFolderModal(true);
            }}
            className="bg-white border border-[#E5E5E5] hover:bg-[#FAFAFA] font-bold text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors text-[#222222] cursor-pointer"
          >
            <FolderPlus className="w-3.5 h-3.5" /> New Directory Folder
          </button>

          <button 
            type="button"
            onClick={() => {
              const fileEl = document.getElementById('dash-upload-input');
              if (fileEl) fileEl.click();
            }}
            className="bg-[#222222] hover:bg-[#333333] text-white font-bold text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <CloudUpload className="w-3.5 h-3.5 text-white" /> Rapid Upload
          </button>
        </div>

      </div>

      {/* Folder Directory Explorer */}
      <div className="space-y-3">
        <h3 className="font-bold text-xs uppercase text-[#666666] tracking-widest flex items-center gap-1.5">
          <FolderLock className="w-4 h-4" /> Active Directory Folders
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          
          {/* Root Folder Indicator */}
          <div 
            onClick={() => setActiveFolderId(null)}
            className={`p-3.5 rounded-xl border cursor-pointer text-center select-none space-y-1.5 transition-all ${
              activeFolderId === null 
                ? 'bg-[#222222] text-white border-[#222222] shadow' 
                : 'bg-white border-[#E5E5E5] text-[#222222] hover:bg-[#FAFAFA]'
            }`}
          >
            <p className="text-xl">📁</p>
            <span className="font-bold text-xs block truncate">All Documents</span>
            <span className="text-[10px] opacity-75 font-mono">{documents.length} files</span>
          </div>

          {/* Pre-rendered Directory list */}
          {folders.map(fol => {
            const isSelected = activeFolderId === fol.id;
            const folderFilesCount = documents.filter(d => d.folderId === fol.id).length;
            return (
              <div 
                key={fol.id}
                onClick={() => setActiveFolderId(fol.id)}
                className={`p-3.5 rounded-xl border cursor-pointer text-center select-none space-y-1.5 transition-all group ${
                  isSelected 
                    ? 'bg-[#222222] text-white border-[#222222] shadow' 
                    : 'bg-white border-[#E5E5E5] text-[#222222] hover:bg-[#FAFAFA]'
                }`}
              >
                <p className="text-xl">📁</p>
                <span className="font-bold text-xs block truncate" title={fol.name}>{fol.name}</span>
                <span className="text-[10px] opacity-75 font-mono">{folderFilesCount} files</span>
              </div>
            );
          })}

        </div>
      </div>

      {/* Document Main Items Catalog Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Documents Grid (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <h3 className="font-bold text-xs uppercase text-[#666666] tracking-widest">
            Documents inside {activeFolderId === null ? 'All Vaults' : folders.find(f => f.id === activeFolderId)?.name || 'Folder'} ({filteredDocs.length})
          </h3>

          {filteredDocs.length === 0 ? (
            <div className="p-12 text-center bg-white border border-[#E5E5E5] rounded-xl space-y-2 shadow-xs">
              <ShieldAlert className="w-8 h-8 text-[#6B7280] mx-auto opacity-60" />
              <h4 className="text-sm font-bold text-[#222222]">No documents found matching the filter</h4>
              <p className="text-xs text-[#666666]">Upload a new document or click "All Documents" to clear the folder filters.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {(['Identity', 'Education', 'Professional', 'Financial', 'Other'] as const).map(cat => {
                const catDocs = filteredDocs.filter(doc => doc.category === cat);
                if (catDocs.length === 0) return null;
                return (
                  <div key={cat} className="space-y-3 bg-white p-5 rounded-2xl border border-[#E5E5E5] shadow-xs">
                    {/* Group Category Header */}
                    <div className="flex items-center justify-between pb-2.5 border-b border-[#F0F0F0]">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {cat === 'Identity' ? '🆔' :
                           cat === 'Education' ? '🎓' :
                           cat === 'Professional' ? '💼' :
                           cat === 'Financial' ? '💳' : '📁'}
                        </span>
                        <h4 className="font-extrabold text-[#222222] font-sans text-xs uppercase tracking-wider">
                          {cat === 'Identity' ? 'Identity & National ID Records' :
                           cat === 'Education' ? 'Educational Credentials' :
                           cat === 'Professional' ? 'Professional Portfolio & Resumes' :
                           cat === 'Financial' ? 'Financial Statements' : 'Unsorted Files'}
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-[#3B82F6] bg-[#3B82F6]/5 border border-[#3B82F6]/15 px-2 py-0.5 rounded-full">
                        {catDocs.length} {catDocs.length === 1 ? 'file' : 'files'}
                      </span>
                    </div>

                    {/* Documents list inside category */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {catDocs.map(doc => {
                        const isExpiring = doc.expiresInDays && doc.expiresInDays <= 45;
                        return (
                          <div 
                            key={doc.id}
                            onClick={() => setSelectedDoc(doc)}
                            className={`p-4 rounded-xl bg-[#FAFAFA]/70 border transition-all cursor-pointer hover:bg-white hover:border-[#3B82F6] hover:shadow-md flex flex-col justify-between gap-4 ${
                              selectedDoc?.id === doc.id ? 'border-2 border-[#3B82F6] shadow-sm bg-white' : 'border-[#E5E5E5]'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2.5 min-w-0">
                                {/* Bulk checklist selector */}
                                <input 
                                  type="checkbox"
                                  checked={selectedDocIds.includes(doc.id)}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedDocIds(prev => [...prev, doc.id]);
                                    } else {
                                      setSelectedDocIds(prev => prev.filter(id => id !== doc.id));
                                    }
                                  }}
                                  className="w-4 h-4 rounded border-[#E5E5E5] text-[#3B82F6] cursor-pointer"
                                />
                                <div className="w-10 h-10 rounded-lg bg-white border border-[#E5E5E5] flex items-center justify-center text-[#222222] shrink-0 overflow-hidden">
                                  {doc.imageUrl ? (
                                    <img 
                                      src={doc.imageUrl} 
                                      alt={doc.name} 
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <FileText className="w-5 h-5 text-[#3B82F6]" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <h5 className="text-xs font-bold text-[#222222] truncate block" title={doc.name}>{doc.name}</h5>
                                  <p className="text-[10px] text-[#666666] font-mono mt-0.5 truncate">{doc.dataSummary}</p>
                                </div>
                              </div>

                              <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold shrink-0 ${
                                doc.category === 'Identity' ? 'bg-blue-100 text-blue-700' :
                                doc.category === 'Education' ? 'bg-green-100 text-green-700' :
                                doc.category === 'Professional' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                              }`}>
                                {doc.category}
                              </span>
                            </div>

                            <div className="border-t border-[#E1E1E1]/60 pt-3 flex justify-between items-center text-[11px] text-[#666666]">
                              <span className="font-mono text-[10px]">{(doc.sizeBytes / (1024 * 1024)).toFixed(2)} MB</span>
                              <div className="flex items-center gap-1.5">
                                {isExpiring && (
                                  <span className="text-[10px] text-[#EF4444] bg-red-100 font-bold px-1.5 py-0.2 rounded font-mono">
                                    ⚠️ {doc.expiresInDays}d Expiry
                                  </span>
                                )}
                                
                                {doc.secureShare && (
                                  <span className="text-[10px] text-[#3B82F6] bg-blue-100 font-bold px-1.5 py-0.2 rounded font-mono">
                                    QR Shared
                                  </span>
                                )}

                                {/* Eye Quick Preview trigger */}
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setQuickPreviewDoc(doc);
                                    setPreviewZoom(100);
                                    setPreviewRotation(0);
                                  }}
                                  className="p-1 hover:text-[#3B82F6] rounded text-[#666666] flex items-center justify-center cursor-pointer"
                                  title="A.I. Smart Quick Preview"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>

                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteDocument(doc.id, doc.name);
                                  }}
                                  className="p-1 hover:text-[#EF4444] rounded text-[#666666] cursor-pointer"
                                  title="Revoke &amp; Delete File"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Floating bulk actionable tracker bar */}
          {selectedDocIds.length > 0 && (
            <div className="bg-[#222222] text-white p-4 rounded-xl border border-white/5 shadow-2xl flex items-center justify-between text-xs animate-bounce">
              <span className="font-bold flex items-center gap-1">
                <Check className="w-4 h-4 text-green-400" />
                {selectedDocIds.length} Vault Items Selected
              </span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    showToast(`Sealed export zipped matching data: ${selectedDocIds.length} files.`);
                    setSelectedDocIds([]);
                  }}
                  className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold px-3 py-1.5 rounded text-[10px] uppercase tracking-wider cursor-pointer"
                >
                  Export Multi
                </button>
                <button 
                  onClick={() => {
                    setDocuments(prev => prev.filter(d => !selectedDocIds.includes(d.id)));
                    setSelectedDocIds([]);
                    showToast("Selected materials removed securely.");
                  }}
                  className="bg-[#EF4444] hover:bg-red-600 text-white font-bold px-3 py-1.5 rounded text-[10px] uppercase tracking-wider cursor-pointer"
                >
                  Mass Delete
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Real-Time Document Viewer & OCR Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="font-bold text-xs uppercase text-[#666666] tracking-widest">Document Viewer &amp; Metadata</h3>
          
          {selectedDoc ? (
            <div className="saas-card p-5 bg-white space-y-5 shadow-sm">
              
              {/* Virtual Preview stage */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-[#222222]">
                  <span className="truncate max-w-[150px]">{selectedDoc.name}</span>
                  <div className="flex gap-1 bg-[#FAFAFA] border border-[#E5E5E5] rounded p-0.5">
                    <button onClick={() => setPreviewZoom(z => Math.max(50, z - 25))} className="p-1 hover:bg-[#E5E5E5] rounded cursor-pointer"><ZoomOut className="w-3 h-3 text-[#222222]" /></button>
                    <button onClick={() => setPreviewZoom(z => Math.min(200, z + 25))} className="p-1 hover:bg-[#E5E5E5] rounded cursor-pointer"><ZoomIn className="w-3 h-3 text-[#222222]" /></button>
                    <button onClick={() => setPreviewRotation(r => (r + 90) % 360)} className="p-1 hover:bg-[#E5E5E5] rounded cursor-pointer"><RotateCw className="w-3 h-3 text-[#222222]" /></button>
                  </div>
                </div>

                {/* Render preview stage */}
                <div className="h-44 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg overflow-hidden flex items-center justify-center relative bg-[radial-gradient(#E1E1E1_1px,transparent_1px)] bg-[size:16px_16px]">
                  <div 
                    className="text-center p-4 transition-transform duration-200 w-full h-full flex items-center justify-center"
                    style={{ 
                      transform: `scale(${previewZoom / 100}) rotate(${previewRotation}deg)`
                    }}
                  >
                    {selectedDoc.imageUrl ? (
                      selectedDoc.name.toLowerCase().endsWith('.pdf') ? (
                        <iframe 
                          src={selectedDoc.imageUrl} 
                          title={selectedDoc.name}
                          className="w-full h-full border-0 pointer-events-none"
                        />
                      ) : (
                        <img 
                          src={selectedDoc.imageUrl} 
                          alt={selectedDoc.name} 
                          className="max-h-full max-w-full object-contain rounded shadow-sm mx-auto"
                          referrerPolicy="no-referrer"
                        />
                      )
                    ) : (
                      <div className="text-center">
                        <FileText className="w-12 h-12 text-[#3B82F6] mx-auto mb-2" />
                        <span className="text-[10px] font-mono text-[#666666] block uppercase tracking-wider">PREVIEW SCAN</span>
                        <p className="text-[10px] text-[#222222] font-black max-w-[180px] truncate">{selectedDoc.filename}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur-xs border border-[#E5E5E5] p-1.5 rounded text-[10px] text-[#222222] flex justify-between font-mono">
                    <span>Format: {selectedDoc.filename.split('.').pop()?.toUpperCase()}</span>
                    <span>Zoom: {previewZoom}%</span>
                  </div>
                </div>
              </div>

              {/* OCR Metadata fields list */}
              <div className="space-y-3 pt-3 border-t border-[#E5E5E5]">
                <span className="text-[10px] uppercase font-bold text-[#666666] tracking-widest block">OCR Attribute Extractor Metadata</span>
                
                <div className="bg-[#FAFAFA] border border-[#E5E5E5] p-3 rounded-xl space-y-2.5 text-xs text-[#222222]">
                  <div className="flex justify-between">
                    <span className="text-[#666666]">Validated Owner</span>
                    <span className="font-bold">{selectedDoc.metadata?.extractedName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#666666]">Document Class</span>
                    <span className="font-bold">{selectedDoc.metadata?.documentType || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#666666]">Issued Institution</span>
                    <span className="font-bold">{selectedDoc.metadata?.institutionName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#666666]">Extracted Date</span>
                    <span className="font-mono font-semibold">{selectedDoc.metadata?.extractedDate || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#666666]">Expiry Constraint</span>
                    <span className="font-mono font-semibold text-[#EF4444]">{selectedDoc.metadata?.expiryDate || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* File Action Controller */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button 
                  onClick={() => {
                    setSelectedDocForQR(selectedDoc);
                    setActiveTab('QRShare');
                  }}
                  className="bg-[#222222] text-white hover:bg-[#333333] font-bold text-xs p-2.5 rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-white" /> Create QR Link
                </button>

                <button 
                  onClick={() => triggerDatabaseExportType('CSV')}
                  className="bg-[#FAFAFA] hover:bg-[#F5F5F5] text-[#222222] border border-[#E5E5E5] font-bold text-xs p-2.5 rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>

            </div>
          ) : (
            <div className="p-8 text-center bg-white border border-[#E5E5E5] rounded-xl text-xs text-[#666666] shadow-sm">
              <p>No document selected.</p>
              <p className="mt-1 font-bold text-[#222222]">Click any vault card to preview metadata and OCR scans.</p>
            </div>
          )}
        </div>

      </div>

      {/* Dynamic Animated Quick Preview Overlay */}
      <AnimatePresence>
        {quickPreviewDoc && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#222222]/80 backdrop-blur-sm" onClick={() => setQuickPreviewDoc(null)}></div>
            <motion.div 
              initial={{ scale: 0.95, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="relative w-full max-w-4xl bg-white border border-[#E5E5E5] rounded-2xl shadow-2xl z-20 overflow-hidden grid grid-cols-1 md:grid-cols-12 h-[80vh] text-left"
            >
              <div className="md:col-span-8 bg-[#FAFAFA] flex flex-col justify-between p-4 relative border-r border-[#E5E5E5]">
                <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-2 text-xs">
                  <span className="font-bold text-[#222222] font-mono">{quickPreviewDoc.filename}</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setPreviewZoom(prev => Math.max(50, prev - 20))} className="p-1.5 rounded border border-[#E5E5E5] bg-white text-[#222222] hover:bg-[#FAFAFA] cursor-pointer" title="Zoom Out"><ZoomOut className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setPreviewZoom(prev => Math.min(200, prev + 20))} className="p-1.5 rounded border border-[#E5E5E5] bg-white text-[#222222] hover:bg-[#FAFAFA] cursor-pointer" title="Zoom In"><ZoomIn className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setPreviewRotation(prev => (prev + 90) % 360)} className="p-1.5 rounded border border-[#E5E5E5] bg-white text-[#222222] hover:bg-[#FAFAFA] cursor-pointer" title="Rotate"><RotateCw className="w-3.5 h-3.5" /></button>
                  </div>
                </div>

                <div className="flex-1 flex items-center justify-center p-6 overflow-hidden">
                  <div 
                    className="transition-transform duration-200 w-full h-full flex items-center justify-center"
                    style={{ transform: `scale(${previewZoom / 100}) rotate(${previewRotation}deg)` }}
                  >
                    {quickPreviewDoc.imageUrl ? (
                      quickPreviewDoc.name.toLowerCase().endsWith('.pdf') ? (
                        <iframe 
                          src={quickPreviewDoc.imageUrl} 
                          title={quickPreviewDoc.name}
                          className="w-full h-full border-0 min-h-[50vh]"
                        />
                      ) : (
                        <img 
                          src={quickPreviewDoc.imageUrl} 
                          alt={quickPreviewDoc.name} 
                          className="max-h-[60vh] max-w-full object-contain rounded shadow-lg"
                          referrerPolicy="no-referrer"
                        />
                      )
                    ) : (
                      <div className="text-center p-6">
                        <span className="text-5xl">📄</span>
                        <p className="mt-2 text-xs font-bold text-[#222222]">{quickPreviewDoc.name}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="absolute bottom-4 left-4 right-4 bg-white/95 border border-[#E5E5E5] p-2 rounded-xl text-[10px] font-mono flex justify-between text-[#222222]">
                  <span>Class: {quickPreviewDoc.category}</span>
                  <span>Zoom: {previewZoom}%</span>
                  <span>Rotate: {previewRotation}°</span>
                </div>
              </div>

              {/* OCR Details Panel */}
              <div className="md:col-span-4 p-5 flex flex-col justify-between overflow-y-auto no-scrollbar bg-white">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-extrabold text-[#222222] uppercase tracking-wider">A.I. OCR Transcript</h3>
                    <button onClick={() => setQuickPreviewDoc(null)} className="text-[#666666] hover:text-black font-bold text-xs cursor-pointer">✕ Close</button>
                  </div>

                  <div className="bg-[#FAFAFA] border border-[#E5E5E5] p-3.5 rounded-xl space-y-3 text-xs">
                    <div>
                      <span className="text-[#666666] font-bold block text-[9px] uppercase tracking-widest">Extracted Name</span>
                      <span className="font-extrabold text-[#222222]">{quickPreviewDoc.metadata?.extractedName || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[#666666] font-bold block text-[9px] uppercase tracking-widest">Document Class</span>
                      <span className="font-extrabold text-[#222222]">{quickPreviewDoc.metadata?.documentType || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[#666666] font-bold block text-[9px] uppercase tracking-widest">Issued Authority</span>
                      <span className="font-extrabold text-[#222222]">{quickPreviewDoc.metadata?.institutionName || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[#666666] font-bold block text-[9px] uppercase tracking-widest">Issue Date</span>
                      <span className="font-mono font-semibold text-[#222222]">{quickPreviewDoc.metadata?.extractedDate || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[#666666] font-bold block text-[9px] uppercase tracking-widest">Expiration Constraint</span>
                      <span className="font-mono font-semibold text-[#EF4444]">{quickPreviewDoc.metadata?.expiryDate || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[#666666] font-bold block text-[9px] uppercase tracking-widest">Document Number</span>
                      <span className="font-mono font-bold text-[#1a73e8]">{quickPreviewDoc.metadata?.documentNumber || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <span className="text-[#666666] font-bold text-[9px] uppercase tracking-widest">OCR Summary Context</span>
                    <p className="bg-[#EBF3FE] border border-[#3B82F6]/20 p-3 rounded-xl text-[#222222] leading-relaxed font-semibold">
                      {quickPreviewDoc.dataSummary}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E5E5E5] grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => {
                      setSelectedDocForQR(quickPreviewDoc);
                      setQuickPreviewDoc(null);
                      setActiveTab('QRShare');
                    }}
                    className="w-full bg-[#222222] text-white hover:bg-[#333333] font-bold text-xs p-2.5 rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                  >
                    Create QR Code
                  </button>
                  <button 
                    onClick={() => triggerDatabaseExportType('CSV')}
                    className="w-full bg-[#FAFAFA] border border-[#E5E5E5] hover:bg-[#F5F5F5] font-bold text-xs p-2.5 rounded-lg flex items-center justify-center gap-1 cursor-pointer text-[#222222]"
                  >
                    Download CSV
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
