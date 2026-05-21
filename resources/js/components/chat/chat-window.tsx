import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/form/button';
import { ArrowLeft, Phone, Video, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/navigation/dropdown-menu';
import { Contact, Message, getMessagesByContactId } from './chat-data';
import { MessageItem } from './message-item';
import { MessageInput } from './message-input';
import { useToast } from '@/hooks/use-toast';

interface ChatWindowProps {
    contact: Contact;
    onBack: () => void;
    isPreview?: boolean;
}

export function ChatWindow({ contact, onBack, isPreview }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        const contactMessages = getMessagesByContactId(contact.id);
        setMessages(contactMessages);
    }, [contact.id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = (messageContent: string) => {
        const newMessage: Message = {
            id: messages.length + 1,
            senderId: 0,
            senderName: 'You',
            content: messageContent,
            timestamp: new Date().toISOString(),
            type: 'text',
            isOwn: true
        };

        setMessages(prev => [...prev, newMessage]);
        toast.success('Message sent!');
    };

    const handleAudioCall = () => {
        if (!isPreview) {
            toast.success(`Starting audio call with ${contact.name}...`);
        }
    };

    const handleVideoCall = () => {
        if (!isPreview) {
            toast.success(`Starting video call with ${contact.name}...`);
        }
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

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

    return (
        <div className="h-full flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b bg-background">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Back Button (Mobile) */}
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={onBack}
                            className="md:hidden h-8 w-8 p-0"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Button>

                        {/* Contact Info */}
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-sm font-medium text-primary">
                                        {getInitials(contact.name)}
                                    </span>
                                </div>
                                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${
                                    getStatusColor(contact.isOnline, contact.status)
                                }`} />
                            </div>
                            
                            <div>
                                <h3 className="font-medium text-sm">{contact.name}</h3>
                                <p className="text-xs text-muted-foreground">
                                    {contact.isOnline ? (contact.status || 'Online') : 'Offline'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        {!isPreview && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleAudioCall}
                                    className="h-8 w-8 p-0"
                                    title="Audio call"
                                >
                                    <Phone className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleVideoCall}
                                    className="h-8 w-8 p-0"
                                    title="Video call"
                                >
                                    <Video className="w-4 h-4" />
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                                        <DropdownMenuItem>Mute Notifications</DropdownMenuItem>
                                        <DropdownMenuItem>Clear Chat</DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600">Block Contact</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        <div className="text-center">
                            <div className="text-sm">No messages yet</div>
                            <div className="text-xs mt-1">Start a conversation with {contact.name}</div>
                        </div>
                    </div>
                ) : (
                    <>
                        {messages.map((message) => (
                            <MessageItem 
                                key={message.id} 
                                message={message} 
                                isPreview={isPreview}
                            />
                        ))}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Message Input */}
            <MessageInput 
                onSendMessage={handleSendMessage} 
                isPreview={isPreview}
            />
        </div>
    );
}