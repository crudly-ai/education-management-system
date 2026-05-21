import { Badge } from '@/components/ui/feedback/badge';
import { Button } from '@/components/ui/form/button';
import { Download, FileText } from 'lucide-react';
import { Message } from './chat-data';
import { useFormatters } from '@/utils/formatters';

interface MessageItemProps {
    message: Message;
    isPreview?: boolean;
}

export function MessageItem({ message, isPreview }: MessageItemProps) {
    const { formatDate } = useFormatters();

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    if (message.type === 'system') {
        return (
            <div className="flex justify-center my-4">
                <Badge variant="secondary" className="text-xs">
                    {message.content}
                </Badge>
            </div>
        );
    }

    return (
        <div className={`flex gap-3 mb-4 ${message.isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
            {/* Avatar */}
            {!message.isOwn && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-primary">
                        {getInitials(message.senderName)}
                    </span>
                </div>
            )}

            {/* Message Content */}
            <div className={`max-w-[70%] ${message.isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                {/* Message Bubble */}
                <div className={`rounded-lg px-4 py-2 ${
                    message.isOwn 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-foreground'
                }`}>
                    {message.type === 'text' ? (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    ) : message.type === 'file' ? (
                        <div className="space-y-2">
                            <p className="text-sm">{message.content}</p>
                            <div className={`flex items-center gap-2 p-2 rounded border ${
                                message.isOwn 
                                    ? 'bg-primary-foreground/10 border-primary-foreground/20' 
                                    : 'bg-background border-border'
                            }`}>
                                <FileText className="w-4 h-4" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium truncate">{message.fileName}</p>
                                    <p className="text-xs opacity-70">{message.fileSize}</p>
                                </div>
                                {!isPreview && (
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-6 w-6 p-0"
                                    >
                                        <Download className="w-3 h-3" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* Timestamp */}
                <span className={`text-xs text-muted-foreground mt-1 ${
                    message.isOwn ? 'text-right' : 'text-left'
                }`}>
                    {formatDate(message.timestamp, 'h:mm a')}
                </span>
            </div>
        </div>
    );
}