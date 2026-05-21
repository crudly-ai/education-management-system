import { BaseModel, Permission } from './crud';

export interface Role extends BaseModel {
    name: string;
    permissions: Permission[];
    permissions_count: number;
    permissions_list: string[];
    created_at_formatted: string;
}

export interface RoleFormData {
    name: string;
    permissions: string[];
}

export interface RoleIndexProps {
    permissions: Permission[];
    permissionOptions?: { value: string; label: string }[];
}

export interface RoleCreateModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    permissions: Permission[];
}

export interface RoleEditModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    role: Role | null;
    permissions: Permission[];
}

export interface RoleViewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    role: Role | null;
    onEdit?: (role: Role) => void;
}