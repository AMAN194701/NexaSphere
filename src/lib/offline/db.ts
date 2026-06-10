import Dexie, { type Table } from 'dexie';

export interface UserOffline {
  id: string;
  email: string;
  name?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkspaceOffline {
  id: string;
  name: string;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkspaceMemberOffline {
  id: string;
  workspaceId: string;
  userId: string;
  roleId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RoleOffline {
  id: string;
  name: string;
  workspaceId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PermissionOffline {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PostOffline {
  id: string;
  title: string;
  content?: string;
  published: boolean;
  authorId: string;
  workspaceId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LogOffline {
  id: string;
  action: string;
  details?: string;
  userId?: string;
  workspaceId: string;
  createdAt?: string;
}

export interface SyncOperation {
  id?: number;
  entity: 'users' | 'workspaces' | 'posts' | 'logs';
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  payload: any;
  timestamp: number;
}

export class NexaSphereDB extends Dexie {
  users!: Table<UserOffline>;
  workspaces!: Table<WorkspaceOffline>;
  workspaceMembers!: Table<WorkspaceMemberOffline>;
  roles!: Table<RoleOffline>;
  permissions!: Table<PermissionOffline>;
  posts!: Table<PostOffline>;
  logs!: Table<LogOffline>;
  syncQueue!: Table<SyncOperation>;

  constructor() {
    super('NexaSphereDB');
    this.version(1).stores({
      users: 'id, email',
      workspaces: 'id, slug',
      workspaceMembers: 'id, [workspaceId+userId], userId, roleId',
      roles: 'id, name, workspaceId',
      permissions: 'id, name',
      posts: 'id, authorId, workspaceId, published',
      logs: 'id, userId, workspaceId, action',
      syncQueue: '++id, entity, action, timestamp',
    });
  }
}

export const db = new NexaSphereDB();
export default db;
