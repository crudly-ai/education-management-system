import { BaseModel } from '@/types/crud';

export interface Attendance extends BaseModel {
    date: string;
    student_id: number;
    status: 'active' | 'inactive';

    created_at_formatted: string;
}

export interface AttendanceFormData {
    date: string;
    student_id: number | null;
    status: 'active' | 'inactive';

}

export interface AttendanceIndexProps {
    dateOptions?: { value: string; label: string }[];
    students?: { id: number; name?: string; title?: string }[];
    student_idOptions?: { value: string; label: string }[];
    statusOptions?: { value: string; label: string }[];

}

export interface AttendanceCreateModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export interface AttendanceEditModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    attendance: Attendance | null;
}

export interface AttendanceViewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    attendance: Attendance | null;
    onEdit?: (attendance: Attendance) => void;
}