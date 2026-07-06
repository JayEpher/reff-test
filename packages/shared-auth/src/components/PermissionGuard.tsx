import React from 'react';
import { usePermission } from '../hooks/usePermission';
import { Permission } from '../types/permission';

interface PermissionGuardProps {
  /** 需要的权限，可以是单个或多个 */
  permission: Permission | Permission[];
  /** 当有多个权限时，是否需要全部满足（默认为 false，即满足任意一个即可） */
  requireAll?: boolean;
  /** 无权限时显示的内容 */
  fallback?: React.ReactNode;
  /** 子组件 */
  children: React.ReactNode;
}

/**
 * 权限保护组件
 * 用于根据权限控制组件的显示
 *
 * @example
 * ```tsx
 * // 单个权限
 * <PermissionGuard permission={Permission.USER_UPDATE}>
 *   <Button>编辑用户</Button>
 * </PermissionGuard>
 *
 * // 多个权限（满足任意一个）
 * <PermissionGuard permission={[Permission.USER_UPDATE, Permission.USER_DELETE]}>
 *   <UserActions />
 * </PermissionGuard>
 *
 * // 多个权限（需要全部满足）
 * <PermissionGuard
 *   permission={[Permission.SYSTEM_CONFIG_READ, Permission.SYSTEM_CONFIG_UPDATE]}
 *   requireAll
 * >
 *   <SystemConfig />
 * </PermissionGuard>
 *
 * // 自定义无权限提示
 * <PermissionGuard
 *   permission={Permission.USER_DELETE}
 *   fallback={<Alert>你没有删除用户的权限</Alert>}
 * >
 *   <DeleteButton />
 * </PermissionGuard>
 * ```
 */
export function PermissionGuard({
  permission,
  requireAll = false,
  fallback = null,
  children,
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermission();

  const permissions = Array.isArray(permission) ? permission : [permission];

  const hasAccess = requireAll
    ? hasAllPermissions(permissions)
    : hasAnyPermission(permissions);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
