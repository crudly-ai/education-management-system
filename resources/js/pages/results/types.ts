import { BaseModel } from '@/types/crud';

export interface Result extends BaseModel {
    student_id: number;
    exam_id: number;
    marks: string;
    status: 'active' | 'inactive';

    created_at_formatted: string;
}

export interface ResultFormData {
    student_id: number | null;
    exam_id: number | null;
    marks: string;
    status: 'active' | 'inactive';

}

export interface ResultIndexProps {
    students?: { id: number; name?: string; title?: string }[];
    student_idOptions?: { value: string; label: string }[];
    exams?: { id: number; name?: string; title?: string }[];
    exam_idOptions?: { value: string; label: string }[];
    marksOptions?: { value: string; label: string }[];
    statusOptions?: { value: string; label: string }[];

}

export interface ResultCreateModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export interface ResultEditModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    result: Result | null;
}

export interface ResultViewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    result: Result | null;
    onEdit?: (result: Result) => void;
}