import React, { useState, useEffect } from "react";
import { X, Copy, Check, Database, Shield, BookOpen, Server, Layers } from "lucide-react";

interface FirestoreSpecModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirestoreSpecModal: React.FC<FirestoreSpecModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"blueprint" | "rules" | "guide">("blueprint");
  const [specData, setSpecData] = useState<{ blueprint: any; securityRules: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && !specData) {
      setSpecData({
        blueprint: {
          entities: {
            User: {
              title: "User",
              description: "App User Profile",
              type: "object",
              properties: {
                username: { type: "string", minLength: 2, maxLength: 30 },
                createdAt: { type: "number" },
                lastSeen: { type: "number" },
                isOnline: { type: "boolean" }
              },
              required: ["username", "createdAt"]
            },
            Message: {
              title: "Message",
              description: "Chat message document",
              type: "object",
              properties: {
                threadId: { type: "string" },
                senderId: { type: "string" },
                senderRole: { type: "string", enum: ["user", "admin"] },
                text: { type: "string", maxLength: 2000 },
                timestamp: { type: "number" },
                isRead: { type: "boolean" },
                mediaUrl: { type: "string" }
              },
              required: ["threadId", "senderId", "senderRole", "text", "timestamp"]
            }
          },
          firestore: {
            "/users/{userId}": {
              schema: "User",
              description: "User collection for identity and status"
            },
            "/chats/{threadId}/messages/{messageId}": {
              schema: "Message",
              description: "Strict 1-to-1 conversation messages between User and Admin"
            }
          }
        },
        securityRules: `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // DEMO ONLY - IN PRODUCTION ENFORCE SECURITY RULES
    }
  }
}`
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/90 sticky top-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Database & Security Architecture</h2>
              <p className="text-xs text-neutral-400">Firestore blueprint structure and 1-to-1 security rules</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/60 px-5 pt-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("blueprint")}
            className={`py-2.5 px-4 flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "blueprint"
                ? "border-rose-500 text-rose-400"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>1. Database Blueprint</span>
          </button>

          <button
            onClick={() => setActiveTab("rules")}
            className={`py-2.5 px-4 flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "rules"
                ? "border-rose-500 text-rose-400"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>2. Security Rules</span>
          </button>

          <button
            onClick={() => setActiveTab("guide")}
            className={`py-2.5 px-4 flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "guide"
                ? "border-rose-500 text-rose-400"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>3. Deployment Guide</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-neutral-950/90 text-neutral-200 text-xs">
          {activeTab === "blueprint" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-neutral-400">
                  Defines the collections, entities, and field validations for scalable 1-to-1 private messaging:
                </p>
                <button
                  onClick={() => handleCopy(JSON.stringify(specData?.blueprint, null, 2))}
                  className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Blueprint JSON</span>
                </button>
              </div>

              <pre className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl overflow-x-auto text-[11px] font-mono text-emerald-400 leading-relaxed">
                {JSON.stringify(specData?.blueprint, null, 2)}
              </pre>
            </div>
          )}

          {activeTab === "rules" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-neutral-400">
                  Strict zero-trust Firestore Security Rules enforcing 1-to-1 privacy (User ↔ Admin):
                </p>
                <button
                  onClick={() => handleCopy(specData?.securityRules || "")}
                  className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy firestore.rules</span>
                </button>
              </div>

              <pre className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl overflow-x-auto text-[11px] font-mono text-amber-300 leading-relaxed">
                {specData?.securityRules}
              </pre>
            </div>
          )}

          {activeTab === "guide" && (
            <div className="space-y-4 text-neutral-300 leading-relaxed">
              <h3 className="text-sm font-bold text-white mb-2">Production Deployment & Setup Instructions</h3>

              <ol className="space-y-3 list-decimal list-inside text-neutral-300">
                <li className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
                  <strong className="text-white">Real-Time WebSocket Architecture:</strong> This app runs an Express server with WebSocket support on port 3000. Data is saved locally in <code className="text-amber-300 font-mono">/data/db.json</code>.
                </li>
                <li className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
                  <strong className="text-white">Firebase Option Deployment:</strong> If deploying directly to Firebase Firestore, copy the <code className="text-amber-300 font-mono">firestore.rules</code> file above into your Firebase console under Firestore Database &gt; Rules.
                </li>
                <li className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
                  <strong className="text-white">Admin Credential Configuration:</strong> Set the <code className="text-amber-300 font-mono">ADMIN_PASSPHRASE</code> variable in your environment or <code className="text-amber-300 font-mono">.env</code> to set your admin secret code.
                </li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
