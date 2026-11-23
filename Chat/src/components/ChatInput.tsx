import React, { useState, useRef, useEffect } from "react";
import { Send, Smile, Paperclip, Mic, X, Image as ImageIcon, Check } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (
    text: string,
    mediaUrl?: string,
    mediaType?: "image" | "audio" | "file",
    fileName?: string
  ) => void;
  onTyping: (isTyping: boolean) => void;
  disabled?: boolean;
}

const EMOJI_LIST = [
  "😀", "😂", "😍", "🔥", "❤️", "👍", "🙏", "✨", 
  "😎", "🙌", "🥳", "💯", "🎉", "👏", "😮", "🤔", 
  "💪", "👀", "🚀", "💡", "💖", "⚡", "😴", "😭"
];

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onTyping,
  disabled,
}) => {
  const [text, setText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachment, setAttachment] = useState<{
    url: string;
    type: "image" | "audio" | "file";
    name: string;
  } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Handle Typing indicator
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);

    onTyping(true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
    }, 1500);
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() && !attachment) return;

    onSendMessage(
      text.trim(),
      attachment?.url,
      attachment?.type,
      attachment?.name
    );

    setText("");
    setAttachment(null);
    setShowEmojiPicker(false);
    onTyping(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size limit is 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      let type: "image" | "audio" | "file" = "file";
      if (file.type.startsWith("image/")) type = "image";
      else if (file.type.startsWith("audio/")) type = "audio";

      setAttachment({
        url: result,
        type,
        name: file.name,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Voice Recording Simulator
  const startRecording = () => {
    setIsRecording(true);
    setRecordingSeconds(0);
    recordingIntervalRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopRecordingAndSend = () => {
    if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    setIsRecording(false);

    // Simulate audio data
    onSendMessage(
      `🎙️ Voice Note (${recordingSeconds}s)`,
      "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=",
      "audio",
      `voice_note_${Date.now()}.wav`
    );
    setRecordingSeconds(0);
  };

  const cancelRecording = () => {
    if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    };
  }, []);

  return (
    <div className="p-3 sm:p-4 bg-neutral-900 border-t border-neutral-800 relative z-20">
      {/* Attachment Preview Box */}
      {attachment && (
        <div className="mb-2 p-2 bg-neutral-800/90 border border-neutral-700 rounded-xl flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2 min-w-0">
            {attachment.type === "image" ? (
              <img
                src={attachment.url}
                alt="Preview"
                className="w-10 h-10 object-cover rounded-lg"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <Paperclip className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate max-w-[200px]">
                {attachment.name}
              </p>
              <p className="text-[10px] text-neutral-400 uppercase">
                {attachment.type} attachment ready
              </p>
            </div>
          </div>
          <button
            onClick={() => setAttachment(null)}
            className="p-1 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Emoji Picker Popup */}
      {showEmojiPicker && (
        <div className="absolute bottom-16 left-4 z-40 bg-neutral-800 border border-neutral-700 rounded-2xl p-3 shadow-2xl grid grid-cols-6 gap-2 w-64 animate-fadeIn">
          {EMOJI_LIST.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                setText((prev) => prev + emoji);
                setShowEmojiPicker(false);
              }}
              className="text-xl p-1.5 hover:bg-neutral-700 rounded-xl transition-transform hover:scale-125 cursor-pointer text-center"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Recording Mode UI */}
      {isRecording ? (
        <div className="flex items-center justify-between bg-neutral-800 border border-rose-500/40 rounded-full px-4 py-2 text-sm animate-pulse">
          <div className="flex items-center space-x-2 text-rose-400 font-semibold">
            <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
            <span>Recording audio... {recordingSeconds}s</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={cancelRecording}
              className="px-3 py-1 bg-neutral-700 hover:bg-neutral-600 text-neutral-200 rounded-full text-xs font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={stopRecordingAndSend}
              className="px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded-full text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer shadow-md"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Send Voice</span>
            </button>
          </div>
        </div>
      ) : (
        /* Normal Message Input Bar */
        <form
          onSubmit={handleSend}
          className="flex items-center space-x-2 bg-neutral-800/90 border border-neutral-700/80 rounded-2xl px-3 py-1.5 focus-within:border-neutral-600 transition-all shadow-inner"
        >
          {/* Emoji Toggle */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 text-neutral-400 hover:text-amber-400 rounded-full hover:bg-neutral-700/50 transition-colors cursor-pointer"
            title="Emoji"
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Attachment Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,audio/*,.pdf,.doc,.docx"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-700/50 transition-colors cursor-pointer"
            title="Attach image or file"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Main Input Field */}
          <input
            type="text"
            value={text}
            onChange={handleTextChange}
            placeholder="Message..."
            disabled={disabled}
            className="flex-1 bg-transparent text-white placeholder-neutral-500 text-sm font-normal focus:outline-none px-2 py-1.5"
          />

          {/* Voice Record Button */}
          {!text && !attachment && (
            <button
              type="button"
              onClick={startRecording}
              className="p-2 text-neutral-400 hover:text-rose-400 rounded-full hover:bg-neutral-700/50 transition-colors cursor-pointer"
              title="Record Voice Note"
            >
              <Mic className="w-5 h-5" />
            </button>
          )}

          {/* Send Button */}
          {(text.trim() || attachment) && (
            <button
              type="submit"
              disabled={disabled}
              className="p-2 bg-gradient-to-tr from-rose-500 via-purple-600 to-indigo-600 hover:from-rose-600 hover:via-purple-700 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-purple-500/30 transition-all transform active:scale-95 cursor-pointer"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </form>
      )}
    </div>
  );
};
