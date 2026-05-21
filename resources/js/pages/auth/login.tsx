import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';
import { useTranslations } from '@/hooks/use-translations';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/feedback/toaster';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/form/button';
import { Checkbox } from '@/components/ui/form/checkbox';
import { Input } from '@/components/ui/form/input';
import { Label } from '@/components/ui/form/label';
import AuthLayout from '@/layouts/auth-layout';

interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
}

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { t } = useTranslations();
    const { toast } = useToast();
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onSuccess: () => {
                toast.success(t('Login successful'), { description: t('Welcome back!') });
                window.location.reload();
            },
            onError: () => {
                toast.error(t('Login failed'), { description: t('Please check your credentials and try again') });
            },
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout
            title={t('Log in to your account')}
            description={t('Enter your email and password below to log in')}
            footer={
                <>
                    <p className='me-1'>{t("Don't have an account?")}</p>
                    <TextLink
                        href={route('register')}
                        tabIndex={5}
                        onClick={(e) => {
                            const guestData = sessionStorage.getItem('guestProjectData');
                            if (guestData) {
                                e.preventDefault();
                                fetch('/api/crudly/store-guest-data', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                                    },
                                    body: JSON.stringify({ projectData: JSON.parse(guestData) })
                                }).finally(() => {
                                    window.location.href = route('register');
                                });
                            }
                        }}
                    >
                        {t('Sign up')}
                    </TextLink>
                </>
            }
        >
            <Head title={t('Log in')} />

            <form className="flex flex-col gap-2" onSubmit={submit}>
                <div className="grid gap-3">
                    <div className="grid gap-2">
                        <Label htmlFor="email">{t('Email address')}</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder={t('email@example.com')}
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">{t('Password')}</Label>
                            {canResetPassword && (
                                <TextLink href={route('password.request')} className="ml-auto text-sm leading-none" tabIndex={5}>
                                    {t('Forgot password?')}
                                </TextLink>
                            )}
                        </div>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder={t('Password')}
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center space-x-3 mb-[15px]">
                        <Checkbox className='cursor-pointer' id="remember" name="remember" tabIndex={3} />
                        <Label className='cursor-pointer' htmlFor="remember">{t('Remember me')}</Label>
                    </div>

                    <Button type="submit" className="w-full cursor-pointer" tabIndex={4} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        {t('Log in')}
                    </Button>
                </div>
            </form>

            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
            <Toaster />
        </AuthLayout>
    );
}
