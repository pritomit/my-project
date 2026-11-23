import React, { useEffect, useState } from "react";
import { UserRole, Message, ChatThread, User } from "./types";
import { db } from "./lib/firebase";
import { collection, doc, onSnapshot, setDoc, updateDoc, addDoc, query, orderBy, getDocs, deleteDoc, writeBatch } from "firebase/firestore";
import { ChatHeader } from "./components/ChatHeader";
import { ChatMessageList } from "./components/ChatMessageList";
import { ChatInput } from "./components/ChatInput";
import { AdminSidebar } from "./components/AdminSidebar";
import { UserLoginModal } from "./components/UserLoginModal";
import { AdminLoginModal } from "./components/AdminLoginModal";
import { FirestoreSpecModal } from "./components/FirestoreSpecModal";

export default function App() {
  const [username, setUsername] = useState<string>(() => localStorage.getItem("instadm_username") || "");
  const [userId] = useState<string>(() => {
    let saved = localStorage.getItem("instadm_userid");
    if (!saved) {
      saved = `user_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem("instadm_userid", saved);
    }
    return saved;
  });

  const [role, setRole] = useState<UserRole>(() => (localStorage.getItem("instadm_role") as UserRole) || "user");
  const [adminToken, setAdminToken] = useState<string>(() => localStorage.getItem("instadm_admin_token") || "");

  const [showUserModal, setShowUserModal] = useState<boolean>(!username && role === "user");
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);
  const [showSpecsModal, setShowSpecsModal] = useState<boolean>(false);

  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  
  const [partnerOnline, setPartnerOnline] = useState<boolean>(false);
  const [partnerLastSeen, setPartnerLastSeen] = useState<number>(Date.now());
  const [partnerTyping, setPartnerTyping] = useState<boolean>(false);
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState<boolean>(false);

  // Mark user online initially
  useEffect(() => {
    if (username && role === "user") {
      const userRef = doc(db, "users", userId);
      setDoc(userRef, {
        id: userId,
        username,
        isOnline: true,
        lastSeen: Date.now(),
        role: "user"
      }, { merge: true });

      const threadId = `thread_${userId}`;
      const threadRef = doc(db, "chats", threadId);
      setDoc(threadRef, {
        id: threadId,
        userId,
        username,
        userOnline: true,
        lastSeen: Date.now()
      }, { merge: true });
    }
  }, [username, role, userId]);

  // Handle Firebase Listeners
  useEffect(() => {
    if (!username && role === "user") return;
    let unsubMessages: () => void;
    let unsubThreads: () => void;
    let unsubTyping: () => void;

    if (role === "admin") {
      // Admin: Listen to all threads
      const threadsQuery = query(collection(db, "chats"), orderBy("lastSeen", "desc"));
      unsubThreads = onSnapshot(threadsQuery, (snapshot) => {
        const fetchedThreads = snapshot.docs.map(doc => doc.data() as ChatThread);
        setThreads(fetchedThreads);
        if (fetchedThreads.length > 0 && !activeThreadId) {
          setActiveThreadId(fetchedThreads[0].id);
        }
      });
    }

    const currentTId = role === "user" ? `thread_${userId}` : activeThreadId;
    
    if (currentTId) {
      // Listen to messages for active thread
      const messagesQuery = query(collection(db, `chats/${currentTId}/messages`), orderBy("timestamp", "asc"));
      unsubMessages = onSnapshot(messagesQuery, (snapshot) => {
        const fetchedMsgs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Message));
        setMessages(fetchedMsgs);

        // Mark as read
        snapshot.docs.forEach(docSnap => {
          const msg = docSnap.data() as Message;
          if (!msg.isRead && msg.senderRole !== role) {
            updateDoc(doc(db, `chats/${currentTId}/messages`, docSnap.id), { isRead: true });
            const threadRef = doc(db, "chats", currentTId);
            updateDoc(threadRef, {
               [role === "admin" ? "unreadAdminCount" : "unreadUserCount"]: 0 
            }).catch(() => {});
          }
        });
      });

      // Listen to typing status
      const threadRef = doc(db, "chats", currentTId);
      unsubTyping = onSnapshot(threadRef, (docSnap) => {
         if (docSnap.exists()) {
           const data = docSnap.data();
           if (role === "user") {
             setPartnerOnline(true);
             setPartnerTyping(data.adminTyping || false);
           } else {
             setPartnerOnline(data.userOnline || false);
             setPartnerLastSeen(data.lastSeen || Date.now());
             setPartnerTyping(data.userTyping || false);
           }
         }
      });
    }

    return () => {
      if (unsubMessages) unsubMessages();
      if (unsubThreads) unsubThreads();
      if (unsubTyping) unsubTyping();
    };
  }, [role, activeThreadId, username, userId]);

  const handleUserLogin = (newUsername: string) => {
    setUsername(newUsername);
    localStorage.setItem("instadm_username", newUsername);
    localStorage.setItem("instadm_role", "user");
    setRole("user");
    setShowUserModal(false);
  };

  const handleAdminLoginSuccess = (token: string) => {
    // Basic local simulation (in real world, use Firebase Auth)
    setAdminToken(token);
    localStorage.setItem("instadm_admin_token", token);
    localStorage.setItem("instadm_role", "admin");
    setRole("admin");
    setShowAdminModal(false);
  };

  const handleSwitchToUserMode = () => {
    localStorage.setItem("instadm_role", "user");
    setRole("user");
    if (!username) setShowUserModal(true);
  };

  const handleSendMessage = async (text: string, mediaUrl?: string, mediaType?: "image" | "audio" | "file", fileName?: string) => {
    const currentTId = role === "user" ? `thread_${userId}` : activeThreadId;
    if (!currentTId) return;

    const newMessage = {
      threadId: currentTId,
      senderId: role === "admin" ? "admin" : userId,
      senderName: role === "admin" ? "Support Admin" : username,
      senderRole: role,
      text,
      mediaUrl: mediaUrl || null,
      mediaType: mediaType || null,
      fileName: fileName || null,
      timestamp: Date.now(),
      isRead: false,
    };

    try {
      await addDoc(collection(db, `chats/${currentTId}/messages`), newMessage);
      
      const threadRef = doc(db, "chats", currentTId);
      const updateData: any = {
        lastMessage: text || (mediaUrl ? '[Attachment]' : ''),
        lastMessageTime: Date.now(),
        lastSeen: Date.now()
      };
      
      // We don't have atomic increment here just for simplicity of static preview
      // In production use arrayUnion or atomic increments
      await setDoc(threadRef, updateData, { merge: true });
    } catch (e) {
      console.error("Error sending message:", e);
      alert("Please configure Firebase credentials in src/lib/firebase.ts to send messages.");
    }
  };

  const handleTyping = (isTyping: boolean) => {
    const currentTId = role === "user" ? `thread_${userId}` : activeThreadId;
    if (!currentTId) return;
    const threadRef = doc(db, "chats", currentTId);
    updateDoc(threadRef, {
      [role === "user" ? "userTyping" : "adminTyping"]: isTyping
    }).catch(() => {});
  };

  const handleReactMessage = async (messageId: string, reaction: string) => {
    const currentTId = role === "user" ? `thread_${userId}` : activeThreadId;
    if (!currentTId) return;
    try {
       const msgRef = doc(db, `chats/${currentTId}/messages`, messageId);
       await updateDoc(msgRef, { reaction });
    } catch(e) {}
  };

  const handleDeleteMessage = async (messageId: string) => {
    const currentTId = role === "user" ? `thread_${userId}` : activeThreadId;
    if (!currentTId) return;
    try {
      await deleteDoc(doc(db, `chats/${currentTId}/messages`, messageId));
    } catch(e) {}
  };

  const handleClearChat = async () => {
    if (!activeThreadId) return;
    if (!confirm("Clear this entire chat history?")) return;
    try {
      const msgsQuery = query(collection(db, `chats/${activeThreadId}/messages`));
      const snapshot = await getDocs(msgsQuery);
      const batch = writeBatch(db);
      snapshot.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
      
      await updateDoc(doc(db, "chats", activeThreadId), {
        lastMessage: "Chat cleared by admin"
      });
    } catch(e) {}
  };

  const currentPartnerName = role === "user" ? "Support Admin" : (threads.find((t) => t.id === activeThreadId)?.username || "User");

  return (
    <div className="h-screen w-screen bg-neutral-950 text-white flex flex-col overflow-hidden font-sans antialiased select-none">
      <div className="flex-1 flex overflow-hidden">
        {role === "admin" && (
          <AdminSidebar
            threads={threads}
            activeThreadId={activeThreadId}
            onSelectThread={(tId) => {
              setActiveThreadId(tId);
              setSidebarOpenMobile(false);
            }}
            isOpenMobile={sidebarOpenMobile}
          />
        )}
        <div className="flex-1 flex flex-col h-full min-w-0 bg-neutral-950">
          <ChatHeader
            currentRole={role}
            chatPartnerName={currentPartnerName}
            isPartnerOnline={partnerOnline}
            partnerLastSeen={partnerLastSeen}
            isPartnerTyping={partnerTyping}
            onOpenSpecsModal={() => setShowSpecsModal(true)}
            onOpenAdminLogin={() => setShowAdminModal(true)}
            onSwitchToUser={handleSwitchToUserMode}
            onClearChat={role === "admin" ? handleClearChat : undefined}
            onToggleSidebarMobile={() => setSidebarOpenMobile(!sidebarOpenMobile)}
            showSidebarToggle={role === "admin"}
          />
          <ChatMessageList
            messages={messages}
            currentUserId={userId}
            currentRole={role}
            onReactMessage={handleReactMessage}
            onDeleteMessage={handleDeleteMessage}
            isPartnerTyping={partnerTyping}
            partnerName={currentPartnerName}
          />
          <ChatInput onSendMessage={handleSendMessage} onTyping={handleTyping} />
        </div>
      </div>
      <UserLoginModal
        isOpen={showUserModal}
        savedUsername={username}
        onLogin={handleUserLogin}
        onSwitchToAdmin={() => {
          setShowUserModal(false);
          setShowAdminModal(true);
        }}
      />
      <AdminLoginModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />
      <FirestoreSpecModal isOpen={showSpecsModal} onClose={() => setShowSpecsModal(false)} />
    </div>
  );
}
