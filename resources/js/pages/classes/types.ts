import { BaseModel } from '@/types/crud';

export interface Class extends BaseModel {
    name: string;
    description: string;
    status: 'active' | 'inactive';

    created_at_formatted: string;
}

export interface ClassFormData {
    name: string;
    description: string;
    status: 'active' | 'inactive';

}

export interface ClassIndexProps {
    statusOptions?: { value: string; label: string }[];

}

export interface ClassCreateModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export interface ClassEditModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    classData: Class | null;
}

export interface ClassViewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    classData: Class | null;
    onEdit?: (classData: Class) => void;
}