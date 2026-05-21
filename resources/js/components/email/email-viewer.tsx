import { Button } from '@/components/ui/form/button';
import { Badge } from '@/components/ui/feedback/badge';
import { ArrowLeft, Reply, ReplyAll, Forward, Star, Trash2, Archive, Flag, Paperclip } from 'lucide-react';
import { Email } from './email-layout';
import { useFormatters } from '@/utils/formatters';

interface EmailViewerProps {
    email: Email;
    onReply: (email: Email) => void;
    onBack: () => void;
    isPreview?: boolean;
}

export function EmailViewer({ email, onReply, onBack, isPreview }: EmailViewerProps) {
    const { formatDate } = useFormatters();

    const getPriorityBadge = (priority?: string) => {
        if (!priority || priority === 'normal') return null;
        
        const config = {
            high: { label: 'High Priority', className: 'bg-red-100 text-red-800 border-red-200' },
            low: { label: 'Low Priority', className: 'bg-green-100 text-green-800 border-green-200' }
        };
        
        const priorityConfig = config[priority as keyof typeof config];
        if (!priorityConfig) return null;

        return (
            <Badge variant="outline" className={priorityConfig.className}>
                <Flag className="w-3 h-3 mr-1" />
                {priorityConfig.label}
            </Badge>
        );
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-4">
                    <Button variant="ghost" size="sm" onClick={onBack}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    
                    <div className="flex items-center gap-2">
                        {!isPreview && (
                            <>
                                <Button variant="ghost" size="sm">
                                    <Star className={`w-4 h-4 ${email.isStarred ? 'text-yellow-500 fill-current' : ''}`} />
                                </Button>
                                <Button variant="ghost" size="sm">
                                    <Archive className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Email Header Info */}
                <div className="space-y-3">
                    <div className="flex items-start justify-between">
                        <h1 className="text-xl font-semibold pr-4">{email.subject}</h1>
                        {getPriorityBadge(email.priority)}
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="font-medium">{email.from.name}</span>
                                <span className="text-sm text-muted-foreground">&lt;{email.from.email}&gt;</span>
                                {email.hasAttachments && (
                                    <Paperclip className="w-4 h-4 text-muted-foreground" />
                                )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                to {email.to.join(', ')}
                            </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {formatDate(email.timestamp, 'MMM d, yyyy \'at\' h:mm a')}
                        </div>
                    </div>
                </div>
            </div>

            {/* Email Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: email.content }}
                />
                
                {email.hasAttachments && (
                    <div className="mt-6 p-4 border rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2 mb-2">
                            <Paperclip className="w-4 h-4" />
                            <span className="font-medium text-sm">Attachments</span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between p-2 bg-background rounded border">
                                <span className="text-sm">project-proposal.pdf</span>
                                <span className="text-xs text-muted-foreground">2.4 MB</span>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-background rounded border">
                                <span className="text-sm">mockups.zip</span>
                                <span className="text-xs text-muted-foreground">8.1 MB</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            {!isPreview && (
                <div className="p-4 border-t bg-muted/30">
                    <div className="flex gap-2">
                        <Button onClick={() => onReply(email)}>
                            <Reply className="w-4 h-4 mr-2" />
                            Reply
                        </Button>
                        <Button variant="outline">
                            <ReplyAll className="w-4 h-4 mr-2" />
                            Reply All
                        </Button>
                        <Button variant="outline">
                            <Forward className="w-4 h-4 mr-2" />
                            Forward
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}