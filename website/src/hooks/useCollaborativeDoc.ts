import { useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import { useSocketContext } from "../context/SocketContext";
import { useWorkspaceStore } from "../store/workspaceStore";
import { YjsSocketIOProvider } from "../utils/yjsSocketIOProvider";

export function useCollaborativeDoc(roomId: string, user: any) {
  const { socket, isConnected } = useSocketContext();
  const [doc] = useState(() => new Y.Doc());
  const providerRef = useRef<YjsSocketIOProvider | null>(null);

  // Incremental diff algorithm to apply changes to Y.Text efficiently
  const applyTextDiff = (ytext: Y.Text, oldVal: string, newVal: string) => {
    let start = 0;
    while (
      start < oldVal.length &&
      start < newVal.length &&
      oldVal[start] === newVal[start]
    ) {
      start++;
    }

    let oldEnd = oldVal.length - 1;
    let newEnd = newVal.length - 1;
    while (
      oldEnd >= start &&
      newEnd >= start &&
      oldVal[oldEnd] === newVal[newEnd]
    ) {
      oldEnd--;
      newEnd--;
    }

    const deleteCount = oldEnd - start + 1;
    const insertText = newVal.substring(start, newEnd + 1);

    if (deleteCount > 0) {
      ytext.delete(start, deleteCount);
    }
    if (insertText.length > 0) {
      ytext.insert(start, insertText);
    }
  };

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Join room on Socket.io
    socket.emit("join_room", roomId, user);

    const provider = new YjsSocketIOProvider(doc, socket, roomId, user);
    providerRef.current = provider;

    const ytext = doc.getText("documentContent");

    // Sync initial Y.Doc text to Zustand
    useWorkspaceStore.getState().setDocumentContent(ytext.toString());

    // Listen to Y.Doc changes and update Zustand store
    const textObserver = () => {
      useWorkspaceStore.getState().setDocumentContent(ytext.toString());
    };
    ytext.observe(textObserver);

    // Listen to Yjs awareness updates to sync remote user cursors and presence
    const awarenessObserver = () => {
      const states = provider.awareness.getStates();
      const usersMap: Record<string, any> = {};

      states.forEach((state: any, clientID: number) => {
        // Exclude our own local presence from remote cursors list
        if (clientID !== doc.clientID) {
          if (state.user) {
            usersMap[clientID.toString()] = {
              socketId: clientID.toString(),
              user: state.user,
              cursor: state.cursor || undefined,
              isTyping: state.isTyping || false,
            };
          }
        }
      });

      useWorkspaceStore.setState({ users: usersMap });
    };
    provider.awareness.on("change", awarenessObserver);

    return () => {
      socket.emit("leave_room", roomId);
      ytext.unobserve(textObserver);
      provider.awareness.off("change", awarenessObserver);
      provider.destroy();
      providerRef.current = null;
    };
  }, [doc, socket, isConnected, roomId, user]);

  const updateDocContent = (newContent: string) => {
    const ytext = doc.getText("documentContent");
    const oldContent = ytext.toString();
    if (oldContent !== newContent) {
      applyTextDiff(ytext, oldContent, newContent);
    }
  };

  const updateLocalCursor = (cursor: { x: number; y: number } | null) => {
    if (providerRef.current) {
      providerRef.current.awareness.setLocalStateField("cursor", cursor);
    }
  };

  const updateLocalTyping = (isTyping: boolean) => {
    if (providerRef.current) {
      providerRef.current.awareness.setLocalStateField("isTyping", isTyping);
    }
  };

  return {
    updateDocContent,
    updateLocalCursor,
    updateLocalTyping,
  };
}
