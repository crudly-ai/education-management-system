import { Button } from '@/components/ui/form/button';
import { DatePicker } from '@/components/ui/form/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/form/select';
import { Switch } from '@/components/ui/form/switch';
import { Label } from '@/components/ui/form/label';
import {
    Modal,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalTitle,
} from '@/components/ui/overlay/modal';
import { useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { useTranslations } from '@/hooks/use-translations';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/feedback/toaster';
import { AttendanceEditModalProps } from './types';

export function AttendanceEditModal({ open, onOpenChange, attendance, ...props }: AttendanceEditModalProps) {
    const { t } = useTranslations();
    const { toast } = useToast();

    
    // Extract relationship data from props
    const relationshipData = Object.keys(props).reduce((acc, key) => {
        if (Array.isArray(props[key]) && props[key].length > 0 && props[key][0]?.id) {
            acc[key] = props[key];
        }
        return acc;
    }, {} as any);
    const { data, setData, put, processing, errors, reset } = useForm({
        date: '',
        student_id: null as number | null,
        status: 'active' as 'active' | 'inactive',

    });

    useEffect(() => {
        if (attendance && open) {
            setData({
                date: attendance.date,
                student_id: attendance.student_id,
                status: attendance.status,

            });

        } else if (!open) {
            reset();
        }
    }, [attendance, open]);



    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (attendance) {
            put(`/attendances/${attendance.id}`, {
                onSuccess: () => {
                    toast.success(t('Attendance updated successfully'));
                    reset();
                    onOpenChange(false);
                    window.dispatchEvent(new CustomEvent('refreshDataTable'));
                },
                onError: () => {
                    toast.error(t('Failed to update attendance'), { description: t('Please check the form and try again') });
                },
            });
        }
    };

    const handleClose = () => {
        reset();
        onOpenChange(false);
    };

    if (!attendance) return null;

    return (
        <Modal open={open} onOpenChange={handleClose}>
            <ModalContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <ModalHeader>
                        <ModalTitle>{t('Edit Attendance')}</ModalTitle>
                    </ModalHeader>
                    
                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="date">{t('Date')}</Label>
                            <DatePicker
                                value={data.date}
                                onChange={(value) => setData('date', value)}
                                placeholder={t('Select Date')}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="student_id">{t('Student Id')}</Label>
                            <Select value={data.student_id?.toString()} onValueChange={(value) => setData('student_id', parseInt(value))}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('Select Student')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {relationshipData.students?.map((student) => (
                                        <SelectItem key={student.id} value={student.id.toString()}>
                                            {student.name || student.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">{t('Status')} *</Label>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="status"
                                    checked={data.status === 'active'}
                                    onCheckedChange={(checked) => setData('status', checked ? 'active' : 'inactive')}
                                />
                                <Label htmlFor="status">{t('Active Status')}</Label>
                            </div>
                        </div>


                    </div>

                    <ModalFooter>
                        <Button type="button" variant="outline" onClick={handleClose}>
                            {t('Cancel')}
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {t('Update Attendance')}
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
            <Toaster />
        </Modal>
    );
}