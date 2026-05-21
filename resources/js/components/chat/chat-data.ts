export interface Contact {
    id: number;
    name: string;
    avatar?: string;
    isOnline: boolean;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
    status?: string;
}

export interface Message {
    id: number;
    senderId: number;
    senderName: string;
    content: string;
    timestamp: string;
    type: 'text' | 'file' | 'system';
    fileName?: string;
    fileSize?: string;
    isOwn: boolean;
}

export const sampleContacts: Contact[] = [
    {
        id: 1,
        name: 'John Smith',
        isOnline: true,
        lastMessage: 'Hey, how are you doing?',
        lastMessageTime: '2 min ago',
        unreadCount: 2,
        status: 'Available'
    },
    {
        id: 2,
        name: 'Sarah Johnson',
        isOnline: true,
        lastMessage: 'The project files are ready for review',
        lastMessageTime: '5 min ago',
        unreadCount: 0,
        status: 'In a meeting'
    },
    {
        id: 3,
        name: 'Mike Wilson',
        isOnline: false,
        lastMessage: 'Thanks for the update!',
        lastMessageTime: '1 hour ago',
        unreadCount: 1,
        status: 'Away'
    },
    {
        id: 4,
        name: 'Emily Davis',
        isOnline: true,
        lastMessage: 'Can we schedule a call tomorrow?',
        lastMessageTime: '2 hours ago',
        unreadCount: 0,
        status: 'Available'
    },
    {
        id: 5,
        name: 'Alex Brown',
        isOnline: false,
        lastMessage: 'Perfect! Let me know when you\'re ready.',
        lastMessageTime: '3 hours ago',
        unreadCount: 3,
        status: 'Offline'
    },
    {
        id: 6,
        name: 'Lisa Chen',
        isOnline: true,
        lastMessage: 'The design looks great!',
        lastMessageTime: '1 day ago',
        unreadCount: 0,
        status: 'Available'
    },
    {
        id: 7,
        name: 'David Miller',
        isOnline: false,
        lastMessage: 'I\'ll send the documents shortly',
        lastMessageTime: '2 days ago',
        unreadCount: 0,
        status: 'Busy'
    },
    {
        id: 8,
        name: 'Anna Taylor',
        isOnline: true,
        lastMessage: 'Great job on the presentation!',
        lastMessageTime: '3 days ago',
        unreadCount: 1,
        status: 'Available'
    }
];

export const sampleMessages: Record<number, Message[]> = {
    1: [
        {
            id: 1,
            senderId: 1,
            senderName: 'John Smith',
            content: 'Hi there! How are you doing today?',
            timestamp: '2024-01-27 10:30:00',
            type: 'text',
            isOwn: false
        },
        {
            id: 2,
            senderId: 0,
            senderName: 'You',
            content: 'Hey John! I\'m doing great, thanks for asking. How about you?',
            timestamp: '2024-01-27 10:32:00',
            type: 'text',
            isOwn: true
        },
        {
            id: 3,
            senderId: 1,
            senderName: 'John Smith',
            content: 'I\'m good too! Working on the new project. Have you seen the latest designs?',
            timestamp: '2024-01-27 10:35:00',
            type: 'text',
            isOwn: false
        },
        {
            id: 4,
            senderId: 0,
            senderName: 'You',
            content: 'Not yet, could you share them?',
            timestamp: '2024-01-27 10:36:00',
            type: 'text',
            isOwn: true
        },
        {
            id: 5,
            senderId: 1,
            senderName: 'John Smith',
            content: 'Sure! Here are the mockups',
            timestamp: '2024-01-27 10:37:00',
            type: 'file',
            fileName: 'project-mockups.zip',
            fileSize: '2.4 MB',
            isOwn: false
        },
        {
            id: 6,
            senderId: 1,
            senderName: 'John Smith',
            content: 'Hey, how are you doing?',
            timestamp: '2024-01-27 11:58:00',
            type: 'text',
            isOwn: false
        }
    ],
    2: [
        {
            id: 1,
            senderId: 2,
            senderName: 'Sarah Johnson',
            content: 'Good morning! I\'ve finished reviewing the project requirements.',
            timestamp: '2024-01-27 09:15:00',
            type: 'text',
            isOwn: false
        },
        {
            id: 2,
            senderId: 0,
            senderName: 'You',
            content: 'That\'s great! Any feedback or concerns?',
            timestamp: '2024-01-27 09:20:00',
            type: 'text',
            isOwn: true
        },
        {
            id: 3,
            senderId: 2,
            senderName: 'Sarah Johnson',
            content: 'Overall looks good. I have a few suggestions in the document.',
            timestamp: '2024-01-27 09:22:00',
            type: 'text',
            isOwn: false
        },
        {
            id: 4,
            senderId: 2,
            senderName: 'Sarah Johnson',
            content: 'The project files are ready for review',
            timestamp: '2024-01-27 10:55:00',
            type: 'text',
            isOwn: false
        }
    ],
    3: [
        {
            id: 1,
            senderId: 0,
            senderName: 'You',
            content: 'Hi Mike! Just wanted to update you on the progress.',
            timestamp: '2024-01-27 08:30:00',
            type: 'text',
            isOwn: true
        },
        {
            id: 2,
            senderId: 3,
            senderName: 'Mike Wilson',
            content: 'Thanks for the update! Everything looks on track.',
            timestamp: '2024-01-27 09:00:00',
            type: 'text',
            isOwn: false
        },
        {
            id: 3,
            senderId: 3,
            senderName: 'Mike Wilson',
            content: 'I\'ll review the code changes this afternoon.',
            timestamp: '2024-01-27 09:45:00',
            type: 'text',
            isOwn: false
        }
    ],
    4: [
        {
            id: 1,
            senderId: 4,
            senderName: 'Emily Davis',
            content: 'Hi! I wanted to discuss the upcoming presentation.',
            timestamp: '2024-01-27 08:00:00',
            type: 'text',
            isOwn: false
        },
        {
            id: 2,
            senderId: 0,
            senderName: 'You',
            content: 'Sure! What aspects would you like to cover?',
            timestamp: '2024-01-27 08:15:00',
            type: 'text',
            isOwn: true
        },
        {
            id: 3,
            senderId: 4,
            senderName: 'Emily Davis',
            content: 'Can we schedule a call tomorrow?',
            timestamp: '2024-01-27 08:30:00',
            type: 'text',
            isOwn: false
        }
    ]
};

export function getContactById(id: number): Contact | undefined {
    return sampleContacts.find(contact => contact.id === id);
}

export function getMessagesByContactId(contactId: number): Message[] {
    return sampleMessages[contactId] || [];
}