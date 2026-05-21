import { Badge } from '@/components/ui/feedback/badge';
import { Paperclip, Star, Flag } from 'lucide-react';
import { Email } from './email-layout';
import { getEmailsByFolder } from './email-data';
import { useFormatters } from '@/utils/formatters';

interface EmailListProps {
    folder: string;
    selectedEmail: Email | null;
    onEmailSelect: (email: Email) => void;
    isPreview?: boolean;
}

export function EmailList({ folder, selectedEmail, onEmailSelect, isPreview }: EmailListProps) {
    const { formatDate } = useFormatters();
    const emails = getEmailsByFolder(folder);

    const getPriorityColor = (priority?: string) => {
        switch (priority) {
            case 'high': return 'text-red-500';
            case 'low': return 'text-green-500';
            default: return 'text-gray-400';
        }
    };

    const getFolderTitle = (folder: string) => {
        const titles = {
            inbox: 'Inbox',
            sent: 'Sent',
            draft: 'Drafts',
            starred: 'Starred',
            junk: 'Junk',
            trash: 'Trash'
        };
        return titles[folder as keyof typeof titles] || 'Emails';
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">{getFolderTitle(folder)}</h2>
                    <Badge variant="secondary" className="text-xs">
                        {emails.length}
                    </Badge>
                </div>
            </div>

            {/* Email List */}
            <div className="flex-1 overflow-y-auto">
                {emails.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        <div className="text-sm">No emails in {getFolderTitle(folder).toLowerCase()}</div>
                    </div>
                ) : (
                    <div className="divide-y">
                        {emails.map((email) => {
                            const isSelected = selectedEmail?.id === email.id;
                            
                            return (
                                <div
                                    key={email.id}
                                    onClick={() => onEmailSelect(email)}
                                    className={`p-4 cursor-pointer transition-colors hover:bg-muted ${
                                        isSelected ? 'bg-muted border-r-2 border-primary' : ''
                                    } ${!email.isRead ? 'bg-blue-50/50' : ''}`}
                                >
                                    <div className="space-y-2">
                                        {/* Header Row */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                                <span className={`text-sm font-medium truncate ${
                                                    !email.isRead ? 'font-semibold' : ''
                                                }`}>
                                                    {email.from.name}
                                                </span>
                                                {email.isStarred && (
                                                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                                )}
                                                {email.hasAttachments && (
                                                    <Paperclip className="w-3 h-3 text-gray-500" />
                                                )}
                                                {email.priority && email.priority !== 'normal' && (
                                                    <Flag className={`w-3 h-3 ${getPriorityColor(email.priority)}`} />
                                                )}
                                            </div>
                                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                {formatDate(email.timestamp, 'MMM d')}
                                            </span>
                                        </div>

                                        {/* Subject */}
                                        <div className={`text-sm truncate ${
                                            !email.isRead ? 'font-semibold text-foreground' : 'text-muted-foreground'
                                        }`}>
                                            {email.subject}
                                        </div>

                                        {/* Preview */}
                                        <div className="text-xs text-muted-foreground line-clamp-2">
                                            {email.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
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