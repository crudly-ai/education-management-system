import { useState } from 'react';
import { ContactList } from './contact-list';
import { ChatWindow } from './chat-window';
import { Contact } from './chat-data';

export interface ChatLayoutProps {
    isPreview?: boolean;
}

export function ChatLayout({ isPreview = false }: ChatLayoutProps) {
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

    const handleContactSelect = (contact: Contact) => {
        setSelectedContact(contact);
    };

    const handleBackToList = () => {
        setSelectedContact(null);
    };

    return (
        <div className="h-full flex bg-background">
            {/* Contact List - Grid 1 */}
            <div className={`border-r bg-background flex-shrink-0 ${
                selectedContact ? 'hidden md:block' : 'block'
            } w-full md:w-80`}>
                <ContactList
                    selectedContact={selectedContact}
                    onContactSelect={handleContactSelect}
                    isPreview={isPreview}
                />
            </div>

            {/* Chat Window - Grid 2 */}
            <div className={`flex-1 bg-background ${
                selectedContact ? 'block' : 'hidden md:block'
            }`}>
                {selectedContact ? (
                    <ChatWindow
                        contact={selectedContact}
                        onBack={handleBackToList}
                        isPreview={isPreview}
                    />
                ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                            <div className="text-lg font-medium mb-2">No chat selected</div>
                            <div className="text-sm">Select a contact to start chatting</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}