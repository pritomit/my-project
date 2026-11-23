import React from "react";
import {
  Phone,
  Video,
  Info,
  ShieldCheck,
  UserCheck,
  Trash2,
  Database,
  ArrowLeftRight,
  Sparkles,
} from "lucide-react";
import { formatLastSeen } from "../lib/firebase";

interface ChatHeaderProps {
  currentRole: "user" | "admin";
  chatPartnerName: string;
  isPartnerOnline: boolean;
  partnerLastSeen: number;
  isPartnerTyping?: boolean;
  onOpenSpecsModal: () => void;
  onOpenAdminLogin: () => void;
  onSwitchToUser: () => void;
  onClearChat?: () => void;
  onToggleSidebarMobile?: () => void;
  showSidebarToggle?: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  currentRole,
  chatPartnerName,
  isPartnerOnline,
  partnerLastSeen,
  isPartnerTyping,
  onOpenSpecsModal,
  onOpenAdminLogin,
  onSwitchToUser,
  onClearChat,
  onToggleSidebarMobile,
  showSidebarToggle,
}) => {
  return (
    <header className="h-16 border-b border-neutral-800 bg-neutral-900/90 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-20 select-none">
      <div className="flex items-center space-x-3 min-w-0">
        {showSidebarToggle && (
          <button
            onClick={onToggleSidebarMobile}
            className="md:hidden p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
            title="Conversations"
          >
            <ArrowLeftRight className="w-5 h-5" />
          </button>
        )}

        {/* User Avatar with gradient ring */}
        <div className="relative shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-0.5 shadow-md">
            <div className="w-full h-full bg-neutral-800 rounded-full flex items-center justify-center text-white font-bold text-sm uppercase">
              {chatPartnerName.slice(0, 2)}
            </div>
          </div>
          {isPartnerOnline && (
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-neutral-900 rounded-full shadow-lg shadow-emerald-500/50 animate-pulse" />
          )}
        </div>

        {/* Name and Active status */}
        <div className="min-w-0 flex flex-col">
          <div className="flex items-center space-x-2">
            <h2 className="text-sm font-bold text-white truncate max-w-[150px] sm:max-w-[220px]">
              {chatPartnerName}
            </h2>

            {currentRole === "admin" ? (
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full flex items-center space-x-1 shrink-0">
                <ShieldCheck className="w-3 h-3" />
                <span>Client Thread</span>
              </span>
            ) : (
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full flex items-center space-x-1 shrink-0">
                <UserCheck className="w-3 h-3" />
                <span>Verified Admin</span>
              </span>
            )}
          </div>

          <span className="text-xs text-neutral-400 truncate">
            {isPartnerTyping ? (
              <span className="text-rose-400 font-medium animate-pulse">
                typing...
              </span>
            ) : isPartnerOnline ? (
              <span className="text-emerald-400 font-medium">Active now</span>
            ) : (
              formatLastSeen(partnerLastSeen)
            )}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-1.5 sm:space-x-2">
        {/* Call icons (Design Polish) */}
        <button
          onClick={() => alert("Voice calling simulation initiated!")}
          className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors hidden sm:flex cursor-pointer"
          title="Audio Call"
        >
          <Phone className="w-5 h-5" />
        </button>

        <button
          onClick={() => alert("Video calling simulation initiated!")}
          className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors hidden sm:flex cursor-pointer"
          title="Video Call"
        >
          <Video className="w-5 h-5" />
        </button>

        {/* Firestore Architecture Specs Button */}
        <button
          onClick={onOpenSpecsModal}
          className="p-2 text-neutral-400 hover:text-indigo-400 rounded-full hover:bg-neutral-800 transition-colors cursor-pointer"
          title="View Database & Security Rules Architecture"
        >
          <Database className="w-5 h-5" />
        </button>

        {/* Clear Chat (Admin only) */}
        {currentRole === "admin" && onClearChat && (
          <button
            onClick={() => {
              if (confirm("Are you sure you want to clear this entire chat thread?")) {
                onClearChat();
              }
            }}
            className="p-2 text-neutral-400 hover:text-rose-400 rounded-full hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Clear Thread History"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}

        {/* Role Toggle Switcher */}
        {currentRole === "user" ? (
          <button
            onClick={onOpenAdminLogin}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white text-xs font-semibold rounded-xl border border-neutral-700 flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Admin Mode</span>
          </button>
        ) : (
          <button
            onClick={onSwitchToUser}
            className="px-3 py-1.5 bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-all shadow-md cursor-pointer"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">User Mode</span>
          </button>
        )}
      </div>
    </header>
  );
};
