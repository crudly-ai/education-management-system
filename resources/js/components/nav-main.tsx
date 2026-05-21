import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from '@/components/ui/layout/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { useTranslations } from '@/hooks/use-translations';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/interaction/collapsible';
import { ChevronRight } from 'lucide-react';
import { useState } from 'react';

export function NavMain({ items = [], groupLabel }: { items: NavItem[], groupLabel?: string }) {
    const { t } = useTranslations();
    const page = usePage();
    const { auth } = page.props as any;
    const [openItems, setOpenItems] = useState<string[]>([]);
    
    const filteredItems = items.filter(item => {
        if (item.permissions) {
            return item.permissions.some(permission => auth.permissions?.includes(permission));
        }
        return !item.permission || auth.permissions?.includes(item.permission);
    });
    
    if (filteredItems.length === 0) {
        return null;
    }

    const toggleItem = (title: string) => {
        setOpenItems(prev => 
            prev.includes(title) 
                ? prev.filter(item => item !== title)
                : [...prev, title]
        );
    };
    
    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>{groupLabel || t('Platform')}</SidebarGroupLabel>
            <SidebarMenu>
                {filteredItems.map((item) => {
                    if (item.items && item.items.length > 0) {
                        const isOpen = openItems.includes(item.title);
                        return (
                            <Collapsible key={item.title} open={isOpen} onOpenChange={() => toggleItem(item.title)}>
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton>
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                            <ChevronRight className={`ml-auto transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            {item.items.map((subItem) => (
                                                <SidebarMenuSubItem key={subItem.title}>
                                                    <SidebarMenuSubButton asChild isActive={subItem.url === page.url}>
                                                        <Link href={subItem.url!} prefetch>
                                                            <span>{subItem.title}</span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            ))}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                        );
                    }
                    
                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild isActive={item.url === page.url}>
                                <Link href={item.url!} prefetch>
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
