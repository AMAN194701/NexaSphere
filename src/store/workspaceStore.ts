import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CursorPosition {
  x: number;
  y: number;
}

export interface UserPresence {
  socketId: string;
  user: any;
  cursor?: CursorPosition;
  isTyping?: boolean;
}

interface WorkspaceState {
  documentContent: string;
  version: number;
  users: Record<string, UserPresence>;
  status: 'Connected' | 'Reconnecting...' | 'Disconnected' | 'Syncing changes...';
  setDocumentContent: (content: string) => void;
  setDocumentVersion: (version: number) => void;
  setStatus: (status: WorkspaceState['status']) => void;
  addUser: (socketId: string, user: any) => void;
  removeUser: (socketId: string) => void;
  updateUserCursor: (socketId: string, cursor: CursorPosition) => void;
  updateUserTyping: (socketId: string, isTyping: boolean) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      documentContent: '',
      version: 0,
      users: {},
      status: 'Disconnected',

      setDocumentContent: (content) => set({ documentContent: content }),
      setDocumentVersion: (version) => set({ version }),

      setStatus: (status) => set({ status }),

      addUser: (socketId, user) => set((state) => ({
        users: {
          ...state.users,
          [socketId]: { socketId, user },
        },
      })),

      removeUser: (socketId) => set((state) => {
        const newUsers = { ...state.users };
        delete newUsers[socketId];
        return { users: newUsers };
      }),

      updateUserCursor: (socketId, cursor) => set((state) => ({
        users: {
          ...state.users,
          [socketId]: { ...state.users[socketId], cursor },
        },
      })),

      updateUserTyping: (socketId, isTyping) => set((state) => ({
        users: {
          ...state.users,
          [socketId]: { ...state.users[socketId], isTyping },
        },
      })),
    }),
    {
      name: 'workspace-storage',
      partialize: (state) => ({ documentContent: state.documentContent, version: state.version }),
    },
  ),
);
