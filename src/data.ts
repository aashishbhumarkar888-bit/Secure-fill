import { DocumentItem, FolderItem, OpportunityItem, ActivityLogItem, AppNotification, ShareConfig } from './types';

export const INITIAL_USER = {
  name: "Ashish Ghumarkar",
  email: "aashishbhumarkar888@gmail.com",
  phone: "+91 98765 43210",
  address: "M-12, Arera Colony, Bhopal, Madhya Pradesh, India",
  photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200", // real-looking male photo
  nomineeName: "Kavita Ghumarkar",
  nomineeRelationship: "Spouse",
  socials: {
    github: "github.com/ashish_ghumarkar",
    linkedin: "linkedin.com/in/ashish_ghumarkar",
    portfolio: "ashishghumarkar.dev"
  },
  biometricsEnabled: true,
  twoFactorEnabled: false,
  authenticated: true,
  provider: 'Google'
};

export const INITIAL_FOLDERS: FolderItem[] = [
  { id: 'fol-1', name: 'Personal Documents', parentId: null },
  { id: 'fol-2', name: 'Certificates', parentId: null },
  { id: 'fol-3', name: 'Education', parentId: null },
  { id: 'fol-4', name: 'Work Experience', parentId: null },
  { id: 'fol-5', name: 'Finance', parentId: null },
  { id: 'fol-6', name: 'Sub-Certificates (AI)', parentId: 'fol-2' }, // Nested folder
];

export const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: "doc-1",
    name: "Ashish_Ghumarkar_Passport_Photo.jpg",
    filename: "Ashish_Ghumarkar_Passport_Photo.jpg",
    category: 'Identity',
    status: 'Secure',
    dataSummary: "Passport photo • white background • ID-sealed",
    secureShare: true,
    verified: true,
    sizeBytes: 1547200,
    uploadDate: "2026-06-11T14:30:00Z",
    folderId: 'fol-1',
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600",
    metadata: {
      extractedName: "Ashish Ghumarkar",
      extractedDate: "2026-05-10",
      documentType: "Passport Photo",
      expiryDate: "2036-05-10",
      institutionName: "Passport Seva Kendra"
    }
  },
  {
    id: "doc-2",
    name: "Ashish_Ghumarkar_Bachelors_Degree.pdf",
    filename: "Ashish_Ghumarkar_Bachelors_Degree.pdf",
    category: 'Education',
    status: 'Secure',
    dataSummary: "B.Tech Graduation Certificate • LNCT University",
    secureShare: true,
    verified: true,
    sizeBytes: 2560000,
    uploadDate: "2026-06-12T08:15:00Z",
    folderId: 'fol-3',
    imageUrl: "https://images.unsplash.com/photo-1589330273594-fade1ee91647?auto=format&fit=crop&q=80&w=600",
    metadata: {
      extractedName: "Ashish Ghumarkar",
      extractedDate: "2024-06-20",
      documentType: "Degree Certificate",
      expiryDate: "N/A",
      institutionName: "LNCT University"
    }
  },
  {
    id: "doc-3",
    name: "Aadhaar Card Scan",
    filename: "Aadhaar_Card_Verified.pdf",
    category: 'Identity',
    status: 'Secure',
    dataSummary: "UIDAI National Registry • Verified Level 4",
    secureShare: false,
    verified: true,
    sizeBytes: 840000,
    uploadDate: "2026-05-01T09:00:00Z",
    folderId: 'fol-1',
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600",
    metadata: {
      extractedName: "Ashish Ghumarkar",
      extractedDate: "2018-02-12",
      documentType: "Identity Card",
      expiryDate: "Never",
      institutionName: "UIDAI Government of India"
    }
  },
  {
    id: "doc-4",
    name: "PAN Card Document",
    filename: "PAN_Card_Encrypted.pdf",
    category: 'Identity',
    status: 'Secure',
    dataSummary: "Permanent Account Number • Income Tax Dept",
    secureShare: false,
    verified: true,
    sizeBytes: 670000,
    uploadDate: "2026-05-05T11:20:00Z",
    folderId: 'fol-1',
    imageUrl: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=600",
    metadata: {
      extractedName: "Ashish Ghumarkar",
      extractedDate: "2020-10-18",
      documentType: "Tax Identity Card",
      expiryDate: "Never",
      institutionName: "NSDL Income Tax Department"
    }
  },
  {
    id: "doc-5",
    name: "Technical Portfolio CV 2026",
    filename: "Ashish_Ghumarkar_CV_Fullstack.pdf",
    category: 'Professional',
    status: 'AI-Processed',
    dataSummary: "Full-Stack Software Engineer Industry Resume",
    secureShare: true,
    verified: false,
    sizeBytes: 1120000,
    uploadDate: "2026-06-10T15:00:00Z",
    folderId: 'fol-4',
    imageUrl: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=600",
    metadata: {
      extractedName: "Ashish Ghumarkar",
      extractedDate: "2026-06-01",
      documentType: "Resume",
      expiryDate: "N/A",
      institutionName: "Self-Authored Credentials"
    }
  },
  {
    id: "doc-6",
    name: "Passport Booklet Scan",
    filename: "Ashish_Ghumarkar_Passport.pdf",
    category: 'Identity',
    status: 'Action Needed',
    dataSummary: "Expiring soon • Action Required",
    secureShare: false,
    verified: true,
    sizeBytes: 2900000,
    uploadDate: "2026-01-10T12:00:00Z",
    folderId: 'fol-1',
    expiresInDays: 45,
    imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600",
    metadata: {
      extractedName: "Ashish Ghumarkar",
      extractedDate: "2016-07-28",
      documentType: "Passport Booklet",
      expiryDate: "2026-07-28",
      institutionName: "Indian Ministry of External Affairs"
    }
  },
  {
    id: "doc-7",
    name: "Duplicate_Bachelors_Degree_Signed.pdf",
    filename: "Duplicate_Bachelors_Degree_Signed.pdf",
    category: 'Education',
    status: 'Secure',
    dataSummary: "Detected identical hash with LNCT Bachelors degree",
    secureShare: false,
    verified: false,
    sizeBytes: 2560000,
    uploadDate: "2026-06-12T09:00:00Z",
    folderId: 'fol-3',
    imageUrl: "https://images.unsplash.com/photo-1589330273594-fade1ee91647?auto=format&fit=crop&q=80&w=600",
    metadata: {
      extractedName: "Ashish Ghumarkar",
      extractedDate: "2024-06-20",
      documentType: "Degree Certificate",
      expiryDate: "N/A",
      institutionName: "LNCT University Board"
    }
  }
];

export const INITIAL_SHARES: ShareConfig[] = [
  {
    id: "sh-1",
    documentId: "doc-1",
    viewOnly: true,
    downloadAllowed: false,
    passwordProtected: true,
    password: "securepassword",
    expiryDate: "2026-06-20",
    qrCodeUrl: "Default_QR_Base_64_Code",
    scanCount: 15,
    lastScan: "10 mins ago",
    deviceType: "Mobile (iPhone)",
    location: "Bhopal, MP",
    downloadCount: 0
  },
  {
    id: "sh-2",
    documentId: "doc-2",
    viewOnly: false,
    downloadAllowed: true,
    passwordProtected: false,
    expiryDate: "2026-07-01",
    qrCodeUrl: "Default_License_QR",
    scanCount: 42,
    lastScan: "1 hour ago",
    deviceType: "Desktop (Chrome/Linux)",
    location: "New Delhi, India",
    downloadCount: 24
  },
  {
    id: "sh-3",
    documentId: "doc-5",
    viewOnly: true,
    downloadAllowed: true,
    passwordProtected: false,
    expiryDate: "2026-08-15",
    qrCodeUrl: "Default_Resume_QR",
    scanCount: 9,
    lastScan: "1 day ago",
    deviceType: "Mobile (Android)",
    location: "San Francisco, US",
    downloadCount: 5
  }
];

export const INITIAL_LOGS: ActivityLogItem[] = [
  {
    id: "log-1",
    timestamp: "2026-06-12T10:05:00Z",
    action: "Login",
    device: "Chrome v124 (MacBook Pro)",
    ipAddress: "192.168.1.52 (Local)",
    status: "Success",
    details: "Google Sign-In authorized via account aashishbhumarkar888@gmail.com"
  },
  {
    id: "log-2",
    timestamp: "2026-06-12T09:50:00Z",
    action: "Sync",
    device: "Background Cron Job",
    ipAddress: "10.0.0.1 (System Cloud Run)",
    status: "Success",
    details: "Identity registry synchronized with government databases successfully"
  },
  {
    id: "log-3",
    timestamp: "2026-06-12T09:12:00Z",
    action: "Upload",
    device: "Chrome v124 (MacBook Pro)",
    ipAddress: "192.168.1.52 (Local)",
    status: "Success",
    details: "Uploaded file 'IMG_78282.jpg' - dynamically renamed to 'Ashish_Ghumarkar_Passport_Photo.jpg'"
  },
  {
    id: "log-4",
    timestamp: "2026-06-12T09:15:00Z",
    action: "QR Scan",
    device: "Safari v17.2 (iPhone 15)",
    ipAddress: "103.241.12.84",
    status: "Success",
    details: "QR scan checked for Ashish_Ghumarkar_Bachelors_Degree.pdf. Location: Bhopal, MP"
  },
  {
    id: "log-5",
    timestamp: "2026-06-12T08:00:00Z",
    action: "Share",
    device: "Chrome v124 (MacBook Pro)",
    ipAddress: "192.168.1.52 (Local)",
    status: "Success",
    details: "Configured secure download option for Technical Resume 2026 with expiry 2026-08-15"
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "not-1",
    type: "upload_complete",
    title: "Upload complete",
    message: "Ashish_Ghumarkar_Bachelors_Degree.pdf has been successfully verified via LNCT Registry.",
    timestamp: "15 mins ago",
    read: false
  },
  {
    id: "not-2",
    type: "qr_scanned",
    title: "QR Code scanned",
    message: "A recipient in Bhopal, MP, scanned your shared Passport Photo QR link.",
    timestamp: "10 mins ago",
    read: false
  },
  {
    id: "not-3",
    type: "document_expiring",
    title: "Document expiring",
    message: "Your primary Passport Booklet expires in 45 days. Renew now to avoid lock.",
    timestamp: "2 hours ago",
    read: true
  }
];

export const OPPORTUNITIES: OpportunityItem[] = [
  {
    id: "opp-1",
    title: "Global Tech Innovation Grant",
    matchScore: 100,
    category: "Grant • Tech Innovation",
    rewardDetails: "$15,000 Award",
    isBookmarked: false
  },
  {
    id: "opp-2",
    title: "Senior AI Architect Post-doc",
    matchScore: 94,
    category: "Fellowship • Remote Research",
    rewardDetails: "$7,500 / mo",
    isBookmarked: true
  },
  {
    id: "opp-3",
    title: "National Merit Fellowship Research",
    matchScore: 89,
    category: "Full-Time Research • 6 Months",
    rewardDetails: "Fully Funded + Travel stipend",
    isBookmarked: false
  }
];
