import { create } from 'zustand';

export interface CursorPosition {
  x: number;
  y: number;
}

export interface UserInfo {
  id?: string;
  name: string;
  color?: string;
  avatarUrl?: string;
  initials?: string;
}

export interface UserPresence {
  socketId: string;
  user: UserInfo;
  cursor?: CursorPosition;
  isTyping?: boolean;
}

/**
 * Interface representing the real-time collaborative workspace Zustand state.
 */
interface WorkspaceState {
  /** The current textual content of the collaborative document */
  documentContent: string;
  /** Presence records of all other active users in the room */
  users: Record<string, UserPresence>;
  /** Socket connection status */
  status: 'Connected' | 'Reconnecting...' | 'Disconnected' | 'Syncing changes...';
  /** Flag showing if the local state has synced with the Y.Doc CRDT */
  crdtSynced: boolean;
  setDocumentContent: (content: string) => void;
  setStatus: (
    status: 'Connected' | 'Reconnecting...' | 'Disconnected' | 'Syncing changes...'
  ) => void;
  addUser: (socketId: string, user: UserInfo) => void;
  removeUser: (socketId: string) => void;
  updateUserCursor: (socketId: string, cursor: CursorPosition) => void;
  updateUserTyping: (socketId: string, isTyping: boolean) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  documentContent: '',
  users: {},
  status: 'Disconnected',
  crdtSynced: false,

  /** Updates the document content and sets the CRDT synced flag to true */
  setDocumentContent: (content) => set({ documentContent: content, crdtSynced: true }),

  setStatus: (status) => set({ status }),

  addUser: (socketId, user) =>
    set((state) => ({
      users: {
        ...state.users,
        [socketId]: { socketId, user },
      },
    })),

  removeUser: (socketId) =>
    set((state) => {
      const newUsers = { ...state.users };
      delete newUsers[socketId];
      return { users: newUsers };
    }),

  updateUserCursor: (socketId, cursor) =>
    set((state) => ({
      users: {
        ...state.users,
        [socketId]: { ...state.users[socketId], cursor },
      },
    })),

  updateUserTyping: (socketId, isTyping) =>
    set((state) => ({
      users: {
        ...state.users,
        [socketId]: { ...state.users[socketId], isTyping },
      },
    })),
}));
