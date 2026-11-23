import React, { useState } from "react";
import { ChatThread } from "../types";
import { formatMessageTime } from "../lib/firebase";
import { Search, Shield, User, Circle, MessageSquare, Filter } from "lucide-react";

interface AdminSidebarProps {
  threads: ChatThread[];
  activeThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  adminName?: string;
  isOpenMobile?: boolean;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  threads,
  activeThreadId,
  onSelectThread,
  adminName = "Support Admin",
  isOpenMobile = true,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "online">("all");

  const filteredThreads = threads.filter((t) => {
    const matchesSearch =
      t.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.lastMessage && t.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (filter === "unread") return t.unreadAdminCount > 0;
    if (filter === "online") return t.userOnline;
    return true;
  });

  const totalUnread = threads.reduce((acc, t) => acc + t.unreadAdminCount, 0);

  return (
    <aside
      className={`w-full md:w-80 lg:w-96 bg-neutral-900 border-r border-neutral-800 flex flex-col h-full shrink-0 select-none ${
        isOpenMobile ? "block" : "hidden md:flex"
      }`}
    >
      {/* Admin Header */}
      <div className="p-4 border-b border-neutral-800 bg-neutral-900/90 backdrop-blur-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-md">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight">Admin Console</h1>
              <p className="text-[11px] text-amber-400 font-medium">Messages & Support</p>
            </div>
          </div>

          {totalUnread > 0 && (
            <span className="bg-rose-500 text-white font-bold text-xs px-2.5 py-0.5 rounded-full shadow-md animate-pulse">
              {totalUnread} new
            </span>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search conversations..."
            className="w-full bg-neutral-800/80 border border-neutral-700/60 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-1 mt-3 text-xs">
          <button
            onClick={() => setFilter("all")}
            className={`flex-1 py-1 px-2 rounded-lg font-medium text-center transition-colors cursor-pointer ${
              filter === "all"
                ? "bg-neutral-800 text-white font-semibold border border-neutral-700"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            All ({threads.length})
          </button>

          <button
            onClick={() => setFilter("unread")}
            className={`flex-1 py-1 px-2 rounded-lg font-medium text-center transition-colors cursor-pointer ${
              filter === "unread"
                ? "bg-rose-500/20 text-rose-400 font-semibold border border-rose-500/30"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            Unread
          </button>

          <button
            onClick={() => setFilter("online")}
            className={`flex-1 py-1 px-2 rounded-lg font-medium text-center transition-colors cursor-pointer ${
              filter === "online"
                ? "bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            Online
          </button>
        </div>
      </div>

      {/* Threads List */}
      <div className="flex-1 overflow-y-auto divide-y divide-neutral-800/50">
        {filteredThreads.length === 0 ? (
          <div className="p-8 text-center text-neutral-500 text-xs flex flex-col items-center space-y-2">
            <MessageSquare className="w-8 h-8 text-neutral-700 mb-1" />
            <p>No conversations found</p>
            {searchTerm && <p className="text-[10px]">Try searching a different keyword</p>}
          </div>
        ) : (
          filteredThreads.map((thread) => {
            const isActive = activeThreadId === thread.id;
            const hasUnread = thread.unreadAdminCount > 0;

            return (
              <div
                key={thread.id}
                onClick={() => onSelectThread(thread.id)}
                className={`p-3.5 flex items-center space-x-3 cursor-pointer transition-colors relative ${
                  isActive
                    ? "bg-neutral-800/90 border-l-4 border-rose-500"
                    : "hover:bg-neutral-800/40"
                }`}
              >
                {/* User Avatar */}
                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-0.5 shadow-sm">
                    <div className="w-full h-full bg-neutral-800 rounded-full flex items-center justify-center text-white font-bold text-xs uppercase">
                      {thread.username.slice(0, 2)}
                    </div>
                  </div>
                  {thread.userOnline && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-neutral-900 rounded-full shadow-md animate-pulse" />
                  )}
                </div>

                {/* Content info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3
                      className={`text-xs font-bold truncate ${
                        hasUnread ? "text-white" : "text-neutral-200"
                      }`}
                    >
                      {thread.username}
                    </h3>
                    <span className="text-[10px] text-neutral-500 font-medium shrink-0 ml-1">
                      {thread.lastMessageTime ? formatMessageTime(thread.lastMessageTime) : ""}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-0.5">
                    <p
                      className={`text-xs truncate ${
                        hasUnread
                          ? "text-rose-400 font-semibold"
                          : "text-neutral-400 font-normal"
                      }`}
                    >
                      {thread.lastMessage || "No messages yet"}
                    </p>

                    {hasUnread && (
                      <span className="ml-1.5 shrink-0 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-md">
                        {thread.unreadAdminCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
