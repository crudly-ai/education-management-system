import { BaseModel } from '@/types/crud';

export interface Fee extends BaseModel {
    student_id: number;
    amount: string;
    status: 'active' | 'inactive';

    created_at_formatted: string;
}

export interface FeeFormData {
    student_id: number | null;
    amount: string;
    status: 'active' | 'inactive';

}

export interface FeeIndexProps {
    students?: { id: number; name?: string; title?: string }[];
    student_idOptions?: { value: string; label: string }[];
    amountOptions?: { value: string; label: string }[];
    statusOptions?: { value: string; label: string }[];

}

export interface FeeCreateModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export interface FeeEditModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    fee: Fee | null;
}

export interface FeeViewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    fee: Fee | null;
    onEdit?: (fee: Fee) => void;
}