import { useState } from 'react';
import { Button } from '@/components/ui/form/button';
import { Input } from '@/components/ui/form/input';
import { Label } from '@/components/ui/form/label';
import { Textarea } from '@/components/ui/form/textarea';
import { ArrowLeft, Send, Paperclip, Bold, Italic, Underline, Link, List, AlignLeft } from 'lucide-react';
import { Email } from './email-layout';
import { useToast } from '@/hooks/use-toast';

interface EmailComposerProps {
    replyTo?: Email | null;
    onBack: () => void;
    isPreview?: boolean;
}

export function EmailComposer({ replyTo, onBack, isPreview }: EmailComposerProps) {
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        to: replyTo ? replyTo.from.email : '',
        cc: '',
        bcc: '',
        subject: replyTo ? `Re: ${replyTo.subject}` : '',
        content: replyTo ? `\n\n---\nOn ${replyTo.timestamp}, ${replyTo.from.name} wrote:\n${replyTo.content.replace(/<[^>]*>/g, '')}` : ''
    });
    const [showCcBcc, setShowCcBcc] = useState(false);

    const handleSend = () => {
        if (!formData.to || !formData.subject || !formData.content) {
            toast.error('Please fill in all required fields');
            return;
        }
        
        toast.success('Email sent successfully!');
        onBack();
    };

    const handleSaveDraft = () => {
        toast.success('Draft saved');
    };

    const formatText = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        // Update content after formatting
        const editor = document.querySelector('[contenteditable]') as HTMLElement;
        if (editor) {
            setFormData({ ...formData, content: editor.innerHTML });
        }
    };

    const insertLink = () => {
        const url = prompt('Enter URL:');
        if (url) {
            formatText('createLink', url);
        }
    };

    const insertList = () => {
        formatText('insertUnorderedList');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Handle common shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'b':
                    e.preventDefault();
                    formatText('bold');
                    break;
                case 'i':
                    e.preventDefault();
                    formatText('italic');
                    break;
                case 'u':
                    e.preventDefault();
                    formatText('underline');
                    break;
            }
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={onBack}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                        <h2 className="text-lg font-semibold">
                            {replyTo ? 'Reply' : 'Compose Email'}
                        </h2>
                    </div>
                    
                    {!isPreview && (
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleSaveDraft}>
                                Save Draft
                            </Button>
                            <Button onClick={handleSend}>
                                <Send className="w-4 h-4 mr-2" />
                                Send
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Compose Form */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4 max-w-4xl">
                    {/* To Field */}
                    <div className="space-y-2">
                        <Label htmlFor="to">To *</Label>
                        <Input
                            id="to"
                            type="email"
                            value={formData.to}
                            onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                            placeholder="recipient@example.com"
                            disabled={isPreview}
                        />
                    </div>

                    {/* CC/BCC Toggle */}
                    {!showCcBcc && (
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setShowCcBcc(true)}
                            className="text-sm text-muted-foreground"
                        >
                            + Add CC/BCC
                        </Button>
                    )}

                    {/* CC/BCC Fields */}
                    {showCcBcc && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="cc">CC</Label>
                                <Input
                                    id="cc"
                                    type="email"
                                    value={formData.cc}
                                    onChange={(e) => setFormData({ ...formData, cc: e.target.value })}
                                    placeholder="cc@example.com"
                                    disabled={isPreview}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bcc">BCC</Label>
                                <Input
                                    id="bcc"
                                    type="email"
                                    value={formData.bcc}
                                    onChange={(e) => setFormData({ ...formData, bcc: e.target.value })}
                                    placeholder="bcc@example.com"
                                    disabled={isPreview}
                                />
                            </div>
                        </>
                    )}

                    {/* Subject */}
                    <div className="space-y-2">
                        <Label htmlFor="subject">Subject *</Label>
                        <Input
                            id="subject"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            placeholder="Email subject"
                            disabled={isPreview}
                        />
                    </div>

                    {/* Rich Text Toolbar */}
                    {!isPreview && (
                        <div className="border rounded-t-md p-2 bg-muted/50">
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => formatText('bold')}
                                    className="h-8 w-8 p-0"
                                    title="Bold (Ctrl+B)"
                                >
                                    <Bold className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => formatText('italic')}
                                    className="h-8 w-8 p-0"
                                    title="Italic (Ctrl+I)"
                                >
                                    <Italic className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => formatText('underline')}
                                    className="h-8 w-8 p-0"
                                    title="Underline (Ctrl+U)"
                                >
                                    <Underline className="w-4 h-4" />
                                </Button>
                                <div className="w-px h-6 bg-border mx-1" />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={insertList}
                                    className="h-8 w-8 p-0"
                                    title="Bullet List"
                                >
                                    <List className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => formatText('justifyLeft')}
                                    className="h-8 w-8 p-0"
                                    title="Align Left"
                                >
                                    <AlignLeft className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={insertLink}
                                    className="h-8 w-8 p-0"
                                    title="Insert Link"
                                >
                                    <Link className="w-4 h-4" />
                                </Button>
                                <div className="w-px h-6 bg-border mx-1" />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                >
                                    <Paperclip className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Rich Text Content */}
                    <div className="space-y-2">
                        <Label htmlFor="content">Message *</Label>
                        {isPreview ? (
                            <div className="min-h-[300px] p-3 border rounded-md bg-muted/30">
                                <div className="text-sm text-muted-foreground mb-2">
                                    Rich text editor preview
                                </div>
                                <div 
                                    className="prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{ __html: formData.content || 'Type your message here...' }}
                                />
                            </div>
                        ) : (
                            <div
                                contentEditable
                                className="min-h-[300px] p-3 border rounded-b-md focus:outline-none focus:ring-2 focus:ring-primary prose prose-sm max-w-none"
                                style={{ minHeight: '300px' }}
                                suppressContentEditableWarning={true}
                                onInput={(e) => {
                                    setFormData({ ...formData, content: e.currentTarget.innerHTML || '' });
                                }}
                                onKeyDown={handleKeyDown}
                                dangerouslySetInnerHTML={{ __html: formData.content || '<p>Type your message here...</p>' }}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}