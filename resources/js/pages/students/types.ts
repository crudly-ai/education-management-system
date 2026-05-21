import { BaseModel } from '@/types/crud';

export interface Student extends BaseModel {
    name: string;
    class_id: number;
    status: 'active' | 'inactive';

    created_at_formatted: string;
}

export interface StudentFormData {
    name: string;
    class_id: number | null;
    status: 'active' | 'inactive';

}

export interface StudentIndexProps {
    classes?: { id: number; name?: string; title?: string }[];
    class_idOptions?: { value: string; label: string }[];
    statusOptions?: { value: string; label: string }[];

}

export interface StudentCreateModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export interface StudentEditModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    student: Student | null;
}

export interface StudentViewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    student: Student | null;
    onEdit?: (student: Student) => void;
}