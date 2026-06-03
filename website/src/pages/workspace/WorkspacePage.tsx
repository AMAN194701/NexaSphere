import React, { useRef, useState, useEffect } from "react";
import { useCollaborativeDoc } from "../../hooks/useCollaborativeDoc";
import { useWorkspaceStore } from "../../store/workspaceStore";
import {
  Users,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  ChevronLeft,
} from "lucide-react";
import "./WorkspacePage.css";

interface WorkspacePageProps {
  roomId: string;
  onBack: () => void;
}

export default function WorkspacePage({ roomId, onBack }: WorkspacePageProps) {
  // Use a random anonymous user for now, or fetch from context if there's auth
  const [user] = useState({
    name: `User-${Math.floor(Math.random() * 1000)}`,
    color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`,
    initials: "U",
  });

  const { updateDocContent, updateLocalCursor, updateLocalTyping } =
    useCollaborativeDoc(roomId, user);
  const { documentContent, users, status } = useWorkspaceStore();
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Generate initials safely
    user.initials = user.name.substring(0, 2).toUpperCase();
    console.log(`Collaborative Workspace joined: ${roomId} as ${user.name}`);
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [user, roomId]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    updateDocContent(val);
    updateLocalTyping(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      updateLocalTyping(false);
    }, 1000);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    updateLocalCursor({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseLeave = () => {
    updateLocalCursor(null);
  };

  const getStatusIcon = () => {
    switch (status) {
      case "Connected":
        return <CheckCircle2 size={16} className="text-green-500" />;
      case "Disconnected":
        return <WifiOff size={16} className="text-red-500" />;
      case "Reconnecting...":
        return <RefreshCw size={16} className="text-yellow-500 animate-spin" />;
      case "Syncing changes...":
        return <Wifi size={16} className="text-blue-500 animate-pulse" />;
      default:
        return <Wifi size={16} />;
    }
  };

  return (
    <div className="workspace-container">
      <div className="workspace-header">
        <div className="workspace-header-left">
          <button onClick={onBack} className="workspace-back-btn">
            <ChevronLeft size={20} /> Back
          </button>
          <h2>Room: {roomId}</h2>
          <div className="workspace-status">
            {getStatusIcon()}
            <span className="status-text">{status}</span>
          </div>
        </div>
        <div className="workspace-presence">
          <Users size={20} className="presence-icon" />
          <div className="avatar-group">
            {Object.values(users).map((u) => (
              <div
                key={u.socketId}
                className={`avatar ${u.isTyping ? "typing" : ""}`}
                style={{ backgroundColor: u.user?.color || "#555" }}
                title={`${u.user?.name || "Anonymous"} ${u.isTyping ? "(typing...)" : ""}`}
              >
                {u.user?.initials || "?"}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className="workspace-editor-area"
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {Object.values(users).map((u) => {
          if (!u.cursor || u.socketId === "local") return null; // Don't show local cursor as a fake one
          return (
            <div
              key={`cursor-${u.socketId}`}
              className="remote-cursor"
              style={{
                transform: `translate(${u.cursor.x}px, ${u.cursor.y}px)`,
                backgroundColor: u.user?.color || "#ff0000",
              }}
            >
              <div
                className="cursor-label"
                style={{ backgroundColor: u.user?.color || "#ff0000" }}
              >
                {u.user?.name || "Unknown"}
              </div>
            </div>
          );
        })}

        <textarea
          ref={editorRef}
          className="workspace-textarea"
          value={documentContent}
          onChange={handleTextChange}
          placeholder="Start typing collaboratively..."
        />
      </div>
    </div>
  );
}
