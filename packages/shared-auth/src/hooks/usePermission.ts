import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Permission, RolePermissions } from '../types/permission';

/**
 * 权限检查 Hook
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { hasPermission } = usePermission();
 *
 *   if (!hasPermission(Permission.USER_UPDATE)) {
 *     return <div>无权限</div>;
 *   }
 *
 *   return <UserForm />;
 * }
 * ```
 */
export function usePermission() {
  const { user } = useContext(AuthContext);

  /**
   * 检查用户是否拥有指定权限
   */
  const hasPermission = (permission: Permission): boolean => {
    if (!user || !user.role) {
      return false;
    }

    // 如果用户有自定义权限列表，优先使用
    if (user.permissions && user.permissions.length > 0) {
      return user.permissions.includes(permission);
    }

    // 否则根据角色获取权限
    const rolePermissions = RolePermissions[user.role];
    return rolePermissions?.includes(permission) || false;
  };

  /**
   * 检查用户是否拥有任意一个权限
   */
  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some((permission) => hasPermission(permission));
  };

  /**
   * 检查用户是否拥有所有权限
   */
  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every((permission) => hasPermission(permission));
  };

  /**
   * 检查用户是否拥有指定角色
   */
  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    user,
  };
}
