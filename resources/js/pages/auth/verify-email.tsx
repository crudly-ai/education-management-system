// Components
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';
import { useTranslations } from '@/hooks/use-translations';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/feedback/toaster';

import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/form/button';
import AuthLayout from '@/layouts/auth-layout';

export default function VerifyEmail({ status }: { status?: string }) {
    const { t } = useTranslations();
    const { toast } = useToast();
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('verification.send'), {
            onSuccess: () => {
                toast.success(t('Verification email sent'), { description: t('Check your email for the verification link') });
            },
            onError: () => {
                toast.error(t('Failed to send verification email'), { description: t('Please try again') });
            },
        });
    };

    return (
        <AuthLayout
            title={t('Verify email')}
            description={t('Please verify your email address by clicking on the link we just emailed to you.')}
            footer={
                <TextLink href={route('logout')} method="post" className="text-sm">
                    {t('Log out')}
                </TextLink>
            }
        >
            <Head title={t('Email verification')} />

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {t('A new verification link has been sent to the email address you provided during registration.')}
                </div>
            )}

            <form onSubmit={submit} className="text-center">
                <Button disabled={processing} variant="secondary">
                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    {t('Resend verification email')}
                </Button>
            </form>
            <Toaster />
        </AuthLayout>
    );
}
