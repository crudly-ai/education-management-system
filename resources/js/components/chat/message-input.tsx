import { useState } from 'react';
import { Button } from '@/components/ui/form/button';
import { Input } from '@/components/ui/form/input';
import { Send, Paperclip, Smile } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MessageInputProps {
    onSendMessage: (message: string) => void;
    isPreview?: boolean;
}

export function MessageInput({ onSendMessage, isPreview }: MessageInputProps) {
    const [message, setMessage] = useState('');
    const { toast } = useToast();

    const handleSend = () => {
        if (message.trim()) {
            onSendMessage(message.trim());
            setMessage('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleFileAttach = () => {
        if (!isPreview) {
            toast.success('File attachment feature would be here');
        }
    };

    const handleEmojiPicker = () => {
        if (!isPreview) {
            toast.success('Emoji picker would be here');
        }
    };

    return (
        <div className="p-4 border-t bg-background">
            <div className="flex items-end gap-2">
                {/* Attachment Button */}
                {!isPreview && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleFileAttach}
                        className="h-10 w-10 p-0 flex-shrink-0"
                        title="Attach file"
                    >
                        <Paperclip className="w-4 h-4" />
                    </Button>
                )}

                {/* Message Input */}
                <div className="flex-1 relative">
                    <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        className="pr-10"
                        disabled={isPreview}
                    />
                    
                    {/* Emoji Button */}
                    {!isPreview && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleEmojiPicker}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                            title="Add emoji"
                        >
                            <Smile className="w-4 h-4" />
                        </Button>
                    )}
                </div>

                {/* Send Button */}
                <Button
                    onClick={handleSend}
                    disabled={!message.trim() || isPreview}
                    size="sm"
                    className="h-10 w-10 p-0 flex-shrink-0"
                    title="Send message"
                >
                    <Send className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}