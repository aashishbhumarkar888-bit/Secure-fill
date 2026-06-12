export interface DocumentItem {
  id: string;
  name: string;
  filename: string;
  category: 'Identity' | 'Education' | 'Professional' | 'Financial' | 'Other';
  status: 'Secure' | 'AI-Processed' | 'Action Needed';
  dataSummary: string;
  secureShare: boolean;
  verified: boolean;
  expiresInDays?: number;
  sizeBytes: number;
  uploadDate: string;
  folderId?: string | null;
  imageUrl?: string;
  // OCR Extracted Metadata
  metadata?: {
    extractedName?: string;
    extractedDate?: string;
    documentType?: string;
    expiryDate?: string;
    institutionName?: string;
  };
}

export interface FolderItem {
  id: string;
  name: string;
  parentId: string | null; // Support nested and hierarchical folders
  isSmart?: boolean;
  smartType?: 'Certificates' | 'Government IDs' | 'Resumes' | 'Shared Files' | 'Recently Uploaded';
}

export interface ShareConfig {
  id: string;
  documentId: string;
  viewOnly: boolean;
  downloadAllowed: boolean;
  passwordProtected: boolean;
  password?: string;
  expiryDate?: string;
  qrCodeUrl: string; // Base64 or mock SVG
  scanCount: number;
  lastScan?: string;
  deviceType?: string;
  location?: string;
  downloadCount: number;
}

export interface OpportunityItem {
  id: string;
  title: string;
  matchScore: number;
  category: string;
  rewardDetails: string;
  isBookmarked?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  embeddedCard?: {
    title: string;
    matchText: string;
    progressPercent: number;
  };
}

export interface FieldMapping {
  fieldId: string;
  fieldName: string;
  vaultSource: string;
  vaultValue: string;
  iconName: string;
  sourceIcon: string;
}

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  action: 'Login' | 'Logout' | 'Upload' | 'Download' | 'Delete' | 'Share' | 'QR Scan' | 'Export' | 'Sync';
  device: string;
  ipAddress: string;
  status: 'Success' | 'Warning' | 'Error';
  details: string;
}

export interface AppNotification {
  id: string;
  type: 'upload_complete' | 'download_complete' | 'qr_scanned' | 'share_expired' | 'document_expiring' | 'storage_limit' | 'new_device';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}
