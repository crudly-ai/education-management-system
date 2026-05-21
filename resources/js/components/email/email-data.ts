import { Email } from './email-layout';

export const sampleEmails: Email[] = [
    {
        id: 1,
        subject: 'Welcome to our platform!',
        from: { name: 'Sarah Johnson', email: 'sarah@company.com' },
        to: ['user@example.com'],
        content: `<div>
            <p>Hi there!</p>
            <p>Welcome to our amazing platform. We're excited to have you on board!</p>
            <p>Here are some quick tips to get you started:</p>
            <ul>
                <li>Complete your profile setup</li>
                <li>Explore the dashboard features</li>
                <li>Join our community forum</li>
            </ul>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p>Best regards,<br>The Team</p>
        </div>`,
        timestamp: '2024-01-27 09:30:00',
        isRead: false,
        isStarred: true,
        hasAttachments: false,
        folder: 'inbox',
        priority: 'normal'
    },
    {
        id: 2,
        subject: 'Project Update - Q1 2024',
        from: { name: 'Mike Wilson', email: 'mike@company.com' },
        to: ['team@company.com'],
        content: `<div>
            <p>Team,</p>
            <p>Here's our Q1 2024 project update:</p>
            <h3>Completed Tasks:</h3>
            <ul>
                <li>User authentication system</li>
                <li>Dashboard redesign</li>
                <li>API documentation</li>
            </ul>
            <h3>Upcoming Milestones:</h3>
            <ul>
                <li>Mobile app launch - Feb 15</li>
                <li>Payment integration - Feb 28</li>
            </ul>
            <p>Great work everyone!</p>
            <p>Mike</p>
        </div>`,
        timestamp: '2024-01-27 08:15:00',
        isRead: true,
        isStarred: false,
        hasAttachments: true,
        folder: 'inbox',
        priority: 'high'
    },
    {
        id: 3,
        subject: 'Meeting Reminder: Design Review',
        from: { name: 'Emily Davis', email: 'emily@company.com' },
        to: ['design-team@company.com'],
        content: `<div>
            <p>Hi Design Team,</p>
            <p>This is a reminder about our design review meeting scheduled for tomorrow at 2:00 PM.</p>
            <p><strong>Agenda:</strong></p>
            <ul>
                <li>Homepage redesign review</li>
                <li>Mobile UI components</li>
                <li>Brand guidelines update</li>
            </ul>
            <p>Please bring your latest mockups and be prepared to discuss feedback.</p>
            <p>See you there!</p>
            <p>Emily</p>
        </div>`,
        timestamp: '2024-01-26 16:45:00',
        isRead: true,
        isStarred: false,
        hasAttachments: false,
        folder: 'inbox',
        priority: 'normal'
    },
    {
        id: 4,
        subject: 'Invoice #INV-2024-001',
        from: { name: 'Billing System', email: 'billing@company.com' },
        to: ['accounting@company.com'],
        content: `<div>
            <p>Dear Customer,</p>
            <p>Your invoice for January 2024 is now available.</p>
            <p><strong>Invoice Details:</strong></p>
            <ul>
                <li>Invoice Number: INV-2024-001</li>
                <li>Amount: $1,250.00</li>
                <li>Due Date: February 15, 2024</li>
            </ul>
            <p>Please process payment by the due date to avoid any service interruption.</p>
            <p>Thank you for your business!</p>
        </div>`,
        timestamp: '2024-01-26 14:20:00',
        isRead: false,
        isStarred: false,
        hasAttachments: true,
        folder: 'inbox',
        priority: 'normal'
    },
    {
        id: 5,
        subject: 'Thank you for your order',
        from: { name: 'Order Confirmation', email: 'orders@shop.com' },
        to: ['customer@example.com'],
        content: `<div>
            <p>Hi John,</p>
            <p>Thank you for your recent order! We're processing it now.</p>
            <p><strong>Order Summary:</strong></p>
            <ul>
                <li>Order #: ORD-2024-0156</li>
                <li>Items: 3</li>
                <li>Total: $89.99</li>
            </ul>
            <p>You'll receive a shipping confirmation once your order is on its way.</p>
            <p>Thanks for shopping with us!</p>
        </div>`,
        timestamp: '2024-01-25 11:30:00',
        isRead: true,
        isStarred: false,
        hasAttachments: false,
        folder: 'inbox',
        priority: 'low'
    },
    {
        id: 6,
        subject: 'Re: Project proposal feedback',
        from: { name: 'John Smith', email: 'john@example.com' },
        to: ['client@company.com'],
        content: `<div>
            <p>Hi there,</p>
            <p>Thanks for sending over the project proposal. I've reviewed it with my team.</p>
            <p>Overall, we're very impressed with your approach. We have a few questions:</p>
            <ul>
                <li>Timeline for phase 1 completion</li>
                <li>Resource allocation details</li>
                <li>Testing and QA process</li>
            </ul>
            <p>Could we schedule a call this week to discuss these points?</p>
            <p>Best,<br>John</p>
        </div>`,
        timestamp: '2024-01-25 09:15:00',
        isRead: true,
        isStarred: true,
        hasAttachments: false,
        folder: 'sent',
        priority: 'normal'
    },
    {
        id: 7,
        subject: 'Draft: Newsletter February 2024',
        from: { name: 'Marketing Team', email: 'marketing@company.com' },
        to: ['subscribers@company.com'],
        content: `<div>
            <p>Subject: Exciting Updates This February!</p>
            <p>Dear Subscribers,</p>
            <p>We have some exciting news to share with you this month...</p>
            <p><em>This is a draft email. Please review before sending.</em></p>
        </div>`,
        timestamp: '2024-01-24 15:30:00',
        isRead: false,
        isStarred: false,
        hasAttachments: false,
        folder: 'draft',
        priority: 'normal'
    },
    {
        id: 8,
        subject: 'Suspicious login attempt',
        from: { name: 'Security Alert', email: 'security@spam.com' },
        to: ['user@example.com'],
        content: `<div>
            <p>URGENT: Suspicious activity detected on your account!</p>
            <p>Click here immediately to secure your account...</p>
            <p><em>This appears to be a phishing attempt.</em></p>
        </div>`,
        timestamp: '2024-01-24 12:00:00',
        isRead: false,
        isStarred: false,
        hasAttachments: false,
        folder: 'junk',
        priority: 'normal'
    }
];

export function getEmailsByFolder(folder: string): Email[] {
    if (folder === 'starred') {
        return sampleEmails.filter(email => email.isStarred);
    }
    return sampleEmails.filter(email => email.folder === folder);
}