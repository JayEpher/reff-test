/**
 * 用户角色枚举
 */
export enum Role {
  /** 超级管理员 - 拥有所有权限 */
  SUPER_ADMIN = 'super_admin',
  /** 管理员 - 拥有大部分管理权限 */
  ADMIN = 'admin',
  /** 编辑者 - 可以创建和编辑内容 */
  EDITOR = 'editor',
  /** 查看者 - 只读权限 */
  VIEWER = 'viewer',
  /** 访客 - 最小权限 */
  GUEST = 'guest',
}

/**
 * 权限枚举
 */
export enum Permission {
  // ========== 用户管理 ==========
  USER_CREATE = 'user:create',
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',

  // ========== 内容管理 ==========
  CONTENT_CREATE = 'content:create',
  CONTENT_READ = 'content:read',
  CONTENT_UPDATE = 'content:update',
  CONTENT_DELETE = 'content:delete',
  CONTENT_PUBLISH = 'content:publish',

  // ========== 系统配置 ==========
  SYSTEM_CONFIG_READ = 'system:config:read',
  SYSTEM_CONFIG_UPDATE = 'system:config:update',
  SYSTEM_LOGS_READ = 'system:logs:read',
  SYSTEM_LOGS_DELETE = 'system:logs:delete',

  // ========== Web3 权限 ==========
  WEB3_READ = 'web3:read',
  WEB3_WRITE = 'web3:write',
  WEB3_ADMIN = 'web3:admin',

  // ========== 媒体管理 ==========
  MEDIA_UPLOAD = 'media:upload',
  MEDIA_READ = 'media:read',
  MEDIA_DELETE = 'media:delete',
}

/**
 * 角色权限映射
 * 定义每个角色拥有的权限
 */
export const RolePermissions: Record<Role, Permission[]> = {
  // 超级管理员 - 拥有所有权限
  [Role.SUPER_ADMIN]: Object.values(Permission),

  // 管理员 - 除了部分危险操作外的所有权限
  [Role.ADMIN]: [
    // 用户管理
    Permission.USER_CREATE,
    Permission.USER_READ,
    Permission.USER_UPDATE,
    // 内容管理
    Permission.CONTENT_CREATE,
    Permission.CONTENT_READ,
    Permission.CONTENT_UPDATE,
    Permission.CONTENT_DELETE,
    Permission.CONTENT_PUBLISH,
    // 系统配置
    Permission.SYSTEM_CONFIG_READ,
    Permission.SYSTEM_CONFIG_UPDATE,
    Permission.SYSTEM_LOGS_READ,
    // Web3
    Permission.WEB3_READ,
    Permission.WEB3_WRITE,
    // 媒体
    Permission.MEDIA_UPLOAD,
    Permission.MEDIA_READ,
    Permission.MEDIA_DELETE,
  ],

  // 编辑者 - 可以创建和编辑内容
  [Role.EDITOR]: [
    Permission.USER_READ,
    Permission.CONTENT_CREATE,
    Permission.CONTENT_READ,
    Permission.CONTENT_UPDATE,
    Permission.SYSTEM_LOGS_READ,
    Permission.WEB3_READ,
    Permission.MEDIA_UPLOAD,
    Permission.MEDIA_READ,
  ],

  // 查看者 - 只读权限
  [Role.VIEWER]: [
    Permission.USER_READ,
    Permission.CONTENT_READ,
    Permission.SYSTEM_LOGS_READ,
    Permission.WEB3_READ,
    Permission.MEDIA_READ,
  ],

  // 访客 - 最小权限
  [Role.GUEST]: [
    Permission.CONTENT_READ,
  ],
};

/**
 * 用户信息接口
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  permissions?: Permission[];
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 认证上下文状态
 */
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * 认证上下文值
 */
export interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
}
