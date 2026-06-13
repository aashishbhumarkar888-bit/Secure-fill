import { Bell, ChevronDown, RefreshCw, Settings, LogOut, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppNotification } from '../../types';

interface NavbarProps {
  isLoggedIn: boolean;
  user: any;
  currentSyncStatus: 'Synced' | 'Syncing' | 'Failed' | 'Pending';
  syncProgress: number;
  lastSyncTime: string;
  triggerManualCloudSync: () => void;
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  showNotificationsDropdown: boolean;
  setShowNotificationsDropdown: (show: boolean) => void;
  showProfileDropdown: boolean;
  setShowProfileDropdown: (show: boolean) => void;
  handleMarkAllNotificationsAsRead: () => void;
  preloadDemoHackathonData: () => void;
  setActiveTab: (tab: string) => void;
  handleLogout: () => void;
  setShowGoogleLoginChooser: (show: boolean) => void;
}

export default function Navbar({
  isLoggedIn,
  user,
  currentSyncStatus,
  syncProgress,
  lastSyncTime,
  triggerManualCloudSync,
  notifications,
  unreadNotificationsCount,
  showNotificationsDropdown,
  setShowNotificationsDropdown,
  showProfileDropdown,
  setShowProfileDropdown,
  handleMarkAllNotificationsAsRead,
  preloadDemoHackathonData,
  setActiveTab,
  handleLogout,
  setShowGoogleLoginChooser
}: NavbarProps) {
  return (
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

      <div className="flex items-center gap-4">
        {isLoggedIn && (
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
        )}

        {isLoggedIn && (
          <div className="relative">
            <button 
              onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
              className="p-2.5 rounded-lg border border-[#E5E5E5] bg-white hover:bg-[#FAFAFA] text-[#222222] relative transition-colors cursor-pointer"
              title="Alert Notifications"
            >
              <Bell className="w-4 h-4 text-[#222222]" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#EF4444] text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

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
                          <div className="flex justify-between font-bold text-[#222222]">
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
        )}

        <div className="relative flex items-center">
          <button 
            onClick={() => {
              if (isLoggedIn) {
                setShowProfileDropdown(!showProfileDropdown);
              } else {
                setShowGoogleLoginChooser(true);
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

          <AnimatePresence>
            {isLoggedIn && showProfileDropdown && (
              <>
                <div className="fixed inset-0 z-40 cursor-default" onClick={() => setShowProfileDropdown(false)} />
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

                  <div className="space-y-1.5 pt-1.5">
                    <button 
                      onClick={() => {
                        preloadDemoHackathonData();
                        setShowProfileDropdown(false);
                      }}
                      className="w-full text-center font-bold text-xs p-2.5 bg-[#3B82F6]/10 text-[#3B82F6] hover:bg-[#3B82F6]/20 border border-[#3B82F6]/20 rounded-lg cursor-pointer transition-colors block"
                    >
                      ⚡ Preload Demo Data
                    </button>

                    <button 
                      onClick={() => {
                        setActiveTab('Settings');
                        setShowProfileDropdown(false);
                      }}
                      className="w-full text-left font-bold text-xs p-2 hover:bg-[#FAFAFA] rounded-lg text-[#222222] transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5 text-[#3B82F6]" />
                      Settings &amp; Credentials
                    </button>

                    <button 
                      onClick={() => {
                        handleLogout();
                        setShowProfileDropdown(false);
                      }}
                      className="w-full text-left font-bold text-xs p-2 hover:bg-red-50 rounded-lg text-[#EF4444] transition-colors flex items-center gap-2 border border-dashed border-[#EF4444]/20 cursor-pointer"
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
  );
}
