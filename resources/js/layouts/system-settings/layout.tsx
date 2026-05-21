import Heading from '@/components/heading';
import { Button } from '@/components/ui/form/button';
import { Separator } from '@/components/ui/layout/separator';
import { cn } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { useTranslations } from '@/hooks/use-translations';
import { usePage } from '@inertiajs/react';

interface SettingTab {
    id: number;
    name: string;
}

const getSidebarNavItems = (t: (key: string) => string): NavItem[] => [
    {
        title: t('General'),
        url: '/system-settings',
        icon: null,
    },
];

export default function SystemSettingsLayout({ children }: { children: React.ReactNode }) {
    const { t } = useTranslations();
    const currentPath = window.location.pathname;
    const { tabs } = usePage().props as { tabs: SettingTab[] };
    
    const dynamicNavItems = getSidebarNavItems(t);

    return (
        <div className="px-4 py-6">
            <Heading title={t('System Settings')} description={t('Manage application-wide configuration')} />

            <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
                <aside className="w-full max-w-xl lg:w-48">
                    <nav className="flex flex-col space-y-1 space-x-0">
                        {dynamicNavItems.map((item) => (
                            <Button
                                key={item.url}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn('w-full justify-start', {
                                    'bg-muted': currentPath === item.url,
                                })}
                            >
                                <Link href={item.url} prefetch>
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <Separator className="my-6 md:hidden" />

                <div className="flex-1 md:max-w-2xl">
                    <section className="max-w-xl space-y-12">{children}</section>
                </div>
            </div>
        </div>
    );
}