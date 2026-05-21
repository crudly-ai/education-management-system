import { BaseModel } from '@/types/crud';

export interface Exam extends BaseModel {
    name: string;
    subject_id: number;
    status: 'active' | 'inactive';

    created_at_formatted: string;
}

export interface ExamFormData {
    name: string;
    subject_id: number | null;
    status: 'active' | 'inactive';

}

export interface ExamIndexProps {
    subjects?: { id: number; name?: string; title?: string }[];
    subject_idOptions?: { value: string; label: string }[];
    statusOptions?: { value: string; label: string }[];

}

export interface ExamCreateModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export interface ExamEditModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    exam: Exam | null;
}

export interface ExamViewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    exam: Exam | null;
    onEdit?: (exam: Exam) => void;
}