import { usePage } from '@inertiajs/react';

export function usePermissions() {
    const page = usePage();
    const { permissions } = page.props.auth as { permissions: string[] };
    
    const hasPermission = (permission: string) => permissions.includes(permission);
    
    const hasAnyPermission = (permissionList: string[]) => 
        permissionList.some(permission => permissions.includes(permission));
    
    return {
        permissions,
        hasPermission,
        hasAnyPermission,
    };
}