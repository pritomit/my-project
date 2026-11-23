import React, { useState } from "react";
import { MessageSquare, User, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

interface UserLoginModalProps {
  isOpen: boolean;
  onLogin: (username: string) => void;
  onSwitchToAdmin: () => void;
  savedUsername?: string;
}

export const UserLoginModal: React.FC<UserLoginModalProps> = ({
  isOpen,
  onLogin,
  onSwitchToAdmin,
  savedUsername,
}) => {
  const [username, setUsername] = useState(savedUsername || "");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) {
      setError("Please enter a valid username.");
      return;
    }
    if (trimmed.length < 2) {
      setError("Username must be at least 2 characters.");
      return;
    }
    if (trimmed.length > 25) {
      setError("Username must be 25 characters or less.");
      return;
    }
    setError("");
    onLogin(trimmed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
        {/* Decorative Top Gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500" />

        {/* Instagram DM Icon Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-0.5 shadow-lg shadow-rose-500/20 mb-4 flex items-center justify-center">
            <div className="w-full h-full bg-neutral-900 rounded-[14px] flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-rose-500" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white tracking-tight">Direct Messages</h2>
          <p className="text-sm text-neutral-400 mt-1 max-w-xs">
            Connect privately in real-time with the admin team
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Choose your username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. alex_dev, sarah99"
                autoFocus
                className="w-full bg-neutral-800/80 border border-neutral-700/80 rounded-xl pl-10 pr-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all text-sm font-medium"
              />
            </div>
            {error && <p className="text-rose-400 text-xs mt-1.5 font-medium">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 hover:from-rose-600 hover:via-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 flex items-center justify-center space-x-2 transition-all transform active:scale-[0.98] cursor-pointer"
          >
            <span>Start Private Chat</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Informational privacy pill */}
        <div className="mt-6 pt-5 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-500">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Strict 1-to-1 Privacy</span>
          </div>

          <button
            onClick={onSwitchToAdmin}
            className="text-neutral-400 hover:text-white flex items-center space-x-1 transition-colors font-medium underline underline-offset-2 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Admin Login</span>
          </button>
        </div>
      </div>
    </div>
  );
};
