import { Button } from '@/components/ui/form/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/form/select';
import { StarRating } from '@/components/ui/form/star-rating';
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
import { ResultEditModalProps } from './types';

export function ResultEditModal({ open, onOpenChange, result, ...props }: ResultEditModalProps) {
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
        student_id: null as number | null,
        exam_id: null as number | null,
        marks: 0,
        status: 'active' as 'active' | 'inactive',

    });

    useEffect(() => {
        if (result && open) {
            setData({
                student_id: result.student_id,
                exam_id: result.exam_id,
                marks: result.marks,
                status: result.status,

            });

        } else if (!open) {
            reset();
        }
    }, [result, open]);



    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (result) {
            put(`/results/${result.id}`, {
                onSuccess: () => {
                    toast.success(t('Result updated successfully'));
                    reset();
                    onOpenChange(false);
                    window.dispatchEvent(new CustomEvent('refreshDataTable'));
                },
                onError: () => {
                    toast.error(t('Failed to update result'), { description: t('Please check the form and try again') });
                },
            });
        }
    };

    const handleClose = () => {
        reset();
        onOpenChange(false);
    };

    if (!result) return null;

    return (
        <Modal open={open} onOpenChange={handleClose}>
            <ModalContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <ModalHeader>
                        <ModalTitle>{t('Edit Result')}</ModalTitle>
                    </ModalHeader>
                    
                    <div className="space-y-6 py-4">
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
                            <Label htmlFor="exam_id">{t('Exam Id')}</Label>
                            <Select value={data.exam_id?.toString()} onValueChange={(value) => setData('exam_id', parseInt(value))}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('Select Exam')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {relationshipData.exams?.map((exam) => (
                                        <SelectItem key={exam.id} value={exam.id.toString()}>
                                            {exam.name || exam.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="marks">{t('Marks')} *</Label>
                            <StarRating
                                value={data.marks}
                                onChange={(value) => setData('marks', value)}
                                maxRating={5}
                            />
                            {errors.marks && <p className="text-red-500 text-sm mt-1">{errors.marks}</p>}
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
                            {t('Update Result')}
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
            <Toaster />
        </Modal>
    );
}