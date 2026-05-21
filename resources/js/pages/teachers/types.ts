import { BaseModel } from '@/types/crud';

export interface Teacher extends BaseModel {
    name: string;
    subject_id: number;
    status: 'active' | 'inactive';

    created_at_formatted: string;
}

export interface TeacherFormData {
    name: string;
    subject_id: number | null;
    status: 'active' | 'inactive';

}

export interface TeacherIndexProps {
    subjects?: { id: number; name?: string; title?: string }[];
    subject_idOptions?: { value: string; label: string }[];
    statusOptions?: { value: string; label: string }[];

}

export interface TeacherCreateModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export interface TeacherEditModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    teacher: Teacher | null;
}

export interface TeacherViewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    teacher: Teacher | null;
    onEdit?: (teacher: Teacher) => void;
}