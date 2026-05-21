import { useState } from 'react';
import { Input } from '@/components/ui/form/input';
import { Badge } from '@/components/ui/feedback/badge';
import { Search, MessageCircle } from 'lucide-react';
import { Contact, sampleContacts } from './chat-data';
import { useFormatters } from '@/utils/formatters';

interface ContactListProps {
    selectedContact: Contact | null;
    onContactSelect: (contact: Contact) => void;
    isPreview?: boolean;
}

export function ContactList({ selectedContact, onContactSelect, isPreview }: ContactListProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const { formatDate } = useFormatters();

    const filteredContacts = sampleContacts.filter(contact =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusColor = (isOnline: boolean, status?: string) => {
        if (!isOnline) return 'bg-gray-400';
        switch (status) {
            case 'Available': return 'bg-green-500';
            case 'Busy': return 'bg-red-500';
            case 'Away': return 'bg-yellow-500';
            case 'In a meeting': return 'bg-orange-500';
            default: return 'bg-green-500';
        }
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Chats</h2>
                    <MessageCircle className="w-5 h-5 text-muted-foreground" />
                </div>
                
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search contacts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Contact List */}
            <div className="flex-1 overflow-y-auto">
                {filteredContacts.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        <div className="text-sm">No contacts found</div>
                    </div>
                ) : (
                    <div className="divide-y">
                        {filteredContacts.map((contact) => {
                            const isSelected = selectedContact?.id === contact.id;
                            
                            return (
                                <div
                                    key={contact.id}
                                    onClick={() => onContactSelect(contact)}
                                    className={`p-4 cursor-pointer transition-colors hover:bg-muted ${
                                        isSelected ? 'bg-muted border-r-2 border-primary' : ''
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {/* Avatar */}
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                                <span className="text-sm font-medium text-primary">
                                                    {getInitials(contact.name)}
                                                </span>
                                            </div>
                                            {/* Online Status */}
                                            <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-background ${
                                                getStatusColor(contact.isOnline, contact.status)
                                            }`} />
                                        </div>

                                        {/* Contact Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="font-medium text-sm truncate">
                                                    {contact.name}
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-muted-foreground">
                                                        {contact.lastMessageTime}
                                                    </span>
                                                    {contact.unreadCount > 0 && (
                                                        <Badge className="bg-primary text-primary-foreground text-xs min-w-[20px] h-5 rounded-full flex items-center justify-center">
                                                            {contact.unreadCount}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs text-muted-foreground truncate pr-2">
                                                    {contact.lastMessage}
                                                </p>
                                            </div>
                                            
                                            {contact.status && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {contact.status}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}