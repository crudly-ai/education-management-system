import { BaseModel } from '@/types/crud';

export interface Role extends BaseModel {
    name: string;
}

export interface User extends BaseModel {
    name: string;
    email: string;
    avatar?: string;
    roles: Role[];
    roles_count: number;
    roles_list: string[];
    created_at_formatted: string;
}

export interface UserFormData {
    name: string;
    email: string;
    password: string;
    avatar?: string;
    roles: string[];
}

export interface UserIndexProps {
    roles: Role[];
    roleOptions?: { value: string; label: string }[];
}

export interface UserCreateModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    roles: Role[];
}

export interface UserEditModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: User | null;
    roles: Role[];
}

export interface UserViewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: User | null;
    onEdit?: (user: User) => void;
}