import { useState, useEffect, useMemo, useRef, DragEvent, ChangeEvent, FormEvent } from 'react';
import { 
  Lock, 
  Brain, 
  Home as HomeIcon, 
  FolderLock, 
  CloudUpload, 
  Sparkles, 
  User, 
  Check, 
  HelpCircle,
  FileCheck,
  ShieldCheck,
  Shield,
  Fingerprint,
  Sliders,
  MoreVertical,
  SlidersHorizontal,
  LogOut,
  Power,
  RotateCcw,
  Search,
  Plus,
  Trash2,
  Share2,
  Activity,
  Download,
  Eye,
  EyeOff,
  AlertCircle,
  FolderPlus,
  ArrowRight,
  RefreshCw,
  Bell,
  X,
  FileText,
  Printer,
  Compass,
  LayoutDashboard,
  ShieldAlert,
  ChevronRight,
  ChevronDown,
  Settings,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Globe,
  Database,
  Cpu,
  Key,
  CalendarDays
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

import { DocumentItem, FolderItem, ShareConfig, ActivityLogItem, AppNotification, OpportunityItem } from './types';
import { 
  INITIAL_USER, 
  INITIAL_DOCUMENTS, 
  INITIAL_FOLDERS, 
  INITIAL_SHARES, 
  INITIAL_LOGS, 
  INITIAL_NOTIFICATIONS, 
  OPPORTUNITIES 
} from './data';

export default function App() {
  // Authentication & Profile state
  const [user, setUser] = useState(INITIAL_USER);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Default false, allowing gorgeous Google Login selection flow
  const [biometricSetupModal, setBiometricSetupModal] = useState(false);
  const [biometricPromptActive, setBiometricPromptActive] = useState(false);
  const [showGoogleLoginChooser, setShowGoogleLoginChooser] = useState(false);
  const [googleChooserStep, setGoogleChooserStep] = useState<'list' | 'custom' | 'password'>('list'); 
  const [selectedAccount, setSelectedAccount] = useState<{ email: string, name: string, photo: string }>({
    email: 'aashishbhumarkar888@gmail.com',
    name: 'Ashish Ghumarkar',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'
  });
  const [accountPassword, setAccountPassword] = useState('');
  const [showPasswordRaw, setShowPasswordRaw] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [authenticatingGoogle, setAuthenticatingGoogle] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Vault Settings Features Toggles
  const [unlockQrCodeEnabled, setUnlockQrCodeEnabled] = useState(true);
  const [scholarshipMatchEnabled, setScholarshipMatchEnabled] = useState(true);

  // Storage Stats (Computed dynamically or simulated)
  const [currentSyncStatus, setCurrentSyncStatus] = useState<'Synced' | 'Syncing' | 'Failed' | 'Pending'>('Synced');
  const [syncProgress, setSyncProgress] = useState(100);
  const [lastSyncTime, setLastSyncTime] = useState("Just now");

  // Core Data sets with State
  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_DOCUMENTS);
  const [folders, setFolders] = useState<FolderItem[]>(INITIAL_FOLDERS);
  const [shares, setShares] = useState<ShareConfig[]>(INITIAL_SHARES);
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>(INITIAL_LOGS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  // Active view management
  // 'Overview' | 'Vault' | 'Scholarships' | 'QRShare' | 'ActivityLogs' | 'Admin' | 'Settings'
  const [activeTab, setActiveTab] = useState<string>('Overview');

  // Interactive UI controllers for documents detail/preview views
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [previewZoom, setPreviewZoom] = useState(100);
  const [previewRotation, setPreviewRotation] = useState(0);

  // Quick Preview modal animated overlay
  const [quickPreviewDoc, setQuickPreviewDoc] = useState<DocumentItem | null>(null);

  // Bulk File Actions state
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);

  // Password Generator settings
  const [passwordGeneratorLength, setPasswordGeneratorLength] = useState(12);
  const [passwordGeneratorSymbols, setPasswordGeneratorSymbols] = useState(true);
  const [passwordGeneratorNumbers, setPasswordGeneratorNumbers] = useState(true);
  const [passwordGeneratorCapitals, setPasswordGeneratorCapitals] = useState(true);

  // Scholarship dynamic tracking state
  const [activeScholarship, setActiveScholarship] = useState<OpportunityItem | null>(null);
  const [appliedScholarships, setAppliedScholarships] = useState<string[]>([]);
  const [scholarshipAiQuery, setScholarshipAiQuery] = useState("");
  const [scholarshipAiResponse, setScholarshipAiResponse] = useState("");
  const [isScholarshipAiThinking, setIsScholarshipAiThinking] = useState(false);

  // Directory Management (Nested folders simulation)
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [newFolderModal, setNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);

  // Fast Upload System State
  const [isDragging, setIsDragging] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<{
    id: string;
    filename: string;
    progress: number;
    remainingSeconds: number;
    speedKb: number;
    isProcessed: boolean;
  }[]>([]);

  // QR creation assistant flow variables
  const [selectedDocForQR, setSelectedDocForQR] = useState<DocumentItem | null>(null);
  const [qrOptions, setQrOptions] = useState({
    viewOnly: true,
    downloadAllowed: true,
    passwordProtected: false,
    password: '',
    expiryDate: '2026-06-30'
  });
  const [createdQR, setCreatedQR] = useState<ShareConfig | null>(null);

  // AI Radar custom input and states
  const [aiAssistantQuery, setAiAssistantQuery] = useState("");
  const [assistantLogs, setAssistantLogs] = useState<any[]>([
    {
      sender: 'ai',
      text: "👋 Welcome Ashish! I am your SECUREFILL digital agent. Ask me about your vault, missing credentials, search details from OCR scans, or trigger immediate scholarship mapping sequences.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isThinking, setIsThinking] = useState(false);

  // Toast Alerts system
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Load session from JWT Token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get('token');
      const authError = urlParams.get('auth_error');

      if (authError) {
        showToast(`❌ Authentication failed: ${decodeURIComponent(authError)}`);
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      let activeToken = tokenFromUrl;

      if (tokenFromUrl) {
        localStorage.setItem('securefill_auth_token', tokenFromUrl);
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        activeToken = localStorage.getItem('securefill_auth_token');
      }

      if (activeToken) {
        try {
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${activeToken}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            setIsLoggedIn(true);
            logSystemActivity("Login", `JWT session restored successfully for ${data.user.email}`, "Success");
          } else {
            localStorage.removeItem('securefill_auth_token');
          }
        } catch (error) {
          console.error("Failed to restore JWT auth session:", error);
        }
      }
    };

    checkAuth();
  }, []);

  // Trigger manual simulation of Google Login / Logout
  const handleLogout = () => {
    localStorage.removeItem('securefill_auth_token');
    setIsLoggedIn(false);
    setUser(INITIAL_USER);
    setAccountPassword('');
    setShowPasswordRaw(false);
    setCustomEmail('');
    setCustomName('');
    setSelectedAccount({
      email: 'aashishbhumarkar888@gmail.com',
      name: 'Ashish Ghumarkar',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'
    });
    setGoogleChooserStep('list');
    setShowGoogleLoginChooser(false);
    setShowProfileDropdown(false);
    setActiveTab('Dashboard'); // Redirect to safety
    logSystemActivity("Logout", "User logged out securely, cleared all session states and cached credentials", "Success");
    showToast("Access revoked. You have logged out of SECUREFILL.");
  };

  const handleToggleLogin = async () => {
    if (isLoggedIn) {
      handleLogout();
    } else {
      setAuthenticatingGoogle(true);
      try {
        const response = await fetch('/api/auth/google-status');
        const data = await response.json();
        setAuthenticatingGoogle(false);
        if (data.configured) {
          window.location.href = '/api/auth/google';
        } else {
          setShowGoogleLoginChooser(true);
        }
      } catch (err) {
        console.error("Failed to check Google OAuth configuration status:", err);
        setAuthenticatingGoogle(false);
        setShowGoogleLoginChooser(true);
      }
    }
  };

  const handleGoogleSelect = async (accountEmail: string, accountName: string, accountPhoto?: string) => {
    setAuthenticatingGoogle(true);
    setCurrentSyncStatus('Syncing');
    setSyncProgress(15);
    
    try {
      const response = await fetch('/api/auth/mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: accountEmail, name: accountName, photo: accountPhoto })
      });

      if (!response.ok) {
        throw new Error("Mock authentication failed on server.");
      }

      const data = await response.json();
      const { token, user: backendUser } = data;

      localStorage.setItem('securefill_auth_token', token);
      setSyncProgress(70);

      setTimeout(() => {
        setSyncProgress(100);
        setAuthenticatingGoogle(false);
        setShowGoogleLoginChooser(false);
        setGoogleChooserStep('list');
        
        setUser(backendUser);
        setIsLoggedIn(true);
        setCurrentSyncStatus('Synced');
        setLastSyncTime("Just now");
        
        if (backendUser.email !== 'aashishbhumarkar888@gmail.com' && activeTab === 'Admin') {
          setActiveTab('Overview');
        }
        
        logSystemActivity("Login", `Google Sign-In authorized via account ${backendUser.email}`, "Success");
        showToast(`Welcome back, ${backendUser.name}! SECUREFILL document vault synchronisation completed.`);
      }, 800);
    } catch (err: any) {
      console.error("Authentication failed:", err);
      setAuthenticatingGoogle(false);
      showToast(`❌ Authentication failed: ${err.message || 'Server error'}`);
    }
  };

  // Helper to append log item
  const logSystemActivity = (action: any, details: string, status: 'Success' | 'Warning' | 'Error' = 'Success') => {
    const freshLog: ActivityLogItem = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action,
      device: "Admin API Client",
      ipAddress: "192.168.12.24",
      status,
      details
    };
    setActivityLogs(prev => [freshLog, ...prev]);
  };

  // Toggle Biometric setup
  const toggleBiometricsSetting = () => {
    if (user.biometricsEnabled) {
      setUser(prev => ({ ...prev, biometricsEnabled: false }));
      showToast("Face ID & Biometrics login disabled.");
    } else {
      setBiometricSetupModal(true);
    }
  };

  const handleConfirmBiometricsRegister = () => {
    setBiometricSetupModal(false);
    setUser(prev => ({ ...prev, biometricsEnabled: true }));
    logSystemActivity("Sync", "Biometrics credential keys securely mapped locally", "Success");
    showToast("Success! Device biometric lock activated for SECUREFILL.");
  };

  // Dynamic values computation for Dashboard SaaS Cards
  const totalDocumentsCount = documents.length;
  
  const currentTotalBytesUsed = useMemo(() => {
    return documents.reduce((sum, doc) => sum + doc.sizeBytes, 0);
  }, [documents]);

  const currentTotalSharesCount = useMemo(() => {
    return shares.length;
  }, [shares]);

  // Format Storage string (e.g. 3.2GB / 10GB)
  const formattedStorageUsage = useMemo(() => {
    const limitBytes = 10 * 1024 * 1024 * 1024; // 10 GB
    const usagePercent = (currentTotalBytesUsed / limitBytes) * 100;
    const gbValue = (currentTotalBytesUsed / (1024 * 1024 * 1024)).toFixed(2);
    return {
      rawPercent: usagePercent,
      displayString: `${gbValue}GB / 10.0GB`,
      fractionString: `${gbValue}GB / 10GB`
    };
  }, [currentTotalBytesUsed]);

  // Sync state generator
  const triggerManualCloudSync = () => {
    setCurrentSyncStatus('Syncing');
    setSyncProgress(10);
    logSystemActivity("Sync", "Cloud storage sync and integrity integrity check started", "Success");
    
    const interval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setCurrentSyncStatus('Synced');
          setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          showToast("Sync finished! Cryptographic system registers matched 100%.");
          return 100;
        }
        return prev + 30;
      });
    }, 450);
  };

  // FAST CHUNKED FILE UPLOAD SIMULATOR
  const processFileUpload = (file: File) => {
    const queueId = `up-${Date.now()}`;
    const newQueueItem = {
      id: queueId,
      filename: file.name,
      progress: 0,
      remainingSeconds: 6,
      speedKb: Math.floor(Math.random() * 800) + 400,
      isProcessed: false
    };

    setUploadQueue(prev => [...prev, newQueueItem]);
    logSystemActivity("Upload", `Started chunked upload for ${file.name}`, "Success");

    // Dynamic countdown timer simulation
    let progressVal = 0;
    const uploadTimer = setInterval(() => {
      progressVal += 20;
      setUploadQueue(prev => prev.map(item => {
        if (item.id === queueId) {
          const nextSeconds = Math.max(0, item.remainingSeconds - 1);
          return {
            ...item,
            progress: Math.min(progressVal, 100),
            remainingSeconds: nextSeconds
          };
        }
        return item;
      }));

      if (progressVal >= 100) {
        clearInterval(uploadTimer);
        // Formulate automatic naming engine
        // IMG_78282.jpg -> Ashish_Ghumarkar_Passport_Photo.jpg
        // file123.pdf -> Ashish_Ghumarkar_Bachelors_Degree.pdf
        let autoName = file.name;
        let detectedType = "Document Image";
        let defaultCat: any = 'Other';

        if (file.name.toLowerCase().includes('img') || file.name.toLowerCase().includes('jpg') || file.name.toLowerCase().includes('png')) {
          autoName = "Ashish_Ghumarkar_Passport_Photo.jpg";
          detectedType = "Passport Photo";
          defaultCat = 'Identity';
        } else if (file.name.toLowerCase().includes('file') || file.name.toLowerCase().includes('pdf')) {
          autoName = "Ashish_Ghumarkar_Bachelors_Degree.pdf";
          detectedType = "Bachelors Degree";
          defaultCat = 'Education';
        } else if (file.name.toLowerCase().includes('resume')) {
          autoName = "Ashish_Ghumarkar_CV_Fullstack.pdf";
          detectedType = "Professional Resume";
          defaultCat = 'Professional';
        }

        // Duplicate Handling check
        const isDuplicate = documents.some(d => d.filename === autoName);
        if (isDuplicate) {
          const count = documents.filter(d => d.filename.startsWith(autoName.split('.')[0])).length;
          const extension = autoName.split('.').pop();
          const baseName = autoName.split(`.${extension}`)[0];
          autoName = `${baseName}_V${count + 1}.${extension}`;
        }

        // Add auto notification
        const newNotif: AppNotification = {
          id: `not-${Date.now()}`,
          type: 'upload_complete',
          title: "Upload complete",
          message: `File ${file.name} classified and renamed as ${autoName}.`,
          timestamp: "Just now",
          read: false
        };

        // Create new document items
        const newDoc: DocumentItem = {
          id: `doc-${Date.now()}`,
          name: autoName,
          filename: autoName,
          category: defaultCat,
          status: 'Secure',
          dataSummary: `Auto-OCR Extracted: ${detectedType}`,
          secureShare: false,
          verified: true,
          sizeBytes: file.size || (Math.floor(Math.random() * 3000000) + 150000),
          uploadDate: new Date().toISOString(),
          folderId: activeFolderId,
          metadata: {
            extractedName: user.name,
            extractedDate: new Date().toISOString().split('T')[0],
            documentType: detectedType,
            expiryDate: "N/A",
            institutionName: "Verified Local OCR Terminal"
          }
        };

        setDocuments(prev => [newDoc, ...prev]);
        setNotifications(prev => [newNotif, ...prev]);
        setUploadQueue(prev => prev.filter(item => item.id !== queueId));
        logSystemActivity("Upload", `Completed and auto-named document as ${autoName}`, "Success");
        showToast(`🎉 Encrypted upload finished! Renamed to "${autoName}"`);
      }
    }, 600);
  };

  // Drag and drop event handlers
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        processFileUpload(e.dataTransfer.files[i]);
      }
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      for (let i = 0; i < e.target.files.length; i++) {
        processFileUpload(e.target.files[i]);
      }
    }
  };

  // SMART SEARCH ENGINE
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState<'All' | 'Identity' | 'Education' | 'Professional' | 'Financial' | 'Other'>('All');

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

  // Nested Folder functions
  const handleCreateNewFolder = () => {
    if (!newFolderName.trim()) return;

    const newFolder: FolderItem = {
      id: `fol-${Date.now()}`,
      name: newFolderName,
      parentId: selectedParentId
    };

    setFolders(prev => [...prev, newFolder]);
    setNewFolderName('');
    setNewFolderModal(false);
    showToast(`Folder "${newFolderName}" created successfully.`);
    logSystemActivity("Sync", `Created folder directory structure: ${newFolderName}`, "Success");
  };

  // Expiry Alert detection calculations
  const alertDocuments = useMemo(() => {
    return documents.filter(d => d.expiresInDays && d.expiresInDays <= 45);
  }, [documents]);

  const duplicateCertificatesCount = useMemo(() => {
    return documents.filter(d => d.name.toLowerCase().includes('duplicate') || d.name.includes('_V')).length;
  }, [documents]);

  // Live Graph Data calculations
  const uploadActivityChartData = [
    { name: "Mon", uploads: 2, storageStr: "1.2GB" },
    { name: "Tue", uploads: 4, storageStr: "1.4GB" },
    { name: "Wed", uploads: 1, storageStr: "1.4GB" },
    { name: "Thu", uploads: 6, storageStr: "2.1GB" },
    { name: "Fri", uploads: 3, storageStr: "2.8GB" },
    { name: "Sat", uploads: 5, storageStr: "3.2GB" },
    { name: "Sun", uploads: documents.length, storageStr: "3.2GB" }
  ];

  // Category distribution calculation
  const categoryChartData = useMemo(() => {
    const counts: { [key: string]: number } = {};
    documents.forEach(d => {
      counts[d.category] = (counts[d.category] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key]
    }));
  }, [documents]);

  const CATEGORY_COLORS = {
    Identity: '#3B82F6',
    Education: '#22C55E',
    Professional: '#8B5CF6',
    Financial: '#F59E0B',
    Other: '#6B7280'
  };

  // BUILT-IN AI ASSISTANT CHAT INPUT ENGINE
  const handleAiAssistantSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!aiAssistantQuery.trim()) return;

    const userQueryText = aiAssistantQuery;
    const userMsg = {
      sender: 'user',
      text: userQueryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAssistantLogs(prev => [...prev, userMsg]);
    setAiAssistantQuery("");
    setIsThinking(true);

    try {
      const activeToken = localStorage.getItem('securefill_auth_token') || '';
      const response = await fetch('/api/gemini/query', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify({ query: userQueryText, documents, currentScholarship: activeScholarship })
      });
      const data = await response.json();
      setIsThinking(false);

      // Highlight corresponding document in UI if mentioned
      const q = userQueryText.toLowerCase();
      if (q.includes("passport")) {
        const found = documents.find(d => d.filename.toLowerCase().includes("passport") || d.name.toLowerCase().includes("passport"));
        if (found) setSelectedDoc(found);
      } else if (q.includes("degree") || q.includes("bachelor") || q.includes("graduation") || q.includes("lnct")) {
        const found = documents.find(d => d.filename.toLowerCase().includes("bachelor") || d.name.toLowerCase().includes("bachelor"));
        if (found) setSelectedDoc(found);
      } else if (q.includes("aadhaar") || q.includes("national id")) {
        const found = documents.find(d => d.name.toLowerCase().includes("aadhaar") || d.filename.toLowerCase().includes("aadhaar"));
        if (found) setSelectedDoc(found);
      }

      setAssistantLogs(prev => [...prev, {
        sender: 'ai',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err) {
      console.error("Failed assistant query:", err);
      setIsThinking(false);
      setAssistantLogs(prev => [...prev, {
        sender: 'ai',
        text: "My secure local match engine is offline. Please make sure the backend stack is compiled and active.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  };

  // Re-generate customized dynamic temporary QR Codes
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
    setCreatedQR(newQR);
    logSystemActivity("Share", `Generated dynamic QR sharing link for paper ${selectedDocForQR.name}`, "Success");
    showToast(`Share link and secure QR generated for ${selectedDocForQR.name}!`);
  };

  // Trigger quick delete from vault
  const handleDeleteDocument = (id: string, name: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
    logSystemActivity("Delete", `Revoked and shredded document: ${name}`, "Warning");
    showToast(`Shredded document "${name}" successfully from secure storage.`);
    if (selectedDoc?.id === id) {
      setSelectedDoc(null);
    }
  };

  // Simulate remote QR scan events
  const handleSimulateRemoteScan = (qr: ShareConfig) => {
    const updatedShares = shares.map(s => {
      if (s.id === qr.id) {
        const updatedScanCount = s.scanCount + 1;
        const scanNotif: AppNotification = {
          id: `not-${Date.now()}`,
          type: "qr_scanned",
          title: "QR Authenticated scan logged",
          message: `Someone just scanned shared files QR code for item. Location: New Delhi, India.`,
          timestamp: "Just now",
          read: false
        };
        setNotifications(prev => [scanNotif, ...prev]);
        showToast("🔔 Scan event logged from New Delhi, India!");
        logSystemActivity("QR Scan", `QR scanned by iPad client from 112.44.20.104`, "Success");
        return {
          ...s,
          scanCount: updatedScanCount,
          lastScan: "Just now",
          deviceType: "Apple Tablet (iPadOS)",
          location: "New Delhi, India"
        };
      }
      return s;
    });
    setShares(updatedShares);
  };

  // Export mechanisms simulation
  const triggerDatabaseExportType = (type: 'JSON' | 'CSV' | 'ZIP') => {
    let payload = "";
    let mime = "application/json";
    let filename = `SecureFill_Database_Dump.${type.toLowerCase()}`;

    if (type === 'JSON') {
      payload = JSON.stringify({ user, documents, folders, shares }, null, 2);
    } else if (type === 'CSV') {
      mime = "text/csv";
      payload = "Document Name,Category,Status,Upload Date,Size (Bytes)\n" +
        documents.map(d => `"${d.name}","${d.category}","${d.status}","${d.uploadDate}",${d.sizeBytes}`).join("\n");
    } else {
      payload = "Fake ZIP Container Byte Buffer Cryptographic Block";
      mime = "application/zip";
    }

    const blob = new Blob([payload], { type: mime });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    logSystemActivity("Export", `Exported system profile database payload as ${type}`, "Success");
    showToast(`Successfully downloaded profile export package as ${type}!`);
  };

  // Mark all notifications as read
  const handleMarkAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showToast("Cleared active notifications.");
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#222222] antialiased flex flex-col font-sans transition-all">
      
      {/* SaaS Premium Navigation Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#E5E5E5] px-6 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#222222] flex items-center justify-center text-white">
            <span className="material-symbols-outlined select-none text-xl font-bold">
              fingerprint
            </span>
          </div>
          <div>
            <span className="font-mono text-[9px] text-[#3B82F6] tracking-widest uppercase block font-semibold leading-none">
              ENTERPRISE DECRYPT CO.
            </span>
            <h1 className="font-sans text-base font-extrabold text-[#222222] tracking-tight">
              SECUREFILL AI
            </h1>
          </div>
        </div>

        {/* Sync, Notifications and Quick Controls */}
        <div className="flex items-center gap-4">
          
          {/* Synchronizer Status pill */}
          <div 
            onClick={triggerManualCloudSync}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAFAFA] border border-[#E5E5E5] hover:border-[#3B82F6] transition-colors cursor-pointer text-xs"
            title="Click to manually re-sync"
          >
            <span className={`w-2 h-2 rounded-full ${
              currentSyncStatus === 'Synced' ? 'bg-[#22C55E]' : 
              currentSyncStatus === 'Syncing' ? 'bg-[#F59E0B] animate-pulse' : 'bg-[#EF4444]'
            }`}></span>
            <span className="text-[#64748B] font-mono text-[11px] font-medium uppercase tracking-wider">
              {currentSyncStatus === 'Synced' ? '🟢 Synced' : currentSyncStatus === 'Syncing' ? '🟡 Syncing' : '🔴 Failed'}
            </span>
            <RefreshCw className={`w-3 h-3 text-[#666666] ${currentSyncStatus === 'Syncing' ? 'animate-spin' : ''}`} />
          </div>

          {/* Persistent Notifications Box */}
          <div className="relative">
            <button 
              onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
              className="p-2.5 rounded-lg border border-[#E5E5E5] bg-white hover:bg-[#FAFAFA] text-[#222222] relative transition-colors"
              title="Alert Notifications"
            >
              <Bell className="w-4 h-4 text-[#222222]" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#EF4444] text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Notification drop menu */}
            <AnimatePresence>
              {showNotificationsDropdown && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-3 w-80 bg-white border border-[#E5E5E5] rounded-xl shadow-2xl z-50 p-4"
                >
                  <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-2 mb-2">
                    <span className="text-xs font-bold text-[#222222]">Live Notifications Center</span>
                    {unreadNotificationsCount > 0 && (
                      <button 
                        onClick={handleMarkAllNotificationsAsRead}
                        className="text-[10px] text-[#3B82F6] hover:underline font-semibold"
                      >
                        Clear unread
                      </button>
                    )}
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-[#666666] py-4 text-center">No active system alerts.</p>
                    ) : (
                      notifications.map(not => (
                        <div key={not.id} className={`p-2.5 rounded-lg text-xs leading-relaxed ${not.read ? 'bg-white' : 'bg-[#3B82F6]/5 border-l-2 border-l-[#3B82F6]'}`}>
                          <div className="flex justify-between font-bold text-xs text-[#222222]">
                            <span>{not.title}</span>
                            <span className="font-mono text-[9px] text-[#666666] font-normal">{not.timestamp}</span>
                          </div>
                          <p className="text-[#666666] text-[11px] mt-0.5">{not.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Simple user profile banner action */}
          <div className="relative flex items-center">
            <button 
              onClick={() => {
                if (isLoggedIn) {
                  setShowProfileDropdown(!showProfileDropdown);
                } else {
                  handleToggleLogin();
                }
              }}
              className="flex items-center gap-2 pl-2 border-l border-[#E5E5E5] hover:opacity-85 transition-opacity text-left cursor-pointer"
              title={isLoggedIn ? "Click to manage secure session" : "Click to sign in via Google"}
            >
              <img 
                src={isLoggedIn ? user.photo : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100&h=100"} 
                alt={isLoggedIn ? user.name : "Signed Out"} 
                className="w-9 h-9 rounded-full object-cover border border-[#E5E5E5] shadow-inner"
              />
              <div className="hidden lg:block text-left leading-tight pr-1">
                <p className="text-xs font-bold text-[#222222]">{isLoggedIn ? user.name : "Signed Out"}</p>
                <p className="text-[10px] text-[#666666] font-mono leading-none truncate max-w-[120px]">{isLoggedIn ? user.email : "Sign In via Google"}</p>
              </div>
              <ChevronDown className="w-3 h-3 text-[#666666] hidden lg:block" />
            </button>

            {/* Profile Dropdown Menu */}
            <AnimatePresence>
              {isLoggedIn && showProfileDropdown && (
                <>
                  {/* Backdrop shield */}
                  <div 
                    className="fixed inset-0 z-40 cursor-default" 
                    onClick={() => setShowProfileDropdown(false)} 
                  />
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-11 mt-1 w-64 bg-white border border-[#E5E5E5] rounded-xl shadow-2xl p-4 z-50 text-left space-y-3"
                  >
                    <div className="flex items-center gap-3 pb-2 border-b border-[#E5E5E5]">
                      <img 
                        src={user.photo} 
                        alt={user.name} 
                        className="w-10 h-10 rounded-full object-cover border border-[#3B82F6]/30 shadow-inner"
                      />
                      <div className="leading-tight">
                        <h4 className="text-xs font-extrabold text-[#222222]">{user.name}</h4>
                        <p className="text-[10px] text-[#666666] font-mono truncate max-w-[150px]">{user.email}</p>
                      </div>
                    </div>

                    <div className="space-y-1 text-[11px] text-[#666666]">
                      <div className="flex justify-between items-center bg-[#FAFAFA] border border-[#E5E5E5] p-2 rounded-lg">
                        <span>Connection Status</span>
                        <span className="font-bold text-[#22C55E] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]"></span> Active
                        </span>
                      </div>
                      <div className="p-1 px-2 font-mono text-[9px] block">
                        📍 Registry Node: Bhopal, MP
                      </div>
                    </div>

                    <div className="pt-1.5 border-t border-[#E5E5E5] space-y-1">
                      <button 
                        onClick={() => {
                          setActiveTab('Settings');
                          setShowProfileDropdown(false);
                        }}
                        className="w-full text-left font-bold text-xs p-2 hover:bg-[#FAFAFA] rounded-lg text-[#222222] transition-colors flex items-center gap-2"
                      >
                        <Settings className="w-3.5 h-3.5 text-[#3B82F6]" />
                        Settings &amp; Credentials
                      </button>

                      <button 
                        onClick={() => {
                          handleLogout();
                          setShowProfileDropdown(false);
                        }}
                        className="w-full text-left font-bold text-xs p-2 hover:bg-red-50 rounded-lg text-[#EF4444] transition-colors flex items-center gap-2 border border-dashed border-[#EF4444]/20"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Log out Securely
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

        </div>
      </header>

      {/* Logged Out Splash Screen */}
      {!isLoggedIn && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#FFFFFF] relative">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="w-16 h-16 bg-[#FAFAFA] border border-[#E5E5E5] rounded-2xl flex items-center justify-center text-[#222222] mx-auto shadow-md">
              <Lock className="w-8 h-8 text-[#222222]" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-black text-[#222222] tracking-tight">Access Locked</h1>
              <p className="text-[#666666] text-sm">
                Unlock SECUREFILL AI with Google Sign-In or local biometric scan. This is a secure sandboxed environment.
              </p>
            </div>

            <div className="bg-[#FAFAFA] border border-[#E5E5E5] p-4 rounded-xl text-left text-xs text-[#666666] space-y-2 font-mono">
              <p>🌐 Connection: Google OAuth 2.0 Client SSL Verification</p>
              <p>🕒 Time: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
              <p>🔐 Cryptographic Seal: AES-GCM-256 Symmetric Ledger</p>
            </div>

            <button
              onClick={handleToggleLogin}
              className="w-full bg-[#222222] hover:bg-[#333333] text-white py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Globe className="w-4 h-4 text-white" />
              Sign In with Google Account
            </button>

            <button
              onClick={() => {
                setBiometricPromptActive(true);
                setTimeout(() => {
                  setBiometricPromptActive(false);
                  setIsLoggedIn(true);
                  logSystemActivity("Login", "Unlock completed with local fingerprints", "Success");
                  showToast("Biometrics verified. Welcome to secure sandbox.");
                }, 1400);
              }}
              className="w-full bg-[#FAFAFA] hover:bg-[#F5F5F5] text-[#222222] border border-[#E5E5E5] py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Fingerprint className="w-4 h-4 text-[#3B82F6]" />
              Scan Biometric thumb
            </button>
          </div>

          {/* GOOGLE ACCOUNTS DIALOG POPUP */}
          <AnimatePresence>
            {showGoogleLoginChooser && (
              <div className="fixed inset-0 bg-[#000000]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-white max-w-sm w-full rounded-2xl p-6 shadow-2xl border border-[#E5E5E5] space-y-5 text-left relative overflow-hidden"
                >
                  <div className="text-center space-y-1.5">
                    <div className="text-xl font-mono tracking-tight font-extrabold select-none mb-1">
                      <span className="text-[#4285F4]">G</span>
                      <span className="text-[#EA4335]">o</span>
                      <span className="text-[#FBBC05]">o</span>
                      <span className="text-[#4285F4]">g</span>
                      <span className="text-[#34A853]">l</span>
                      <span className="text-[#EA4335]">e</span>
                    </div>
                    {googleChooserStep === 'list' && (
                      <>
                        <h3 className="text-[#202124] text-base font-semibold font-sans">Choose an account</h3>
                        <p className="text-xs text-[#5f6368] font-sans">to continue to <span className="font-extrabold text-[#222222]">SECUREFILL VAULT</span></p>
                      </>
                    )}
                    {googleChooserStep === 'custom' && (
                      <>
                        <h3 className="text-[#202124] text-base font-semibold font-sans">Connect another account</h3>
                        <p className="text-xs text-[#5f6368] font-sans">Register new credentials on this device</p>
                      </>
                    )}
                    {googleChooserStep === 'password' && (
                      <>
                        <h3 className="text-[#202124] text-base font-semibold font-sans">Verify your identity</h3>
                        <p className="text-xs text-[#5f6368] font-sans">Enter password to complete validation</p>
                      </>
                    )}
                  </div>

                  {googleChooserStep === 'list' && (
                    <div className="space-y-2 border-t border-b border-[#F1F3F4] py-3.5 max-h-[300px] overflow-y-auto pr-1 no-scrollbar text-[#222222]">
                      {/* 1. Ashish Ghumarkar (Admin / Owner) */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAccount({
                            email: "aashishbhumarkar888@gmail.com",
                            name: "Ashish Ghumarkar",
                            photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150"
                          });
                          setAccountPassword('');
                          setGoogleChooserStep('password');
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl border border-[#DADCE0] hover:bg-[#F8F9FA] text-left transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <img 
                            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150" 
                            alt="Ashish" 
                            className="w-8 h-8 rounded-full object-cover border border-[#4285F4]/30"
                          />
                          <div className="leading-tight">
                            <p className="text-xs font-bold text-[#3c4043] group-hover:text-[#1a73e8] transition-colors">
                              Ashish Ghumarkar
                            </p>
                            <p className="text-[9px] text-[#5f6368] font-mono">aashishbhumarkar888@gmail.com</p>
                          </div>
                        </div>
                        <span className="text-[8px] bg-[#E8F0FE] text-[#1a73e8] font-extrabold px-1.5 py-0.5 rounded font-sans shrink-0 uppercase tracking-wider">Admin</span>
                      </button>

                      {/* 2. Ajay Kumar (User View) */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAccount({
                            email: "ajay.kumar@gmail.com",
                            name: "Ajay Kumar",
                            photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150"
                          });
                          setAccountPassword('');
                          setGoogleChooserStep('password');
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl border border-[#DADCE0]/80 hover:bg-[#F8F9FA] text-left transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <img 
                            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150" 
                            alt="Ajay" 
                            className="w-8 h-8 rounded-full object-cover border border-[#E5E5E5]"
                          />
                          <div className="leading-tight">
                            <p className="text-xs font-semibold text-[#3c4043] group-hover:text-[#1a73e8] transition-colors">
                              Ajay Kumar
                            </p>
                            <p className="text-[9px] text-[#5f6368] font-mono">ajay.kumar@gmail.com</p>
                          </div>
                        </div>
                        <span className="text-[8px] bg-gray-100 text-[#5f6368] font-bold px-1.5 py-0.5 rounded font-sans shrink-0">User</span>
                      </button>

                      {/* 3. Rohan Sharma (User View) */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAccount({
                            email: "rohan.sharma@gmail.com",
                            name: "Rohan Sharma",
                            photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150"
                          });
                          setAccountPassword('');
                          setGoogleChooserStep('password');
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl border border-[#DADCE0]/80 hover:bg-[#F8F9FA] text-left transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <img 
                            src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150" 
                            alt="Rohan" 
                            className="w-8 h-8 rounded-full object-cover border border-[#E5E5E5]"
                          />
                          <div className="leading-tight">
                            <p className="text-xs font-semibold text-[#3c4043] group-hover:text-[#1a73e8] transition-colors">
                              Rohan Sharma
                            </p>
                            <p className="text-[9px] text-[#5f6368] font-mono">rohan.sharma@gmail.com</p>
                          </div>
                        </div>
                        <span className="text-[8px] bg-gray-100 text-[#5f6368] font-bold px-1.5 py-0.5 rounded font-sans shrink-0">User</span>
                      </button>

                      {/* 4. Guest Auditor (User View) */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAccount({
                            email: "guest.developer@gmail.com",
                            name: "Guest Auditor",
                            photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150"
                          });
                          setAccountPassword('');
                          setGoogleChooserStep('password');
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl border border-[#DADCE0]/80 hover:bg-[#F8F9FA] text-left transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <img 
                            src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150" 
                            alt="GD" 
                            className="w-8 h-8 rounded-full object-cover border border-[#E5E5E5]"
                          />
                          <div className="leading-tight">
                            <p className="text-xs font-semibold text-[#3c4043] group-hover:text-[#1a73e8] transition-colors">
                              Guest Auditor
                            </p>
                            <p className="text-[9px] text-[#5f6368] font-mono">guest.developer@gmail.com</p>
                          </div>
                        </div>
                        <span className="text-[8px] bg-[#FFFBEB] text-[#B45309] font-bold px-1.5 py-0.5 rounded font-sans shrink-0">Auditor</span>
                      </button>

                      {/* 5. Custom account option */}
                      <button
                        type="button"
                        onClick={() => {
                          setCustomEmail('');
                          setCustomName('');
                          setGoogleChooserStep('custom');
                        }}
                        className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-dashed border-[#DADCE0] hover:bg-[#F8F9FA] text-left transition-all cursor-pointer text-[#1a73e8]"
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-xs font-bold text-[#1a73e8] shrink-0 border border-blue-100">
                          ➕
                        </div>
                        <div className="leading-tight">
                          <p className="text-xs font-bold font-sans">Use another account</p>
                          <p className="text-[9px] text-[#5f6368] font-sans">Add any custom email address</p>
                        </div>
                      </button>
                    </div>
                  )}

                  {googleChooserStep === 'custom' && (
                    /* Custom Account Screen */
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!customEmail) return;
                        const displayName = customName.trim() || customEmail.split('@')[0].split('.').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                        setSelectedAccount({
                          email: customEmail.trim(),
                          name: displayName,
                          photo: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"
                        });
                        setAccountPassword('');
                        setGoogleChooserStep('password');
                      }}
                      className="space-y-4 border-t border-b border-[#F1F3F4] py-4"
                    >
                      <div className="space-y-1.5 text-xs text-[#202124]">
                        <label className="block font-semibold font-sans text-gray-700">Email address</label>
                        <input 
                          type="email"
                          required
                          value={customEmail}
                          onChange={(e) => setCustomEmail(e.target.value)}
                          placeholder="your.name@gmail.com"
                          className="w-full px-3 py-2 border border-[#DADCE0] rounded-lg focus:outline-none focus:border-[#1a73e8] font-mono text-xs text-[#222222]"
                        />
                      </div>

                      <div className="space-y-1.5 text-xs text-[#202124]">
                        <label className="block font-semibold font-sans text-gray-700">Full Name (optional)</label>
                        <input 
                          type="text"
                          value={customName}
                          onChange={(e) => setCustomName(e.target.value)}
                          placeholder="e.g. Rachel Green"
                          className="w-full px-3 py-2 border border-[#DADCE0] rounded-lg focus:outline-none focus:border-[#1a73e8] font-sans text-xs text-[#222222]"
                        />
                      </div>

                      <p className="text-[10px] text-[#5f6368] leading-relaxed">
                        Only <span className="font-bold font-mono">aashishbhumarkar888@gmail.com</span> will receive Administrator credentials. All other email profiles automatically receive standard user views.
                      </p>

                      <div className="flex gap-2.5 pt-2">
                        <button
                          type="button"
                          onClick={() => setGoogleChooserStep('list')}
                          className="w-1/2 border border-[#DADCE0] hover:bg-[#F8F9FA] text-[#3c4043] py-2 rounded-lg text-xs font-semibold tracking-wide transition-colors cursor-pointer text-center"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          className="w-1/2 bg-[#1a73e8] hover:bg-[#1557b0] text-white py-2 rounded-lg text-xs font-semibold tracking-wide transition-colors cursor-pointer text-center shadow-xs"
                        >
                          Next
                        </button>
                      </div>
                    </form>
                  )}

                  {googleChooserStep === 'password' && (
                    /* Elegant Google Password verification */
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (accountPassword !== '12345678') {
                          setPasswordError('Invalid lock key. Please enter the security password (sandbox key: 12345678).');
                          showToast('❌ Login blocked: Invalid terminal credentials');
                          logSystemActivity("Login Blocked", `Unsuccessful authentication attempt for ${selectedAccount.email} due to bad password`, "Error");
                          return;
                        }
                        setPasswordError(null);
                        handleGoogleSelect(selectedAccount.email, selectedAccount.name, selectedAccount.photo);
                      }}
                      className="space-y-4 border-t border-b border-[#F1F3F4] py-4"
                    >
                      {/* Active profile banner card */}
                      <div className="flex items-center gap-3 p-2.5 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl relative overflow-hidden">
                        <img 
                          src={selectedAccount.photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"} 
                          alt={selectedAccount.name} 
                          className="w-9 h-9 rounded-full object-cover border border-[#4285F4]/30 shrink-0"
                        />
                        <div className="min-w-0 leading-tight">
                          <p className="text-xs font-bold text-[#3c4043] truncate">{selectedAccount.name}</p>
                          <p className="text-[10px] text-[#5f6368] font-mono truncate">{selectedAccount.email}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setGoogleChooserStep('list')}
                          className="ml-auto text-[10px] text-[#1a73e8] font-bold hover:underline whitespace-nowrap bg-white border border-[#DADCE0] px-2 py-1 rounded"
                        >
                          Change
                        </button>
                      </div>

                      {passwordError && (
                        <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-[11px] rounded-lg leading-relaxed font-semibold">
                          ⚠️ {passwordError}
                        </div>
                      )}

                      <div className="space-y-1.5 text-xs text-[#202124]">
                        <div className="flex justify-between items-center">
                          <label className="block font-semibold font-sans text-gray-700">Enter account password</label>
                          <span className="text-[10px] text-gray-400 font-mono">Secured via SHA-256</span>
                        </div>
                        <div className="relative">
                          <input 
                            type={showPasswordRaw ? "text" : "password"}
                            required
                            value={accountPassword}
                            onChange={(e) => setAccountPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full px-3 py-2 border border-[#DADCE0] rounded-lg focus:outline-none focus:border-[#1a73e8] font-mono text-xs pr-8 text-[#222222]"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswordRaw(p => !p)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer text-xs"
                          >
                            {showPasswordRaw ? '👁️' : '🔒'}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox"
                          id="show-passwd-check"
                          checked={showPasswordRaw}
                          onChange={(e) => setShowPasswordRaw(e.target.checked)}
                          className="rounded border-[#DADCE0] text-[#1a73e8] focus:ring-0"
                        />
                        <label htmlFor="show-passwd-check" className="text-[11px] text-[#3c4043] font-sans select-none cursor-pointer">
                          Show password
                        </label>
                      </div>

                      <div className="flex gap-2.5 pt-2">
                        <button
                          type="button"
                          onClick={() => setGoogleChooserStep('list')}
                          className="w-1/2 border border-[#DADCE0] hover:bg-[#F8F9FA] text-[#3c4043] py-2 rounded-lg text-xs font-semibold tracking-wide transition-colors cursor-pointer text-center"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          className="w-1/2 bg-[#1a73e8] hover:bg-[#1557b0] text-white py-2 rounded-lg text-xs font-semibold tracking-wide transition-colors cursor-pointer text-center shadow-xs"
                        >
                          Sign In
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="flex justify-between items-center text-[10px] text-[#5f6368] font-sans">
                    {googleChooserStep === 'list' ? (
                      <button
                        type="button"
                        onClick={() => setShowGoogleLoginChooser(false)}
                        className="text-[#1a73e8] hover:text-[#174ea6] font-bold font-sans cursor-pointer"
                      >
                        Cancel
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setGoogleChooserStep('list')}
                        className="text-[#1a73e8] hover:text-[#174ea6] font-bold font-sans cursor-pointer"
                      >
                        Change Account
                      </button>
                    )}
                    <div className="flex gap-2 font-sans font-medium">
                      <span className="hover:underline cursor-pointer">Help</span>
                      <span className="hover:underline cursor-pointer">Privacy</span>
                      <span className="hover:underline cursor-pointer">Terms</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* AUTHENTICATING SPINNER OVERLAY */}
          <AnimatePresence>
            {authenticatingGoogle && (
              <div className="fixed inset-0 bg-[#222222]/90 backdrop-blur-md z-50 flex flex-col items-center justify-center space-y-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-4 border-[#E5E5E5]/20"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-t-[#3B82F6] animate-spin"></div>
                </div>
                <div className="text-center space-y-1">
                  <h3 className="text-sm font-extrabold text-white tracking-widest uppercase">Securing OAuth Connection...</h3>
                  <p className="text-xs text-white/60 font-mono">Handshake progress: {syncProgress}%</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Biometrics scan active simulation overlay */}
      <AnimatePresence>
        {biometricPromptActive && (
          <div className="fixed inset-0 bg-[#222222]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border border-[#E5E5E5] max-w-sm w-full rounded-2xl p-6 text-center space-y-4 shadow-2xl"
            >
              <Fingerprint className="w-16 h-16 text-[#3B82F6] animate-pulse mx-auto" />
              <h3 className="text-sm font-bold text-[#222222] uppercase tracking-wide">Scanning fingerprint sensor...</h3>
              <p className="text-xs text-[#666666]">Keep your thumb placed on your native reader to finish hardware verification keys.</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MAIN ENVELOPE (Logged In Layout) */}
      {isLoggedIn && (
        <div className="flex-1 flex flex-col md:flex-row relative">
          
          {/* Dynamic Navigation Sidebar */}
          <nav className="w-full md:w-64 bg-white border-r border-[#E5E5E5] p-3 flex flex-col gap-1 md:h-[calc(100vh-64px)] overflow-y-auto no-scrollbar justify-between">
            <div className="space-y-4">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#666666] px-3">Primary Navigation</span>
              <div className="space-y-1">
                {[
                  { id: 'Overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
                  { id: 'Vault', label: 'Encrypted Vault', icon: <FolderLock className="w-4 h-4" /> },
                  { id: 'Scholarships', label: 'Scholarship Matcher', icon: <Compass className="w-4 h-4" /> },
                  { id: 'QRShare', label: 'QR Sharing Links', icon: <Share2 className="w-4 h-4" /> },
                  { id: 'ActivityLogs', label: 'Activity & Logs', icon: <Activity className="w-4 h-4" /> },
                  { id: 'AIAgent', label: 'AI Secure Agent', icon: <Brain className="w-4 h-4" /> },
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
                        // Reset folder navigation on exit
                        if (tab.id !== 'Vault') setActiveFolderId(null);
                      }}
                      className={`w-full text-left font-sans text-xs flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-semibold ${
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

              {/* Smart Folders quick filter checklist in sidebar */}
              {activeTab === 'Vault' && (
                <div className="mt-6 space-y-2 pt-4 border-t border-[#E5E5E5]">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-[#666666] px-3">Smart Folders Directory</span>
                  <div className="space-y-1">
                    <button 
                      onClick={() => setSearchCategory('All')}
                      className={`w-full text-left font-sans text-[11px] px-3 py-1.5 rounded transition-all font-semibold flex items-center justify-between ${
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
                        className={`w-full text-left font-sans text-[11px] px-3 py-1.5 rounded transition-all font-semibold flex items-center justify-between ${
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

            {/* Sync Progress Tracker */}
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

          {/* MAIN CONTAINER STREAM */}
          <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto no-scrollbar md:h-[calc(100vh-64px)] bg-[#F5F5F5]">
            
            {/* VIEW 1: MASTER OVERVIEW DASHBOARD */}
            {activeTab === 'Overview' && (
              <div className="space-y-6">
                
                {/* Section title & interactive sync button */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#E5E5E5] pb-4">
                  <div>
                    <h2 className="text-xl font-extrabold tracking-tight text-[#222222]">Identity Command Center</h2>
                    <p className="text-xs text-[#666666] font-semibold font-mono">Active Sandbox: Ashish Ghumarkar • Bhopal, MP</p>
                  </div>
                  
                  {/* Sync action trigger */}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => triggerManualCloudSync()}
                      className="bg-white border border-[#E5E5E5] hover:bg-[#FAFAFA] font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors text-[#222222]"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Re-sync Identity Registers
                    </button>

                    <button 
                      onClick={() => triggerDatabaseExportType('ZIP')}
                      className="bg-[#222222] hover:bg-[#333333] text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5 text-white" /> Export ZIP Package
                    </button>
                  </div>
                </div>

                {/* Dashboard Key Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* Total Documents */}
                  <div className="saas-card rounded-xl p-5 flex flex-col justify-between hover:border-[#3B82F6]/60 transition-all cursor-pointer" onClick={() => setActiveTab('Vault')}>
                    <span className="text-[10px] uppercase font-bold text-[#666666] tracking-wider">Total Documents</span>
                    <div className="my-2.5">
                      <p className="text-2xl font-black text-[#222222]">128 Documents</p>
                      <p className="text-[10px] text-[#22C55E] mt-0.5 font-bold">✓ Structured Entity Mappings</p>
                    </div>
                    <span className="text-[10px] text-[#666666] font-mono">Synced locally in sandbox</span>
                  </div>

                  {/* Storage Usage */}
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

                  {/* Active Shares */}
                  <div className="saas-card rounded-xl p-5 flex flex-col justify-between hover:border-[#3B82F6]/60 transition-all cursor-pointer" onClick={() => setActiveTab('QRShare')}>
                    <span className="text-[10px] uppercase font-bold text-[#666666] tracking-wider">Shared Files</span>
                    <div className="my-2.5">
                      <p className="text-2xl font-black text-[#222222]">24 Active Shares</p>
                      <p className="text-[10px] text-[#F59E0B] mt-0.5 font-bold">● High privacy masking active</p>
                    </div>
                    <span className="text-[10px] text-[#666666] font-mono">Dynamic temporary QR codes</span>
                  </div>

                  {/* Recent Activity */}
                  <div className="saas-card rounded-xl p-5 flex flex-col justify-between hover:border-[#3B82F6]/60 transition-all cursor-pointer" onClick={() => setActiveTab('ActivityLogs')}>
                    <span className="text-[10px] uppercase font-bold text-[#666666] tracking-wider">Recent Activity</span>
                    <div className="my-2.5">
                      <p className="text-sm font-bold text-[#222222] truncate">Last upload 15 mins ago</p>
                      <p className="text-[10px] text-[#666666] font-semibold font-mono mt-1">Uploaded Ashish_Ghumarkar_Bachelors_Degree.pdf</p>
                    </div>
                    <span className="text-[10px] text-[#666666] font-mono">Local host audited</span>
                  </div>

                </div>

                {/* Grid: AI Insights & Interactive Upload Queue */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left Column: AI INSIGHTS PANEL (4 cols) */}
                  <div className="lg:col-span-4 space-y-4">
                    <div className="saas-card p-5 bg-white space-y-4">
                      <h4 className="font-bold text-xs uppercase text-[#666666] tracking-widest flex items-center gap-2">
                        <Brain className="w-4 h-4 text-[#3B82F6]" /> AI Insights Panel
                      </h4>
                      <div className="space-y-3 text-xs leading-relaxed">
                        <div className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-[#22C55E] flex-shrink-0 mt-0.5 bg-[#22C55E]/15 rounded-full p-0.5" />
                          <p className="text-[#222222] font-semibold">You uploaded 5 certificates this month.</p>
                        </div>
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5">
                          <AlertTriangle className="w-4 h-4 text-[#EF4444] flex-shrink-0 mt-0.5" />
                          <p className="text-[#222222] font-semibold">Passport expires in 11 months.</p>
                        </div>
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5">
                          <AlertTriangle className="w-4 h-4 text-[#F59E0B] flex-shrink-0 mt-0.5" />
                          <p className="text-[#222222] font-semibold">Resume has not been updated in 8 months.</p>
                        </div>
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2.5">
                          <Brain className="w-4 h-4 text-[#3B82F6] flex-shrink-0 mt-0.5" />
                          <p className="text-[#222222] font-semibold">3 duplicate documents detected.</p>
                        </div>
                      </div>
                    </div>

                    {/* EXPIRATION CALENDAR VIEW */}
                    <div className="saas-card p-5 bg-white border border-[#E5E5E5] space-y-4">
                      <h4 className="font-bold text-xs uppercase text-[#666666] tracking-widest flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-[#EF4444]" /> Expiration Calendar View
                      </h4>
                      <p className="text-[11px] text-[#666666] leading-relaxed">
                        Track upcoming identity deadlines automatically detected with A.I. chronological scanners.
                      </p>

                      <div className="space-y-2.5">
                        {documents.filter(d => d.metadata?.expiryDate).map(d => {
                          const expiryDateString = d.metadata?.expiryDate || "NEVER";
                          const isNear = d.expiresInDays && d.expiresInDays <= 45;
                          return (
                            <div 
                              key={d.id} 
                              className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                                isNear 
                                  ? 'bg-red-50 border-red-200 text-[#EF4444]' 
                                  : 'bg-[#FAFAFA] border-[#E5E5E5] text-[#222222]'
                              }`}
                            >
                              <div className="space-y-0.5 text-left text-xs min-w-0">
                                <span className="font-bold block truncate">{d.name}</span>
                                <span className={`text-[10px] font-mono block ${isNear ? 'text-red-500 font-bold' : 'text-[#666666]'}`}>
                                  Deadline: {expiryDateString} ({d.expiresInDays || "N/A"} days left)
                                </span>
                              </div>
                              <button
                                onClick={() => {
                                  showToast(`📩 Expiry reminder alert dispatched for ${d.name}!`);
                                  logSystemActivity("Sync", `Dispatched verification alerts for ${d.name}`, "Success");
                                }}
                                className={`text-[10px] font-bold px-2 py-1 rounded transition-colors shrink-0 uppercase border ${
                                  isNear 
                                    ? 'bg-white hover:bg-red-100/40 border-red-200 text-red-600' 
                                    : 'bg-white hover:bg-[#FAFAFA] border-[#E5E5E5] text-[#222222]'
                                }`}
                              >
                                Remind Me
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      {/* Mini calendar block visualization */}
                      <div className="grid grid-cols-7 gap-1 text-[10px] font-mono text-center pt-2 border-t border-[#E5E5E5]">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, ix) => (
                          <span key={ix} className="font-bold text-[#666666]">{day}</span>
                        ))}
                        {Array.from({ length: 31 }).map((_, i) => {
                          const dayNum = i + 1;
                          // highlight simulated alarm days
                          const isAlert = dayNum === 15 || dayNum === 28;
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

                  {/* Right Column: Interactive Charts Section (8 cols) */}
                  <div className="lg:col-span-8 space-y-4">
                    <div className="saas-card p-5 bg-white space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-xs uppercase text-[#666666] tracking-widest flex items-center gap-2">
                          <Activity className="w-4 h-4 text-[#3B82F6]" /> Dynamic Storage &amp; Upload Analytics
                        </h4>
                        <span className="text-xs text-[#666666] bg-[#F5F5F5] px-2 py-0.5 rounded font-mono">Live Logs Graph</span>
                      </div>

                      {/* Live AreaChart */}
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

                      {/* Secondary Category visual chart bar list */}
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 border-t border-[#E5E5E5] text-xs">
                        {categoryChartData.map(cc => (
                          <div key={cc.name} className="p-2.5 bg-[#FAFAFA] rounded-lg border border-[#E5E5E5] text-center space-y-1">
                            <span className="text-[10px] font-bold text-[#666666] uppercase block truncate">{cc.name}</span>
                            <span className="text-lg font-black text-[#222222] block">{cc.value} files</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Integrated AI Assistant Chat (Overview embedded) */}
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
                        <button type="submit" className="bg-[#222222] text-white px-4 py-2 rounded-lg text-xs font-bold uppercase">
                          Submit
                        </button>
                      </form>
                    </div>

                  </div>

                </div>

                {/* FAST CHUNK UPLOAD ZONE */}
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
                      <p className="text-xs text-[#666666]">Classifies images/documents immediately using OCR OCR extractors under 1s.</p>
                    </label>
                  </div>

                  {/* Active Uploading queues */}
                  {uploadQueue.length > 0 && (
                    <div className="bg-white border border-[#E5E5E5] p-4 rounded-xl space-y-3.5">
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
            )}

            {/* VIEW 2: DOCUMENT VAULT & FOLDERS */}
            {activeTab === 'Vault' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight text-[#222222]">Encrypted Vault Manager</h2>
                  <p className="text-xs text-[#666666] font-semibold">Classify, browse, zoom preview, and configure parent or nested folder directory structures.</p>
                </div>

                {/* Sub Action controls & folder creators */}
                <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center bg-white border border-[#E5E5E5] rounded-xl p-4">
                  
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
                      className="bg-white border border-[#E5E5E5] hover:bg-[#FAFAFA] font-bold text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors text-[#222222]"
                    >
                      <FolderPlus className="w-3.5 h-3.5" /> New Directory Folder
                    </button>

                    <button 
                      type="button"
                      onClick={() => {
                        const fileEl = document.getElementById('dash-upload-input');
                        if (fileEl) fileEl.click();
                      }}
                      className="bg-[#222222] hover:bg-[#333333] text-white font-bold text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <CloudUpload className="w-3.5 h-3.5 text-white" /> Rapid Upload
                    </button>
                  </div>

                </div>

                {/* Folder Directory Explorer */}
                <div className="space-y-3.5">
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
                      <div className="p-12 text-center bg-white border border-[#E5E5E5] rounded-xl space-y-2">
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

                              {/* Documents list inside category bifurcation */}
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
                                          {/* Bulk checklist selector element */}
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
                      <div className="bg-[#222222] text-white p-4 rounded-xl border border-white/5 shadow-2xl flex items-center justify-between text-xs">
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
                            className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold px-3 py-1.5 rounded text-[10px] uppercase tracking-wider"
                          >
                            Export Multi
                          </button>
                          <button 
                            onClick={() => {
                              setDocuments(prev => prev.filter(d => !selectedDocIds.includes(d.id)));
                              setSelectedDocIds([]);
                              showToast("Selected materials removed securely.");
                            }}
                            className="bg-[#EF4444] hover:bg-red-600 text-white font-bold px-3 py-1.5 rounded text-[10px] uppercase tracking-wider"
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
                      <div className="saas-card p-5 bg-white space-y-5">
                        
                        {/* Virtual Preview stage */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-xs font-bold text-[#222222]">
                            <span className="truncate max-w-[200px]">{selectedDoc.name}</span>
                            <div className="flex gap-1 bg-[#FAFAFA] border border-[#E5E5E5] rounded p-0.5">
                              <button onClick={() => setPreviewZoom(z => Math.max(50, z - 25))} className="p-1 hover:bg-[#E5E5E5] rounded"><ZoomOut className="w-3 h-3 text-[#222222]" /></button>
                              <button onClick={() => setPreviewZoom(z => Math.min(200, z + 25))} className="p-1 hover:bg-[#E5E5E5] rounded"><ZoomIn className="w-3 h-3 text-[#222222]" /></button>
                              <button onClick={() => setPreviewRotation(r => (r + 90) % 360)} className="p-1 hover:bg-[#E5E5E5] rounded"><RotateCw className="w-3 h-3 text-[#222222]" /></button>
                            </div>
                          </div>

                          {/* Render preview stage */}
                          <div className="h-44 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg overflow-hidden flex items-center justify-center relative bg-[radial-gradient(#E1E1E1_1px,transparent_1px)] bg-[size:16px_16px]">
                            <div 
                              className="text-center p-4 transition-transform duration-200"
                              style={{ 
                                transform: `scale(${previewZoom / 100}) rotate(${previewRotation}deg)`
                              }}
                            >
                              <FileText className="w-12 h-12 text-[#3B82F6] mx-auto mb-2" />
                              <span className="text-[10px] font-mono text-[#666666] block uppercase tracking-wider">PREVIEW SIMULATION</span>
                              <p className="text-[10px] text-[#222222] font-black">{selectedDoc.filename}</p>
                            </div>
                            
                            <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur-xs border border-[#E5E5E5] p-1.5 rounded text-[10px] text-[#222222] flex justify-between font-mono">
                              <span>Format: {selectedDoc.filename.split('.').pop()?.toUpperCase()}</span>
                              <span>Zoom: {previewZoom}%</span>
                            </div>
                          </div>
                        </div>

                        {/* OCR Metadata fields list */}
                        <div className="space-y-3.5 pt-3 border-t border-[#E5E5E5]">
                          <span className="text-[10px] uppercase font-bold text-[#666666] tracking-widest block">OCR Attribute Extractor Metadata</span>
                          
                          <div className="bg-[#FAFAFA] border border-[#E5E5E5] p-3 rounded-xl space-y-2.5 text-xs text-[#222222]">
                            <div className="flex justify-between">
                              <span className="text-[#666666]">Validated Owner</span>
                              <span className="font-bold">{selectedDoc.metadata?.extractedName || user.name}</span>
                            </div>
                            <div className="flex justify-between border-t border-[#F0F0F0]/70 pt-2">
                              <span className="text-[#666666]">Active Vault Nominee</span>
                              <span className="font-bold text-[#1a73e8]">{user.nomineeName || "Kavita Ghumarkar"} ({user.nomineeRelationship || "Spouse"})</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#666666]">Document Class</span>
                              <span className="font-bold">{selectedDoc.metadata?.documentType || "Aadhaar Card"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#666666]">Issued Institution</span>
                              <span className="font-bold">{selectedDoc.metadata?.institutionName || "Registry Dept"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#666666]">Extracted Date</span>
                              <span className="font-mono font-semibold">{selectedDoc.metadata?.extractedDate || "N/A"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#666666]">Expiry Constraint</span>
                              <span className="font-mono font-semibold text-[#EF4444]">{selectedDoc.metadata?.expiryDate || "N/A"}</span>
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
                            className="bg-[#222222] text-white hover:bg-[#333333] font-bold text-xs p-2.5 rounded-lg flex items-center justify-center gap-1"
                          >
                            <Share2 className="w-3.5 h-3.5 text-white" /> Create QR Link
                          </button>

                          <button 
                            onClick={() => triggerDatabaseExportType('CSV')}
                            className="bg-[#FAFAFA] hover:bg-[#F5F5F5] text-[#222222] border border-[#E5E5E5] font-bold text-xs p-2.5 rounded-lg flex items-center justify-center gap-1"
                          >
                            <Download className="w-3.5 h-3.5" /> Download
                          </button>
                        </div>

                      </div>
                    ) : (
                      <div className="p-8 text-center bg-white border border-[#E5E5E5] rounded-xl text-xs text-[#666666]">
                        <p>No document selected.</p>
                        <p className="mt-1 font-bold text-[#222222]">Click any vault card to preview metadata and OCR scans.</p>
                      </div>
                    )}
                  </div>

                </div>

              </div>
            )}

            {/* VIEW 7: SCHOLARSHIP ELIGIBILITY MATCHER */}
            {activeTab === 'Scholarships' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#E5E5E5] pb-4">
                  <div>
                    <h2 className="text-xl font-extrabold tracking-tight text-[#222222]">Scholarships &amp; Fellowships Matching Center</h2>
                    <p className="text-xs text-[#666666] font-semibold">Real-time matching of your verified identity &amp; educational documents against academic criteria.</p>
                  </div>
                  
                  <div className="p-2.5 bg-[#3B82F6]/5 rounded-xl border border-[#3B82F6]/20 flex items-center gap-2 text-xs">
                    <ShieldCheck className="w-5 h-5 text-[#3B82F6]" />
                    <span className="font-bold text-[#222222] font-mono">My Secure Arsenal: {documents.length} Encrypted Assets</span>
                  </div>
                </div>

                {/* List of custom augmented scholarships */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  {[
                    {
                      id: "opp-1",
                      title: "Global Tech Innovation Grant",
                      matchScore: 100,
                      category: "Grant • Tech Innovation",
                      rewardDetails: "$15,000 Award",
                      requiredDocs: ["Passport Photo", "Aadhaar Card", "B.Tech Degree Certificate", "Income Certificate"],
                      criteria: ["B.Tech CGPA >= 8.5", "Age under 30", "Verified Income Proof"],
                      onlineSource: "MP Citizen e-Uparjan Service Portal",
                      offlineSource: "Bhopal Arera Colony local Tehsil office"
                    },
                    {
                      id: "opp-2",
                      title: "Senior AI Architect Post-doc Fellowship",
                      matchScore: 94,
                      category: "Fellowship • Remote Research",
                      rewardDetails: "$7,500 / mo",
                      requiredDocs: ["PAN Card Document", "Technical Resume 2026", "B.Tech Degree Certificate"],
                      criteria: ["Academic Grade >= 8.0/10.0", "Registered Technical Resume", "NSDL PAN ID"],
                      onlineSource: "Self-Authored Portal",
                      offlineSource: "N/A - Direct Online Uploads"
                    },
                    {
                      id: "opp-3",
                      title: "National Merit Fellowship Research",
                      matchScore: 89,
                      category: "Full-Time Research • 6 Months",
                      rewardDetails: "Fully Funded + Travel stipend",
                      requiredDocs: ["Passport Document Scan", "Technical Resume 2026", "B.Tech Degree Certificate", "Letter of Recommendation (LOR)"],
                      criteria: ["B.Tech CGPA >= 9.0", "HOD Endorsed LOR", "Valid International Passport Booklet"],
                      onlineSource: "National Fellowship Portal",
                      offlineSource: "HOD Office Academic Block, LNCT University"
                    }
                  ].map(opp => {
                    // Helper to check if a required document is in the user's active vault
                    const checkHasDocInline = (docType: string) => {
                      const t = docType.toLowerCase();
                      if (t.includes("passport photo") || t.includes("passport booklet") || t.includes("passport")) {
                        return documents.some(d => d.name.toLowerCase().includes("passport") || d.filename.toLowerCase().includes("passport"));
                      }
                      if (t.includes("aadhaar")) {
                        return documents.some(d => d.name.toLowerCase().includes("aadhaar") || d.filename.toLowerCase().includes("aadhaar"));
                      }
                      if (t.includes("degree") || t.includes("graduation") || t.includes("bachelor")) {
                        return documents.some(d => d.name.toLowerCase().includes("bachelor") || d.name.toLowerCase().includes("degree") || d.filename.toLowerCase().includes("bachelors"));
                      }
                      if (t.includes("pan") || t.includes("tax")) {
                        return documents.some(d => d.name.toLowerCase().includes("pan") || d.metadata?.documentType?.toLowerCase().includes("tax"));
                      }
                      if (t.includes("resume")) {
                        return documents.some(d => d.name.toLowerCase().includes("resume") || d.filename.toLowerCase().includes("resume"));
                      }
                      if (t.includes("income")) {
                        return documents.some(d => d.name.toLowerCase().includes("income_certificate") || d.name.toLowerCase().includes("income certificate"));
                      }
                      if (t.includes("recommendation") || t.includes("lor")) {
                        return documents.some(d => d.name.toLowerCase().includes("lor") || d.name.toLowerCase().includes("recommendation") || d.filename.toLowerCase().includes("lor"));
                      }
                      return false;
                    };

                    const docsInArsenal = opp.requiredDocs.filter(d => checkHasDocInline(d));
                    const missingDocs = opp.requiredDocs.filter(d => !checkHasDocInline(d));
                    const arsenalCount = docsInArsenal.length;
                    const neededCount = opp.requiredDocs.length;
                    const criteriaMatchPercent = neededCount > 0 ? Math.round((arsenalCount / neededCount) * 100) : 0;
                    const isApplied = appliedScholarships.includes(opp.id);

                    const handleQueryScholarshipAi = async (scholarshipTitle: string) => {
                      if (!scholarshipAiQuery.trim()) return;
                      setIsScholarshipAiThinking(true);
                      setScholarshipAiResponse("");

                      try {
                        const response = await fetch('/api/gemini/query', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            query: `Regarding scholarship: ${scholarshipTitle}. User asks: ${scholarshipAiQuery}`,
                            documents,
                            currentScholarship: opp
                          })
                        });
                        const data = await response.json();
                        setScholarshipAiResponse(data.text);
                      } catch (err) {
                        setScholarshipAiResponse("Local match: You have verified B.Tech degree, but lack required proof of income. You can request Online OTP sync.");
                      } finally {
                        setIsScholarshipAiThinking(false);
                      }
                    };

                    const triggerQuickApply = (id: string, title: string) => {
                      if (missingDocs.length > 0) {
                        showToast(`⚠️ Cannot Quick Apply. You are missing ${missingDocs.length} required assets. Please check below how to acquire them.`);
                        return;
                      }
                      setAppliedScholarships(prev => [...prev, id]);
                      logSystemActivity("Sync", `Form matching and quick apply triggered for ${title}`, "Success");
                      showToast(`🎉 Success! Applied to ${title} using decentralized secure credentials.`);
                    };

                    return (
                      <div key={opp.id} className="p-5 bg-white border border-[#E5E5E5] rounded-2xl flex flex-col justify-between hover:border-[#3B82F6]/60 transition-all shadow-sm space-y-4">
                        <div className="space-y-2.5">
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] font-bold text-[#3B82F6] bg-[#3B82F6]/5 px-2 py-0.5 rounded uppercase tracking-wider">{opp.category}</span>
                            <span className="text-xs font-mono font-black text-[#222222]">{opp.rewardDetails}</span>
                          </div>
                          <h3 className="text-sm font-black text-[#222222]">{opp.title}</h3>

                          {/* Matching criteria rate */}
                          <div className="space-y-1.5 pt-1.5">
                            <div className="flex justify-between text-[11px] font-bold text-[#666666]">
                              <span>My Document Eligibility</span>
                              <span className={criteriaMatchPercent === 100 ? "text-[#22C55E]" : "text-[#F59E0B]"}>{criteriaMatchPercent}% Eligible</span>
                            </div>
                            <div className="h-1.5 bg-[#FAFAFA] border border-[#E5E5E5] rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all ${criteriaMatchPercent === 100 ? "bg-[#22C55E]" : "bg-[#F59E0B]"}`}
                                style={{ width: `${criteriaMatchPercent}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* Criteria list */}
                          <div className="bg-[#FAFAFA] border border-[#E5E5E5] p-3 rounded-xl text-[11px] space-y-1.5 text-[#222222]">
                            <span className="font-bold text-[10px] uppercase text-[#666666] block">Required Rules checklist</span>
                            {opp.criteria.map((c, i) => (
                              <div key={i} className="flex items-center gap-1.5 font-semibold">
                                <Check className="w-3.5 h-3.5 text-[#22C55E]" />
                                <span>{c}</span>
                              </div>
                            ))}
                          </div>

                          {/* Arsenal check */}
                          <div className="space-y-1.5 text-xs">
                            <span className="font-bold text-[10px] text-[#666666] uppercase block">Document Arsenal Status ({arsenalCount}/{neededCount})</span>
                            <div className="space-y-1.5">
                              {opp.requiredDocs.map((docName, i) => {
                                const hasDoc = checkHasDocInline(docName);
                                return (
                                  <div key={i} className="flex items-center justify-between p-1.5 rounded bg-[#FAFAFA] border border-[#E5E5E5] text-[11px]">
                                    <span className="font-medium text-[#222222]">{docName}</span>
                                    {hasDoc ? (
                                      <span className="font-bold text-[#22C55E] flex items-center gap-1 text-[10px]">✓ In Arsenal</span>
                                    ) : (
                                      <span className="font-bold text-[#EF4444] flex items-center gap-1 text-[10px]">⚠️ Missing</span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Missing instructions */}
                          {missingDocs.length > 0 && (
                            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] text-[#222222] space-y-1">
                              <span className="font-bold text-[#F59E0B] uppercase text-[10px] block">Where to acquire missing files?</span>
                              {opp.requiredDocs.map((docName) => {
                                const hasDoc = checkHasDocInline(docName);
                                if (!hasDoc) {
                                  return (
                                    <div key={docName} className="leading-relaxed">
                                      <p className="font-bold text-[#222222]">• {docName}:</p>
                                      <p className="text-[#666666] pl-2">
                                        <span className="font-bold text-blue-600">Online:</span> Sync from DigiLocker or {opp.onlineSource}.
                                      </p>
                                      {opp.offlineSource && opp.offlineSource !== "N/A" && (
                                        <p className="text-[#666666] pl-2">
                                          <span className="font-bold text-purple-600">Offline:</span> Visit {opp.offlineSource}.
                                        </p>
                                      )}
                                    </div>
                                  );
                                }
                                return null;
                              })}
                            </div>
                          )}
                        </div>

                        <div className="space-y-3 pt-3 border-t border-[#E5E5E5]">
                          {/* Consult Embedded AI Agent */}
                          <div className="bg-[#FAFAFA] rounded-xl border border-[#E5E5E5] p-3 space-y-2">
                            <span className="font-bold text-[10px] uppercase text-[#666666] tracking-wider block flex items-center gap-1">
                              <Brain className="w-3 h-3 text-[#3B82F6]" /> Consult Scholarship Agent
                            </span>
                            <div className="flex gap-2">
                              <input 
                                type="text"
                                placeholder="Am I eligible?"
                                value={scholarshipAiQuery}
                                onChange={(e) => setScholarshipAiQuery(e.target.value)}
                                className="flex-1 bg-white border border-[#E5E5E5] rounded p-1.5 text-[11px] outline-none text-[#222222]"
                              />
                              <button 
                                onClick={() => handleQueryScholarshipAi(opp.title)}
                                className="bg-[#222222] text-white hover:bg-black font-bold p-1 rounded text-[10px] uppercase tracking-wide px-2.5"
                              >
                                Ask
                              </button>
                            </div>
                            
                            {isScholarshipAiThinking && (
                              <p className="text-[10px] text-[#666666] italic animate-pulse">Consulting model metadata...</p>
                            )}
                            {scholarshipAiResponse && (
                              <p className="text-[10px] bg-white p-2 border border-[#E5E5E5] rounded leading-relaxed text-[#222222] font-mono whitespace-pre-line">{scholarshipAiResponse}</p>
                            )}
                          </div>

                          {/* Action button */}
                          {isApplied ? (
                            <button className="w-full bg-green-500 text-white font-bold text-xs p-2.5 rounded-lg flex items-center justify-center gap-1.5 cursor-not-allowed uppercase" disabled>
                              ✓ Applied Successfully
                            </button>
                          ) : (
                            <button
                              onClick={() => triggerQuickApply(opp.id, opp.title)}
                              className={`w-full font-bold text-xs p-2.5 rounded-lg flex items-center justify-center gap-1.5 uppercase transition-colors ${
                                missingDocs.length > 0 
                                  ? 'bg-[#E5E5E5] text-[#666666] cursor-not-allowed'
                                  : 'bg-[#222222] text-white hover:bg-[#333333]'
                              }`}
                            >
                              <Sparkles className="w-4 h-4" /> Quick Apply
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* VIEW 3: QR SHARING WORKFLOW */}
            {activeTab === 'QRShare' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight text-[#222222]">Rebuilt QR Safe Sharing System</h2>
                  <p className="text-xs text-[#666666] font-semibold">Generate highly selective disclosure profiles, password secure access, and analyze scan metrics in real time.</p>
                </div>

                {/* Grid layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Form input: QR Wizard (7 cols) */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="saas-card p-5 bg-white space-y-5">
                      <span className="text-[10px] font-bold text-[#666666] uppercase block border-b border-[#E5E5E5] pb-2">QR Generation Parameters</span>
                      
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
                              <span className="text-[11px] text-[#666666]">Permits direct binary download from verifiers terminal.</span>
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
                                className={`text-[10px] font-bold px-2 py-1 rounded transition-all ${passwordGeneratorCapitals ? 'bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]' : 'bg-white text-[#666666] border border-[#E5E5E5]'}`}
                              >
                                {passwordGeneratorCapitals ? '✓ A-Z' : '✕ A-Z'}
                              </button>
                              <button 
                                onClick={() => setPasswordGeneratorNumbers(!passwordGeneratorNumbers)}
                                className={`text-[10px] font-bold px-2 py-1 rounded transition-all ${passwordGeneratorNumbers ? 'bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]' : 'bg-white text-[#666666] border border-[#E5E5E5]'}`}
                              >
                                {passwordGeneratorNumbers ? '✓ 0-9' : '✕ 0-9'}
                              </button>
                              <button 
                                onClick={() => setPasswordGeneratorSymbols(!passwordGeneratorSymbols)}
                                className={`text-[10px] font-bold px-2 py-1 rounded transition-all ${passwordGeneratorSymbols ? 'bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]' : 'bg-white text-[#666666] border border-[#E5E5E5]'}`}
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
                              className="w-full bg-[#222222] text-white hover:bg-[#333333] font-bold text-[10px] py-1.5 rounded uppercase tracking-wider transition-colors"
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
                          className="w-full bg-[#FAFAFA] border border-[#E5E5E5] p-2.5 rounded-lg text-xs"
                        />
                      </div>

                      <button 
                        onClick={triggerGenerateShareQR}
                        className="w-full bg-[#222222] text-white hover:bg-[#333333] font-bold text-xs p-3 rounded-lg uppercase tracking-wider"
                      >
                        Generate Sealed QR Code
                      </button>

                    </div>
                  </div>

                  {/* QR Output and Scanner simulation (5 cols) */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="saas-card p-5 bg-[#FAFAFA] text-center space-y-4">
                      <span className="text-[10px] font-bold text-[#666666] uppercase block">Sealed QR Output</span>info
                      
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
                    <div className="saas-card p-5 bg-white space-y-3.5">
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
                                  className="px-2 py-1 bg-white border border-[#E5E5E5] hover:bg-[#FAFAFA] rounded font-bold text-[10px] flex items-center gap-1 text-[#222222]"
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
            )}

            {/* VIEW 4: SYSTEM ACTIVITY LOGS */}
            {activeTab === 'ActivityLogs' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#E5E5E5] pb-4">
                  <div>
                    <h2 className="text-xl font-extrabold tracking-tight text-[#222222]">System Audit &amp; Activity Log</h2>
                    <p className="text-xs text-[#666666] font-semibold">Immutable trace ledger records login, cloud uploads, QR scans, and system synchronized status.</p>
                  </div>

                  {/* Export log formats */}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => triggerDatabaseExportType('CSV')}
                      className="bg-white border border-[#E5E5E5] hover:bg-[#FAFAFA] font-bold text-xs px-4.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors text-[#222222]"
                    >
                      Export CSV Audit
                    </button>
                    <button 
                      onClick={() => triggerDatabaseExportType('JSON')}
                      className="bg-[#222222] hover:bg-[#333333] text-white font-bold text-xs px-4.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      Export JSON Profile
                    </button>
                  </div>
                </div>

                {/* Searchable log table */}
                <div className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#FAFAFA] border-b border-[#E5E5E5] text-xs font-bold text-[#666666]">
                          <th className="p-4">Timestamp</th>
                          <th className="p-4">Action</th>
                          <th className="p-4">Device / Client</th>
                          <th className="p-4">IP Address</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Audited Information</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs divide-y divide-[#E5E5E5]">
                        {activityLogs.map(log => (
                          <tr key={log.id} className="hover:bg-[#FAFAFA] transition-colors font-mono">
                            <td className="p-4 text-[#666666]">{new Date(log.timestamp).toLocaleTimeString()}</td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                                log.action === 'Login' ? 'bg-blue-100 text-blue-700' :
                                log.action === 'Upload' ? 'bg-green-100 text-green-700' :
                                log.action === 'QR Scan' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'
                              }`}>
                                {log.action}
                              </span>
                            </td>
                            <td className="p-4 text-[#222222] truncate max-w-[150px]" title={log.device}>{log.device}</td>
                            <td className="p-4 text-[#666666]">{log.ipAddress}</td>
                            <td className="p-4">
                              <span className="text-[#22C55E] font-bold">● SUCCESS</span>
                            </td>
                            <td className="p-4 text-[#222222] font-semibold">{log.details}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* VIEW 5: ADMIN Health PANEL */}
            {activeTab === 'Admin' && user.email === 'aashishbhumarkar888@gmail.com' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight text-[#222222]">Central SaaS Admin &amp; Diagnostics</h2>
                  <p className="text-xs text-[#666666] font-semibold">Monitor hardware platform allocations, system load outputs, and database registers status.</p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-5 bg-white border border-[#E5E5E5] rounded-2xl text-center space-y-2">
                    <Database className="w-10 h-10 text-[#3B82F6] mx-auto opacity-75" />
                    <h3 className="text-sm font-bold text-[#222222]">Sealed DB Registries</h3>
                    <p className="font-mono text-xs text-[#22C55E] font-bold">🟢 ONLINE • matched 100%</p>
                    <p className="text-[11px] text-[#666666]">Active documents: {documents.length}</p>
                  </div>

                  <div className="p-5 bg-white border border-[#E5E5E5] rounded-2xl text-center space-y-2">
                    <Cpu className="w-10 h-10 text-[#22C55E] mx-auto opacity-75" />
                    <h3 className="text-sm font-bold text-[#222222]">CPU Engine Sandbox</h3>
                    <p className="font-mono text-xs text-[#22C55E] font-bold">🟢 14% Load • Idle</p>
                    <p className="text-[11px] text-[#666666]">Allocated buffer: 4.8MB memory</p>
                  </div>

                  <div className="p-5 bg-white border border-[#E5E5E5] rounded-2xl text-center space-y-2">
                    <Key className="w-10 h-10 text-[#F59E0B] mx-auto opacity-75" />
                    <h3 className="text-sm font-bold text-[#222222]">Cryptographic Crypt Key</h3>
                    <p className="font-mono text-xs text-[#3B82F6] font-bold">AES-GCM-256 Symmetric</p>
                    <p className="text-[11px] text-[#666666]">Sealed thumbprints enabled</p>
                  </div>
                </div>

                {/* Multipliers & quota settings controllers */}
                <div className="saas-card p-5 bg-white space-y-4">
                  <span className="text-[10px] font-bold text-[#666666] uppercase block border-b border-[#E5E5E5] pb-2">Diagnostic Commands Console</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 bg-[#FAFAFA] rounded-xl border border-[#E5E5E5] space-y-2">
                      <h4 className="font-bold text-[#222222]">Local Session Reset</h4>
                      <p className="text-[#666666] leading-relaxed">Deletes temporary local storage data caches on the-fly and resets document profiles back to preloaded models.</p>
                      <button 
                        onClick={() => {
                          setDocuments(INITIAL_DOCUMENTS);
                          setFolders(INITIAL_FOLDERS);
                          setShares(INITIAL_SHARES);
                          setActivityLogs(INITIAL_LOGS);
                          showToast("Database refreshed back to INITIAL variables success.");
                        }}
                        className="bg-red-50 text-[#EF4444] border border-red-200 px-3 py-1.5 rounded font-bold text-xs"
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
                        className="bg-amber-50 text-[#F59E0B] border border-amber-200 px-3 py-1.5 rounded font-bold text-xs animate-pulse"
                      >
                        Simulate Sync Error
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* VIEW: AI SECURE AGENT SECTION */}
            {activeTab === 'AIAgent' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight text-[#222222] flex items-center gap-2">
                    <Brain className="w-5 h-5 text-[#3B82F6]" />
                    SECUREFILL AI Cryptographic Agent
                  </h2>
                  <p className="text-xs text-[#666666] font-semibold">
                    Interact with your sandboxed Gemini OCR parser. SECUREFILL AI keeps all models strictly client OR server-proxy side, with no vector exposure to public web databases.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Interactive Chat Interface (7 columns) */}
                  <div className="lg:col-span-7 flex flex-col bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden h-[580px] shadow-sm">
                    {/* Header */}
                    <div className="p-4 border-b border-[#E5E5E5] bg-[#FAFAFA] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] animate-pulse"></span>
                        <p className="text-xs font-bold text-[#222222] uppercase tracking-wider">Active Secure Session</p>
                      </div>
                      <span className="text-[10px] text-[#666666] font-mono bg-[#E5E5E5]/40 px-2 py-0.5 rounded font-bold">
                        AES-256 Enabled
                      </span>
                    </div>

                    {/* Chat Messages Log */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-4 no-scrollbar bg-[#FDFDFD]">
                      {assistantLogs.map((item, idx) => {
                        const isAi = item.sender === 'ai';
                        return (
                          <div
                            key={idx}
                            className={`flex flex-col ${isAi ? 'items-start' : 'items-end'}`}
                          >
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="text-[9px] font-bold text-[#666666] font-mono leading-none">
                                {isAi ? '🤖 SECUREFILL AGENT' : `👤 ${user.name}`}
                              </span>
                              <span className="text-[8px] text-[#999999] font-mono">
                                {item.timestamp}
                              </span>
                            </div>
                            <div
                              className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[85%] border shadow-xs whitespace-pre-line ${
                                isAi
                                  ? 'bg-white border-[#E5E5E5] text-[#222222]'
                                  : 'bg-[#222222] border-[#222222] text-white'
                              }`}
                            >
                              {item.text}
                            </div>
                          </div>
                        );
                      })}

                      {isThinking && (
                        <div className="flex items-center gap-2 text-xs text-[#666666] italic animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-bounce"></span>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-bounce delay-100"></span>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-bounce delay-200"></span>
                          Agent Decrypting OCR details...
                        </div>
                      )}
                    </div>

                    {/* Preset Suggestion Prompts */}
                    <div className="p-3 bg-[#FAFAFA] border-t border-[#E5E5E5] overflow-x-auto no-scrollbar whitespace-nowrap flex gap-2">
                      {[
                        "What is my Passport number and expiry?",
                        "What is my verified B.Tech degree score?",
                        "List my missing credentials for scholarships",
                        "Tell me my Aadhaar address details",
                        "Tell me about my PAN card status"
                      ].map((promptText, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setAiAssistantQuery(promptText);
                          }}
                          className="bg-white hover:bg-[#F5F5F5] border border-[#E5E5E5] text-[#222222] font-semibold text-[10px] px-2.5 py-1.5 rounded-full cursor-pointer transition-all shrink-0 shadow-xs"
                        >
                          💬 {promptText}
                        </button>
                      ))}
                    </div>

                    {/* Chat Input Field */}
                    <div className="p-4 border-t border-[#E5E5E5] bg-white">
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleAiAssistantSubmit();
                        }}
                        className="flex gap-2"
                      >
                        <input
                          type="text"
                          value={aiAssistantQuery}
                          onChange={(e) => setAiAssistantQuery(e.target.value)}
                          placeholder="Ask anything about your uploaded identities or documents..."
                          className="flex-1 bg-white border border-[#E5E5E5] rounded-xl px-4 py-2.5 text-xs text-[#222222] focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] outline-none font-sans"
                        />
                        <button
                          type="submit"
                          disabled={!aiAssistantQuery.trim() || isThinking}
                          className="bg-[#222222] hover:bg-[#333333] disabled:opacity-50 text-white font-bold text-xs uppercase px-5 py-2.5 rounded-xl transition-all shadow-sm shrink-0 cursor-pointer"
                        >
                          Ask Agent
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Right Column: Referenced Document Context Indexes (5 columns) */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="saas-card p-5 bg-white border border-[#E5E5E5] space-y-4">
                      <div>
                        <h3 className="font-bold text-xs uppercase text-[#666666] tracking-widest">Indexed Documents Context</h3>
                        <p className="text-[10px] text-[#666666] leading-relaxed mt-1">
                          Below are the active cryptographic vaults index files supplied as contextual system boundaries to Gemini for high-precision validation.
                        </p>
                      </div>

                      <div className="space-y-2.5 max-h-[350px] overflow-y-auto no-scrollbar pr-1 animate-fadeIn">
                        {documents.map((doc) => {
                          const isVerified = doc.verified;
                          return (
                            <div
                              key={doc.id}
                              onClick={() => {
                                setAiAssistantQuery(`Tell me about the document named "${doc.name}"`);
                              }}
                              className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl hover:border-[#3B82F6] hover:bg-blue-50/5 cursor-pointer text-left transition-all space-y-2"
                            >
                              <div className="flex items-start justify-between gap-1">
                                <p className="text-xs font-bold text-[#222222] truncate max-w-[200px]">{doc.name}</p>
                                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                  isVerified ? 'bg-[#DCFCE7] text-[#15803D]' : 'bg-[#FEF3C7] text-[#B45309]'
                                }`}>
                                  {isVerified ? 'Verified' : 'Pending'}
                                </span>
                              </div>
                              <p className="text-[10px] text-[#666666] line-clamp-1 italic">
                                "{doc.dataSummary}"
                              </p>
                              <div className="flex items-center gap-2 pt-1 border-t border-[#E5E5E5]/60 text-[9px] text-[#999999] font-mono">
                                <span>Size: {(doc.sizeBytes / 1024).toFixed(1)} KB</span>
                                <span>•</span>
                                <span>Cat: {doc.category}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="bg-[#EFF6FF] border border-[#BFDBFE] p-3.5 rounded-xl space-y-1.5 text-xs text-[#1E40AF]">
                        <h4 className="font-bold">🔒 Secure Local Privacy Shield</h4>
                        <p className="text-[10px] leading-relaxed text-[#1E40AF]/90">
                          Credentials do not leave your terminal sandbox. Gemini parses indexed values on-demand to answer details without training models on personal fields.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 6: SAAS SETTINGS & PROFILE */}
            {activeTab === 'Settings' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight text-[#222222]">SaaS Profile &amp; Keys Security</h2>
                  <p className="text-xs text-[#666666] font-semibold">Review your personal digital identity details, phone numbers, and manage secure biometric devices.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Personal info form (8 cols) */}
                  <div className="lg:col-span-8 space-y-4">
                    <div className="saas-card p-5 bg-white space-y-4">
                      <span className="text-[10px] font-bold text-[#666666] uppercase block border-b border-[#E5E5E5] pb-2">Google Authenticated Identity</span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#222222]">
                        <div className="space-y-1">
                          <label className="text-[#666666] block font-bold">Account Owner Name</label>
                          <input 
                            type="text" 
                            value={user.name} 
                            onChange={(e) => setUser(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full bg-[#FAFAFA] border border-[#E5E5E5] p-2 rounded-lg focus:ring-1 focus:ring-[#3B82F6] outline-none font-semibold text-[#222222]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[#666666] block font-bold">Email Address</label>
                          <input 
                            type="text" 
                            value={user.email} 
                            onChange={(e) => setUser(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full bg-[#FAFAFA] border border-[#E5E5E5] p-2 rounded-lg focus:ring-1 focus:ring-[#3B82F6] outline-none font-semibold text-[#222222]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[#666666] block font-bold">Phone Number</label>
                          <input 
                            type="text" 
                            value={user.phone} 
                            onChange={(e) => setUser(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full bg-[#FAFAFA] border border-[#E5E5E5] p-2 rounded-lg font-semibold text-[#222222]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[#666666] block font-bold">Physical Home Address</label>
                          <input 
                            type="text" 
                            value={user.address} 
                            onChange={(e) => setUser(prev => ({ ...prev, address: e.target.value }))}
                            className="w-full bg-[#FAFAFA] border border-[#E5E5E5] p-2 rounded-lg font-semibold text-[#222222]"
                          />
                        </div>

                        {/* Genuine Nominee Fields */}
                        <div className="space-y-1">
                          <label className="text-[#666666] block font-bold">Primary Nominee Name</label>
                          <input 
                            type="text" 
                            value={user.nomineeName || ''} 
                            onChange={(e) => setUser(prev => ({ ...prev, nomineeName: e.target.value }))}
                            className="w-full bg-[#EBF3FE] border border-[#3B82F6]/30 p-2 rounded-lg focus:ring-1 focus:ring-[#3B82F6] outline-none font-semibold text-[#222222]"
                            placeholder="Kavita Ghumarkar"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[#666666] block font-bold">Nominee Relationship</label>
                          <input 
                            type="text" 
                            value={user.nomineeRelationship || ''} 
                            onChange={(e) => setUser(prev => ({ ...prev, nomineeRelationship: e.target.value }))}
                            className="w-full bg-[#EBF3FE] border border-[#3B82F6]/30 p-2 rounded-lg focus:ring-1 focus:ring-[#3B82F6] outline-none font-semibold text-[#222222]"
                            placeholder="Spouse"
                          />
                        </div>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-[#E5E5E5]">
                        <span className="text-[10px] font-bold text-[#666666] uppercase block">Social Links Integrations</span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="p-2.5 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl text-center">
                            <span className="font-bold text-xs text-[#222222] block">GitHub Port</span>
                            <span className="font-mono text-[10px] text-[#3B82F6]">{user.socials.github}</span>
                          </div>
                          <div className="p-2.5 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl text-center">
                            <span className="font-bold text-xs text-[#222222] block">LinkedIn Port</span>
                            <span className="font-mono text-[10px] text-[#3B82F6]">{user.socials.linkedin}</span>
                          </div>
                          <div className="p-2.5 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl text-center">
                            <span className="font-bold text-xs text-[#222222] block">Personal Dev Port</span>
                            <span className="font-mono text-[10px] text-[#3B82F6]">{user.socials.portfolio}</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Device key locks settings (4 cols) */}
                  <div className="lg:col-span-4 space-y-4">
                    <div className="saas-card p-5 bg-[#FAFAFA] space-y-4">
                      <span className="text-[10px] font-bold text-[#666666] uppercase block pb-2 border-b border-[#E5E5E5]">Security Hardware Keys</span>
                      
                      <div className="space-y-4 text-xs text-[#222222]">
                        <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-[#E5E5E5]">
                          <div>
                            <span className="font-bold block">Biometric Finger Scan</span>
                            <span className="text-[10px] text-[#666666]">Enable one-touch thumb logins</span>
                          </div>
                          <button
                            onClick={toggleBiometricsSetting}
                            className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
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
                              setUser(prev => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }));
                              showToast(user.twoFactorEnabled ? "2FA disabled." : "Two-factor OTP restriction enabled.");
                            }}
                            className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                              user.twoFactorEnabled ? 'bg-[#22C55E]' : 'bg-[#E5E5E5]'
                            }`}
                          >
                            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                              user.twoFactorEnabled ? 'translate-x-5' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>

                        {/* Wall Setting: Unlock QR Code */}
                        <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-[#E5E5E5]">
                          <div>
                            <span className="font-bold block">Unlock QR Code</span>
                            <span className="text-[10px] text-[#666666]">Generates real-time encrypted asymmetric QR signatures to authenticate folders</span>
                          </div>
                          <button
                            onClick={() => {
                              setUnlockQrCodeEnabled(!unlockQrCodeEnabled);
                              showToast(!unlockQrCodeEnabled ? "🟢 Custom Unlock QR code activated! High-fidelity QR scan enabled." : "Unlock QR code deactivated.");
                            }}
                            className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                              unlockQrCodeEnabled ? 'bg-[#22C55E]' : 'bg-[#E5E5E5]'
                            }`}
                          >
                            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                              unlockQrCodeEnabled ? 'translate-x-5' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>

                        {/* Wall Setting: Scholarship Match */}
                        <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-[#E5E5E5]">
                          <div>
                            <span className="font-bold block">Scholarship Match</span>
                            <span className="text-[10px] text-[#666666]">Enables AI-driven parsing &amp; direct Academic Criteria mapping against active databases</span>
                          </div>
                          <button
                            onClick={() => {
                              setScholarshipMatchEnabled(!scholarshipMatchEnabled);
                              showToast(!scholarshipMatchEnabled ? "🟢 Academic Scholarship Match Engine activated!" : "Scholarship match engine deactivated.");
                            }}
                            className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
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
            )}

          </main>

        </div>
      )}

      {/* Floating System-Wide Alert/Toast Notify */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-8 right-8 glass-panel border-[#3B82F6] bg-white rounded-xl p-4 flex items-center gap-3 shadow-2xl z-50 text-xs text-[#222222] max-w-sm select-none"
          >
            <Check className="w-5 h-5 rounded-full bg-[#22C55E]/20 text-[#22C55E] flex-shrink-0 p-0.5 border border-[#22C55E]/30" />
            <p className="font-bold">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Biometric setup Modal */}
      <AnimatePresence>
        {biometricSetupModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#222222]/80 backdrop-blur-sm"
              onClick={() => setBiometricSetupModal(false)}
            ></motion.div>

            <motion.div 
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 10, opacity: 0 }}
              className="relative w-full max-w-sm bg-white border border-[#E5E5E5] rounded-2xl p-6 text-center shadow-2xl z-10 space-y-4"
            >
              <Fingerprint className="w-12 h-12 text-[#3B82F6] mx-auto animate-pulse" />
              <div>
                <h3 className="text-base font-bold text-[#222222]">Register Biometrics Key</h3>
                <p className="text-xs text-[#666666] mt-1">This binds your physical device scanner to the local symmetric sandbox key.</p>
              </div>

              <div className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg text-left text-[11px] space-y-1">
                <span className="font-bold text-[#222222]">Key Information:</span>
                <p className="text-[#666666]">Security Level: 4 (Uncompromised)</p>
                <p className="text-[#666666]">Standard algorithm: WebAuthn symmetric key pairs</p>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => setBiometricSetupModal(false)}
                  className="w-1/2 p-2 rounded-lg border border-[#E5E5E5] text-xs font-bold uppercase hover:bg-[#FAFAFA]"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmBiometricsRegister}
                  className="w-1/2 p-2 rounded-lg bg-[#222222] text-white text-xs font-bold uppercase hover:bg-[#333333]"
                >
                  Confirm Keys
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Interactive Folder Create Modal */}
      <AnimatePresence>
        {newFolderModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#222222]/80 backdrop-blur-sm"
              onClick={() => setNewFolderModal(false)}
            ></motion.div>

            <motion.div 
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 10, opacity: 0 }}
              className="relative w-full max-w-sm bg-white border border-[#E5E5E5] rounded-2xl p-6 shadow-2xl z-10 space-y-4"
            >
              <h3 className="text-sm font-bold text-[#222222] uppercase tracking-wider">Create New Folder Directory</h3>
              
              <div className="space-y-2 text-xs">
                <label className="text-[#666666] block">Folder Name</label>
                <input 
                  type="text" 
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="e.g. Finance Certificates, Tax Proofs..."
                  className="w-full bg-[#FAFAFA] border border-[#E5E5E5] p-2.5 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#3B82F6]"
                />
              </div>

              <div className="space-y-2 text-xs">
                <label className="text-[#666666] block">Optional: Parent Directory Folder</label>
                <select 
                  className="w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg p-2 text-xs text-[#222222]"
                  value={selectedParentId || ""}
                  onChange={(e) => setSelectedParentId(e.target.value || null)}
                >
                  <option value="">-- None (Root directory) --</option>
                  {folders.filter(f => !f.parentId).map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 text-xs">
                <button 
                  onClick={() => setNewFolderModal(false)}
                  className="w-1/2 p-2 rounded-lg border border-[#E5E5E5] font-bold uppercase hover:bg-[#FAFAFA]"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateNewFolder}
                  className="w-1/2 p-2 rounded-lg bg-[#222222] text-white font-bold uppercase hover:bg-[#333333]"
                >
                  Create Directory
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dynamic Animated Quick Preview Overlay */}
      <AnimatePresence>
        {quickPreviewDoc && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#222222]/80 backdrop-blur-sm"
              onClick={() => setQuickPreviewDoc(null)}
            ></motion.div>

            <motion.div 
              initial={{ scale: 0.95, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="relative w-full max-w-4xl bg-white border border-[#E5E5E5] rounded-2xl shadow-2xl z-20 overflow-hidden grid grid-cols-1 md:grid-cols-12 h-[80vh]"
            >
              <div className="md:col-span-8 bg-[#FAFAFA] flex flex-col justify-between p-4 relative border-r border-[#E5E5E5]">
                {/* Simulated Viewer with Zoom and Rotation */}
                <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-2 text-xs">
                  <span className="font-bold text-[#222222] font-mono">{quickPreviewDoc.filename}</span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setPreviewZoom(prev => Math.max(50, prev - 20))}
                      className="p-1.5 rounded border border-[#E5E5E5] bg-white text-[#222222] hover:bg-[#FAFAFA]"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono font-bold">{previewZoom}%</span>
                    <button 
                      onClick={() => setPreviewZoom(prev => Math.min(200, prev + 20))}
                      className="p-1.5 rounded border border-[#E5E5E5] bg-white text-[#222222] hover:bg-[#FAFAFA]"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => setPreviewRotation(prev => (prev + 90) % 360)}
                      className="p-1.5 rounded border border-[#E5E5E5] bg-white text-[#222222] hover:bg-[#FAFAFA] ml-1"
                      title="Rotate 90°"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 flex items-center justify-center overflow-hidden p-6 relative">
                  <div 
                    style={{ 
                      transform: `scale(${previewZoom / 100}) rotate(${previewRotation}deg)`, 
                      transition: 'transform 0.2s ease-out' 
                    }}
                    className="w-full max-w-sm aspect-[3/4] bg-white border border-[#E5E5E5] rounded-xl shadow-md p-6 flex flex-col justify-between relative overflow-hidden"
                  >
                    {/* Watermark security line */}
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 -rotate-12 pointer-events-none opacity-[0.03] flex flex-col items-center">
                      <span className="text-3xl font-black tracking-widest text-[#222222] uppercase">SECUREFILL VERIFIED</span>
                      <span className="text-xs text-center font-mono">HASH: 0x932F...8A92</span>
                    </div>

                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-[#222222] rounded flex items-center justify-center">
                          <ShieldCheck className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-left leading-tight">
                          <p className="text-[10px] font-bold text-[#222222] uppercase tracking-wider">SECURE DIGITAL VAULT</p>
                          <p className="text-[8px] text-[#666666] font-mono">Symmetric Encrypted</p>
                        </div>
                      </div>
                      <span className="text-[10px] bg-[#3B82F6]/10 text-[#3B82F6] font-bold px-2 py-0.5 rounded border border-[#3B82F6]/20">A.I. Extracted</span>
                    </div>

                    {/* Form fields visual */}
                    <div className="space-y-3.5 text-left pt-2">
                      <div className="border-b border-[#E1E1E1] pb-1">
                        <span className="text-[8px] text-[#666666] uppercase block">Assigned Owner Name:</span>
                        <span className="text-xs font-black text-[#222222] font-mono">{quickPreviewDoc.metadata?.extractedName || "Ashish Ghumarkar"}</span>
                      </div>
                      <div className="border-b border-[#E1E1E1] pb-1">
                        <span className="text-[8px] text-[#666666] uppercase block">Extracted Identifier Number:</span>
                        <span className="text-xs font-black text-[#222222] font-mono">{quickPreviewDoc.dataSummary || "UID: **** **** 1092"}</span>
                      </div>
                      <div className="border-b border-[#E1E1E1] pb-1">
                        <span className="text-[8px] text-[#666666] uppercase block">Institution Name:</span>
                        <span className="text-xs font-semibold text-[#222222] font-mono">{quickPreviewDoc.metadata?.institutionName || "LNCT University"}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[9px] font-mono border-t border-[#E5E5E5] pt-2">
                      <span className="text-[#666666]">Issued: {quickPreviewDoc.metadata?.extractedDate || "N/A"}</span>
                      <span className="text-[#EF4444] font-bold">Expires: {quickPreviewDoc.metadata?.expiryDate || "NEVER"}</span>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-[#666666] text-center pt-2 border-t border-[#E5E5E5]">
                  Symmetric client decrypted scan visualization. Decryption Key verified against biometric secure enclave hardware.
                </div>
              </div>

              {/* Sidebar metadata details view */}
              <div className="md:col-span-4 p-5 flex flex-col justify-between h-full bg-white">
                <div className="space-y-4 text-xs">
                  <div className="flex justify-between items-start border-b border-[#E5E5E5] pb-3">
                    <div>
                      <h3 className="text-sm font-black text-[#222222]">{quickPreviewDoc.name}</h3>
                      <p className="text-[10px] text-[#666666] uppercase font-bold mt-0.5">{quickPreviewDoc.category} Asset</p>
                    </div>
                    <button 
                      onClick={() => setQuickPreviewDoc(null)}
                      className="p-1 rounded hover:bg-[#FAFAFA]"
                    >
                      <X className="w-4 h-4 text-[#666666]" />
                    </button>
                  </div>

                  {/* Complete Metadata list */}
                  <div className="space-y-3 pt-2">
                    <span className="text-[10px] tracking-widest uppercase font-bold text-[#666666] block">A.I. Smart Tag &amp; Metadata</span>
                    
                    <div className="bg-[#FAFAFA] border border-[#E5E5E5] p-3.5 rounded-xl space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[#666666]">Processing Tag:</span>
                        <span className="bg-[#22C55E]/10 text-[#22C55E] px-2 py-0.5 rounded font-black text-[10px] uppercase border border-[#22C55E]/20">{quickPreviewDoc.status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#666666]">File size:</span>
                        <span className="font-mono font-semibold">{(quickPreviewDoc.sizeBytes / 1024).toFixed(1)} KB</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#666666]">Upload Ledger:</span>
                        <span className="font-mono font-semibold">{quickPreviewDoc.uploadDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#666666]">Verified:</span>
                        <span className="text-[#22C55E] font-bold">✓ AUTHENTIC</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] tracking-widest uppercase font-bold text-[#666666] block">Document Contents:</span>
                      <div className="bg-[#FAFAFA] border border-[#E5E5E5] p-3 rounded-xl font-mono text-[10px] text-[#666666] whitespace-pre-line leading-relaxed max-h-36 overflow-y-auto no-scrollbar">
                        {quickPreviewDoc.dataSummary}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-[#E5E5E5]">
                  <button 
                    onClick={() => {
                      setQuickPreviewDoc(null);
                      setSelectedDocForQR(quickPreviewDoc);
                      setActiveTab('QRShare');
                    }}
                    className="w-full bg-[#222222] hover:bg-[#333333] text-white font-bold p-2.5 rounded-lg flex items-center justify-center gap-1 text-xs uppercase"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Core QR Share Link
                  </button>
                  <button 
                    onClick={() => {
                      setQuickPreviewDoc(null);
                      showToast("Document downloaded successfully.");
                    }}
                    className="w-full bg-[#FAFAFA] hover:bg-[#F5F5F5] border border-[#E5E5E5] text-[#222222] font-bold p-2.5 rounded-lg flex items-center justify-center gap-1 text-xs uppercase"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Encrypted PDF
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
