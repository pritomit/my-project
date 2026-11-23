import React, { useEffect, useRef, useState } from "react";
import { Message, UserRole } from "../types";
import { formatMessageTime } from "../lib/firebase";
import { Check, CheckCheck, Trash2, Heart, Smile, Download, ArrowDown, Image as ImageIcon } from "lucide-react";

interface ChatMessageListProps {
  messages: Message[];
  currentUserId: string;
  currentRole: UserRole;
  onReactMessage: (messageId: string, reaction: string) => void;
  onDeleteMessage: (messageId: string) => void;
  isPartnerTyping?: boolean;
  partnerName: string;
}

const EMOJI_REACTIONS = ["❤️", "😂", "👍", "🔥", "😮", "🙏"];

export const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  currentUserId,
  currentRole,
  onReactMessage,
  onDeleteMessage,
  isPartnerTyping,
  partnerName,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [hoveredMsgId, setHoveredMsgId] = useState<string | null>(null);
  const [reactionMenuMsgId, setReactionMenuMsgId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  };

  useEffect(() => {
    scrollToBottom(false);
  }, [messages.length]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isUp = scrollHeight - scrollTop - clientHeight > 150;
    setShowScrollBottom(isUp);
  };

  // Group messages by date
  const renderGroupedMessages = () => {
    const groups: { [dateStr: string]: Message[] } = {};

    messages.forEach((msg) => {
      const date = new Date(msg.timestamp).toLocaleDateString([], {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });

    return Object.entries(groups).map(([dateStr, msgs]) => (
      <div key={dateStr} className="space-y-3">
        {/* Date Divider */}
        <div className="flex items-center justify-center my-4">
          <div className="bg-neutral-800/80 border border-neutral-700/50 text-neutral-400 text-[11px] font-semibold px-3 py-1 rounded-full shadow-sm">
            {dateStr}
          </div>
        </div>

        {/* Message items */}
        {msgs.map((msg, index) => {
          const isMe =
            currentRole === "admin"
              ? msg.senderRole === "admin"
              : msg.senderId === currentUserId;

          const showAvatar =
            !isMe &&
            (index === msgs.length - 1 || msgs[index + 1]?.senderId !== msg.senderId);

          return (
            <div
              key={msg.id}
              onMouseEnter={() => setHoveredMsgId(msg.id)}
              onMouseLeave={() => {
                setHoveredMsgId(null);
                if (reactionMenuMsgId === msg.id) setReactionMenuMsgId(null);
              }}
              className={`flex items-end space-x-2 group relative ${
                isMe ? "justify-end" : "justify-start"
              }`}
            >
              {/* Receiver Avatar */}
              {!isMe && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-0.5 shrink-0 mb-1">
                  <div className="w-full h-full bg-neutral-800 rounded-full flex items-center justify-center text-[10px] font-bold text-white uppercase">
                    {msg.senderName.slice(0, 2)}
                  </div>
                </div>
              )}

              {/* Message Bubble Container */}
              <div
                className={`max-w-[80%] sm:max-w-[68%] flex flex-col ${
                  isMe ? "items-end" : "items-start"
                }`}
              >
                {/* Sender Name for Admin viewing multiple users */}
                {!isMe && currentRole === "admin" && (
                  <span className="text-[10px] text-neutral-400 font-semibold mb-0.5 ml-1">
                    {msg.senderName}
                  </span>
                )}

                <div className="relative group/bubble">
                  {/* Reaction Popup Menu */}
                  {reactionMenuMsgId === msg.id && (
                    <div
                      className={`absolute -top-10 z-30 bg-neutral-800 border border-neutral-700 rounded-full shadow-xl p-1 flex items-center space-x-1 animate-fadeIn ${
                        isMe ? "right-0" : "left-0"
                      }`}
                    >
                      {EMOJI_REACTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => {
                            onReactMessage(msg.id, emoji);
                            setReactionMenuMsgId(null);
                          }}
                          className="hover:scale-125 transition-transform p-1 text-base rounded-full hover:bg-neutral-700 cursor-pointer"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    onDoubleClick={() => onReactMessage(msg.id, "❤️")}
                    className={`relative rounded-2xl px-4 py-2.5 text-sm shadow-sm transition-all ${
                      isMe
                        ? "bg-gradient-to-tr from-rose-500 via-purple-600 to-indigo-600 text-white rounded-br-xs"
                        : "bg-neutral-800 border border-neutral-700/80 text-neutral-100 rounded-bl-xs"
                    }`}
                  >
                    {/* Media content if attached */}
                    {msg.mediaUrl && (
                      <div className="mb-2 overflow-hidden rounded-xl">
                        {msg.mediaType === "image" ? (
                          <img
                            src={msg.mediaUrl}
                            alt="Attachment"
                            onClick={() => setPreviewImage(msg.mediaUrl!)}
                            className="max-h-60 rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
                          />
                        ) : msg.mediaType === "audio" ? (
                          <audio
                            controls
                            src={msg.mediaUrl}
                            className="w-full max-w-xs h-9 rounded-lg"
                          />
                        ) : (
                          <a
                            href={msg.mediaUrl}
                            download={msg.fileName || "attachment"}
                            className="flex items-center space-x-2 text-xs bg-neutral-900/60 p-2.5 rounded-lg hover:bg-neutral-900 transition-colors"
                          >
                            <Download className="w-4 h-4 text-rose-400" />
                            <span className="truncate max-w-[150px]">
                              {msg.fileName || "Download File"}
                            </span>
                          </a>
                        )}
                      </div>
                    )}

                    {/* Message Text */}
                    {msg.text && (
                      <p className="whitespace-pre-wrap break-words leading-relaxed font-normal">
                        {msg.text}
                      </p>
                    )}

                    {/* Reaction Badge on bubble */}
                    {msg.reaction && (
                      <button
                        onClick={() => onReactMessage(msg.id, msg.reaction!)}
                        className={`absolute -bottom-2 ${
                          isMe ? "-left-2" : "-right-2"
                        } bg-neutral-800 border border-neutral-700 rounded-full px-1.5 py-0.5 text-xs shadow-md flex items-center space-x-0.5 hover:scale-110 transition-transform cursor-pointer`}
                      >
                        <span>{msg.reaction}</span>
                      </button>
                    )}
                  </div>

                  {/* Hover Quick Actions (React & Delete) */}
                  {hoveredMsgId === msg.id && (
                    <div
                      className={`absolute top-1/2 -translate-y-1/2 flex items-center space-x-1 ${
                        isMe ? "-left-16" : "-right-16"
                      }`}
                    >
                      <button
                        onClick={() =>
                          setReactionMenuMsgId(
                            reactionMenuMsgId === msg.id ? null : msg.id
                          )
                        }
                        className="p-1 text-neutral-400 hover:text-amber-400 rounded-full hover:bg-neutral-800 transition-colors cursor-pointer"
                        title="React"
                      >
                        <Smile className="w-4 h-4" />
                      </button>

                      {(currentRole === "admin" || isMe) && (
                        <button
                          onClick={() => onDeleteMessage(msg.id)}
                          className="p-1 text-neutral-400 hover:text-rose-400 rounded-full hover:bg-neutral-800 transition-colors cursor-pointer"
                          title="Delete message"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Timestamp & Read Receipt */}
                <div
                  className={`flex items-center space-x-1 mt-1 text-[11px] text-neutral-500 font-medium ${
                    isMe ? "pr-1" : "pl-1"
                  }`}
                >
                  <span>{formatMessageTime(msg.timestamp)}</span>
                  {isMe && (
                    <span title={msg.isRead ? "Seen" : "Sent"}>
                      {msg.isRead ? (
                        <CheckCheck className="w-3.5 h-3.5 text-rose-400 inline ml-0.5" />
                      ) : (
                        <Check className="w-3.5 h-3.5 text-neutral-500 inline ml-0.5" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    ));
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-950 relative scrollbar-thin scrollbar-thumb-neutral-800"
    >
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center text-neutral-500 p-8 space-y-3">
          <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-rose-500 shadow-inner">
            <Heart className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <p className="font-semibold text-neutral-300 text-base">Start of your private conversation</p>
            <p className="text-xs text-neutral-500 max-w-xs mt-1">
              Messages are encrypted in real-time and strictly private between you and {partnerName}.
            </p>
          </div>
        </div>
      ) : (
        renderGroupedMessages()
      )}

      {/* Typing Indicator Bubble */}
      {isPartnerTyping && (
        <div className="flex items-center space-x-2 animate-fadeIn">
          <div className="w-7 h-7 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[10px] font-bold text-white uppercase shrink-0">
            {partnerName.slice(0, 2)}
          </div>
          <div className="bg-neutral-800 border border-neutral-700/80 rounded-2xl px-4 py-2.5 text-xs text-neutral-300 flex items-center space-x-1.5 shadow-sm">
            <span className="font-medium text-neutral-400">{partnerName} is typing</span>
            <span className="flex space-x-1">
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
            </span>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />

      {/* Scroll to bottom button */}
      {showScrollBottom && (
        <button
          onClick={() => scrollToBottom(true)}
          className="fixed bottom-20 right-6 z-30 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white p-2.5 rounded-full shadow-xl transition-all transform hover:scale-110 cursor-pointer"
          title="Scroll to latest"
        >
          <ArrowDown className="w-5 h-5 text-rose-400" />
        </button>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer animate-fadeIn"
        >
          <div className="max-w-4xl max-h-[90vh] relative">
            <img
              src={previewImage}
              alt="Enlarged view"
              className="max-h-[85vh] w-auto rounded-2xl shadow-2xl object-contain"
            />
            <p className="text-center text-xs text-neutral-400 mt-2">Click anywhere to close</p>
          </div>
        </div>
      )}
    </div>
  );
};
