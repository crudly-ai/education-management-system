import AuthLayoutTemplate from '@/layouts/auth/auth-simple-layout';
import { ReactNode } from 'react';

export default function AuthLayout({ children, title, description, footer, ...props }: { children: ReactNode; title: string; description: string; footer?: ReactNode }) {
    return (
        <AuthLayoutTemplate title={title} description={description} footer={footer} {...props}>
            {children}
        </AuthLayoutTemplate>
    );
}
