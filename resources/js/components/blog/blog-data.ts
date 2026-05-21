export interface BlogPost {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featuredImage?: string;
    category: string;
    tags: string[];
    author: {
        name: string;
        email: string;
        avatar?: string;
    };
    status: 'published' | 'draft' | 'scheduled';
    publishedAt?: string;
    createdAt: string;
    updatedAt: string;
    views: number;
    likes: number;
    comments: number;
}

export interface BlogCategory {
    id: number;
    name: string;
    slug: string;
    description: string;
    postCount: number;
}

export const blogCategories: BlogCategory[] = [
    { id: 1, name: 'Technology', slug: 'technology', description: 'Latest tech trends and tutorials', postCount: 8 },
    { id: 2, name: 'Business', slug: 'business', description: 'Business insights and strategies', postCount: 5 },
    { id: 3, name: 'Tutorials', slug: 'tutorials', description: 'Step-by-step guides', postCount: 6 },
    { id: 4, name: 'News', slug: 'news', description: 'Industry news and updates', postCount: 3 },
    { id: 5, name: 'Tips & Tricks', slug: 'tips', description: 'Helpful tips and tricks', postCount: 4 }
];

export const sampleBlogPosts: BlogPost[] = [
    {
        id: 1,
        title: 'Getting Started with React 19: New Features and Improvements',
        slug: 'getting-started-react-19',
        excerpt: 'Explore the latest features in React 19 including concurrent rendering, automatic batching, and improved server components.',
        content: `<h2>Introduction to React 19</h2><p>React 19 brings exciting new features that make building modern web applications even more efficient...</p>`,
        featuredImage: '/images/blog/react-19.jpg',
        category: 'Technology',
        tags: ['React', 'JavaScript', 'Frontend', 'Web Development'],
        author: { name: 'John Smith', email: 'john@example.com' },
        status: 'published',
        publishedAt: '2024-01-27 10:00:00',
        createdAt: '2024-01-26 15:30:00',
        updatedAt: '2024-01-27 10:00:00',
        views: 1250,
        likes: 89,
        comments: 12
    },
    {
        id: 2,
        title: 'Building Scalable APIs with Laravel 11',
        slug: 'building-scalable-apis-laravel-11',
        excerpt: 'Learn how to create robust and scalable APIs using Laravel 11 with best practices for performance and security.',
        content: `<h2>API Development with Laravel</h2><p>Laravel 11 introduces several improvements for API development...</p>`,
        featuredImage: '/images/blog/laravel-api.jpg',
        category: 'Technology',
        tags: ['Laravel', 'PHP', 'API', 'Backend'],
        author: { name: 'Sarah Johnson', email: 'sarah@example.com' },
        status: 'published',
        publishedAt: '2024-01-26 14:30:00',
        createdAt: '2024-01-25 09:15:00',
        updatedAt: '2024-01-26 14:30:00',
        views: 980,
        likes: 67,
        comments: 8
    },
    {
        id: 3,
        title: 'The Future of Remote Work: Trends and Predictions for 2024',
        slug: 'future-remote-work-2024',
        excerpt: 'Discover the emerging trends in remote work and how businesses are adapting to the new normal in 2024.',
        content: `<h2>Remote Work Evolution</h2><p>The landscape of remote work continues to evolve...</p>`,
        category: 'Business',
        tags: ['Remote Work', 'Business', 'Productivity', 'Future'],
        author: { name: 'Mike Wilson', email: 'mike@example.com' },
        status: 'published',
        publishedAt: '2024-01-25 11:00:00',
        createdAt: '2024-01-24 16:45:00',
        updatedAt: '2024-01-25 11:00:00',
        views: 1450,
        likes: 102,
        comments: 18
    },
    {
        id: 4,
        title: 'Complete Guide to TypeScript for Beginners',
        slug: 'typescript-beginners-guide',
        excerpt: 'A comprehensive tutorial covering TypeScript basics, advanced features, and best practices for new developers.',
        content: `<h2>Why TypeScript?</h2><p>TypeScript adds static typing to JavaScript...</p>`,
        category: 'Tutorials',
        tags: ['TypeScript', 'JavaScript', 'Tutorial', 'Programming'],
        author: { name: 'Emily Davis', email: 'emily@example.com' },
        status: 'published',
        publishedAt: '2024-01-24 09:30:00',
        createdAt: '2024-01-23 14:20:00',
        updatedAt: '2024-01-24 09:30:00',
        views: 2100,
        likes: 156,
        comments: 24
    },
    {
        id: 5,
        title: 'Database Optimization Techniques for High-Performance Applications',
        slug: 'database-optimization-techniques',
        excerpt: 'Learn essential database optimization strategies to improve application performance and reduce query execution time.',
        content: `<h2>Database Performance Matters</h2><p>Optimizing database queries is crucial for application performance...</p>`,
        category: 'Technology',
        tags: ['Database', 'Performance', 'SQL', 'Optimization'],
        author: { name: 'Alex Brown', email: 'alex@example.com' },
        status: 'draft',
        createdAt: '2024-01-27 08:15:00',
        updatedAt: '2024-01-27 08:15:00',
        views: 0,
        likes: 0,
        comments: 0
    },
    {
        id: 6,
        title: 'Effective Project Management Strategies for Tech Teams',
        slug: 'project-management-tech-teams',
        excerpt: 'Discover proven project management methodologies and tools that help tech teams deliver projects on time and within budget.',
        content: `<h2>Managing Tech Projects</h2><p>Successful project management in tech requires...</p>`,
        category: 'Business',
        tags: ['Project Management', 'Leadership', 'Agile', 'Teams'],
        author: { name: 'Lisa Chen', email: 'lisa@example.com' },
        status: 'published',
        publishedAt: '2024-01-23 16:00:00',
        createdAt: '2024-01-22 10:30:00',
        updatedAt: '2024-01-23 16:00:00',
        views: 890,
        likes: 73,
        comments: 15
    }
];

export function getBlogPostsByCategory(category?: string): BlogPost[] {
    if (!category || category === 'all') {
        return sampleBlogPosts;
    }
    return sampleBlogPosts.filter(post => post.category.toLowerCase() === category.toLowerCase());
}

export function getBlogPostById(id: number): BlogPost | undefined {
    return sampleBlogPosts.find(post => post.id === id);
}

export function getBlogStats() {
    const total = sampleBlogPosts.length;
    const published = sampleBlogPosts.filter(post => post.status === 'published').length;
    const drafts = sampleBlogPosts.filter(post => post.status === 'draft').length;
    const scheduled = sampleBlogPosts.filter(post => post.status === 'scheduled').length;
    
    return { total, published, drafts, scheduled };
}