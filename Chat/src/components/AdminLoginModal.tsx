import React, { useState } from "react";
import { ShieldAlert, KeyRound, ArrowRight, X, Info } from "lucide-react";

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (token: string) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [passphrase, setPassphrase] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passphrase) {
      setError("Please enter the admin passphrase.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (passphrase === "admin123" || passphrase === import.meta.env.VITE_ADMIN_PASSPHRASE) {
        onLoginSuccess("admin-secret-token");
        setPassphrase("");
        onClose();
      } else {
        setError("Invalid passphrase.");
      }
    } catch (err) {
      setError("Failed to authenticate.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-7 max-w-md w-full shadow-2xl relative overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-full hover:bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Decorative bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-500" />

        <div className="flex flex-col items-center text-center mb-6 pt-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-rose-500/20 border border-amber-500/30 flex items-center justify-center mb-3">
            <ShieldAlert className="w-7 h-7 text-amber-400" />
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">Admin Dashboard Authentication</h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-xs">
            Enter admin credentials to access user threads, moderate chat, and reply in real-time.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
              Admin Passphrase
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                <KeyRound className="w-5 h-5" />
              </div>
              <input
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Enter passphrase..."
                autoFocus
                className="w-full bg-neutral-800/80 border border-neutral-700/80 rounded-xl pl-10 pr-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-sm font-medium"
              />
            </div>
            {error && <p className="text-rose-400 text-xs mt-1.5 font-medium">{error}</p>}
          </div>

          <div className="p-3 bg-neutral-800/50 border border-neutral-800 rounded-xl flex items-start space-x-2 text-xs text-neutral-400">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              Default demo passphrase is <strong className="text-amber-300 font-mono">admin123</strong> (configurable via <code className="text-neutral-300 font-mono">ADMIN_PASSPHRASE</code> env).
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all transform active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? "Authenticating..." : "Access Admin Console"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
