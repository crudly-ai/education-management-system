import { useState } from 'react';
import { EmailSidebar } from './email-sidebar';
import { EmailList } from './email-list';
import { EmailViewer } from './email-viewer';
import { EmailComposer } from './email-composer';

export interface Email {
    id: number;
    subject: string;
    from: { name: string; email: string };
    to: string[];
    content: string;
    timestamp: string;
    isRead: boolean;
    isStarred: boolean;
    hasAttachments: boolean;
    folder: 'inbox' | 'sent' | 'draft' | 'junk' | 'trash';
    priority?: 'high' | 'normal' | 'low';
}

export interface EmailLayoutProps {
    isPreview?: boolean;
}

export function EmailLayout({ isPreview = false }: EmailLayoutProps) {
    const [selectedFolder, setSelectedFolder] = useState<string>('inbox');
    const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
    const [isComposing, setIsComposing] = useState(false);
    const [replyingTo, setReplyingTo] = useState<Email | null>(null);

    const handleEmailSelect = (email: Email) => {
        setSelectedEmail(email);
        setIsComposing(false);
        setReplyingTo(null);
    };

    const handleCompose = () => {
        setIsComposing(true);
        setSelectedEmail(null);
        setReplyingTo(null);
    };

    const handleReply = (email: Email) => {
        setReplyingTo(email);
        setIsComposing(true);
        setSelectedEmail(null);
    };

    const handleBack = () => {
        setSelectedEmail(null);
        setIsComposing(false);
        setReplyingTo(null);
    };

    return (
        <div className="h-full flex bg-background">
            {/* Sidebar - Grid 1 */}
            <div className="w-64 border-r bg-background flex-shrink-0">
                <EmailSidebar
                    selectedFolder={selectedFolder}
                    onFolderSelect={setSelectedFolder}
                    onCompose={handleCompose}
                    isPreview={isPreview}
                />
            </div>

            {/* Email List - Grid 2 */}
            <div className="w-80 border-r bg-background flex-shrink-0">
                <EmailList
                    folder={selectedFolder}
                    selectedEmail={selectedEmail}
                    onEmailSelect={handleEmailSelect}
                    isPreview={isPreview}
                />
            </div>

            {/* Email View/Compose - Grid 3 */}
            <div className="flex-1 bg-background">
                {isComposing ? (
                    <EmailComposer
                        replyTo={replyingTo}
                        onBack={handleBack}
                        isPreview={isPreview}
                    />
                ) : selectedEmail ? (
                    <EmailViewer
                        email={selectedEmail}
                        onReply={handleReply}
                        onBack={handleBack}
                        isPreview={isPreview}
                    />
                ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                            <div className="text-lg font-medium mb-2">No email selected</div>
                            <div className="text-sm">Select an email to view its content</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}