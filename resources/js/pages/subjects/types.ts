import { BaseModel } from '@/types/crud';

export interface Subject extends BaseModel {
    name: string;
    description: string;
    status: 'active' | 'inactive';

    created_at_formatted: string;
}

export interface SubjectFormData {
    name: string;
    description: string;
    status: 'active' | 'inactive';

}

export interface SubjectIndexProps {
    statusOptions?: { value: string; label: string }[];

}

export interface SubjectCreateModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export interface SubjectEditModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    subject: Subject | null;
}

export interface SubjectViewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    subject: Subject | null;
    onEdit?: (subject: Subject) => void;
}