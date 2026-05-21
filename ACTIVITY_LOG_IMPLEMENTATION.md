# Activity Log Implementation Guide

Complete guide to implement user activity tracking using Spatie Activity Log + Custom Frontend Tracking.

---

## Table of Contents
1. [Backend Setup (Spatie Activity Log)](#1-backend-setup)
2. [Frontend Tracking Utilities](#2-frontend-tracking-utilities)
3. [Automatic Tracking Points](#3-automatic-tracking-points)
4. [Manual Tracking Points](#4-manual-tracking-points)
5. [Activity Log Page (Admin)](#5-activity-log-page-admin)
6. [Testing](#6-testing)

---

## 1. Backend Setup (Spatie Activity Log)

### Step 1.1: Install Spatie Activity Log Package

```bash
composer require spatie/laravel-activitylog
php artisan vendor:publish --provider="Spatie\Activitylog\ActivitylogServiceProvider" --tag="activitylog-migrations"
php artisan migrate
```

### Step 1.2: Create Activity Tracking Controller

**File:** `app/Http/Controllers/ActivityLogController.php`

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\Activitylog\Models\Activity;

class ActivityLogController extends Controller
{
    public function track(Request $request)
    {
        $request->validate([
            'action' => 'required|string',
            'page' => 'nullable|string',
            'details' => 'nullable|array'
        ]);

        if (!auth()->check()) {
            return response()->json(['success' => false], 401);
        }

        activity()
            ->causedBy(auth()->user())
            ->withProperties([
                'action' => $request->action,
                'page' => $request->page,
                'details' => $request->details,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent()
            ])
            ->log($request->action);

        return response()->json(['success' => true]);
    }

    public function getUserActivities($userId)
    {
        if (!auth()->user()->can('view_user')) {
            abort(403);
        }

        $activities = Activity::where('causer_id', $userId)
            ->where('causer_type', 'App\\Models\\User')
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return response()->json($activities);
    }
}
```

### Step 1.3: Add Routes

**File:** `routes/web.php`

```php
// Activity tracking routes
Route::middleware(['auth'])->group(function () {
    Route::post('/api/track-activity', [ActivityLogController::class, 'track'])->name('activity.track');
    Route::get('/users/{user}/activity-log', [UserController::class, 'activityLog'])->name('users.activity-log');
    Route::get('/api/users/{user}/activities', [ActivityLogController::class, 'getUserActivities'])->name('users.activities');
});
```

### Step 1.4: Add Activity Log Method to UserController

**File:** `app/Http/Controllers/UserController.php`

Add this method:

```php
public function activityLog(User $user)
{
    if (!auth()->user()->can('view_user')) {
        abort(403, 'You do not have permission to view user activities.');
    }

    return Inertia::render('users/activity-log', [
        'user' => $user,
    ]);
}
```

### Step 1.5: Configure Models for Auto-Tracking

**File:** `app/Models/Crudly/CrudlyProject.php`

Add at the top:

```php
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class CrudlyProject extends Model
{
    use LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'description', 'is_public'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}
```

### Step 1.6: Track Authentication Events

**File:** `app/Providers/EventServiceProvider.php`

```php
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Events\Verified;

protected $listen = [
    Registered::class => [
        function ($event) {
            activity()
                ->causedBy($event->user)
                ->withProperties(['ip_address' => request()->ip()])
                ->log('registered');
        },
    ],
    Login::class => [
        function ($event) {
            activity()
                ->causedBy($event->user)
                ->withProperties(['ip_address' => request()->ip()])
                ->log('logged_in');
        },
    ],
    Logout::class => [
        function ($event) {
            activity()
                ->causedBy($event->user)
                ->withProperties(['ip_address' => request()->ip()])
                ->log('logged_out');
        },
    ],
    Verified::class => [
        function ($event) {
            activity()
                ->causedBy($event->user)
                ->withProperties(['ip_address' => request()->ip()])
                ->log('email_verified');
        },
    ],
];
```

---

## 2. Frontend Tracking Utilities

### Step 2.1: Create Activity Tracker Utility

**File:** `resources/js/utils/activity-tracker.ts`

```typescript
export const trackActivity = async (action: string, details?: any) => {
    // Only track for authenticated users
    const metaAuth = document.querySelector('meta[name="user-authenticated"]');
    if (!metaAuth || metaAuth.getAttribute('content') !== 'true') {
        return;
    }

    try {
        await fetch('/api/track-activity', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
            },
            body: JSON.stringify({
                action,
                page: window.location.pathname,
                details: details || {}
            })
        });
    } catch (error) {
        // Silent fail - don't break user experience
        console.error('Activity tracking failed:', error);
    }
};
```

### Step 2.2: Create React Hook

**File:** `resources/js/hooks/use-activity-tracker.ts`

```typescript
import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { trackActivity } from '@/utils/activity-tracker';

export const useActivityTracker = (pageName?: string) => {
    const { auth } = usePage().props as any;

    // Auto-track page views
    useEffect(() => {
        if (auth?.user) {
            const page = pageName || window.location.pathname.replace(/\//g, '_').replace(/^_/, '') || 'home';
            trackActivity(`page_viewed_${page}`);
        }
    }, [auth?.user, pageName]);

    // Return tracking function for manual events
    return {
        track: trackActivity
    };
};
```

### Step 2.3: Add Meta Tag for Auth Check

**File:** `resources/views/app.blade.php`

Add inside `<head>`:

```blade
<meta name="user-authenticated" content="{{ auth()->check() ? 'true' : 'false' }}">
```

---

## 3. Automatic Tracking Points

### 3.1: Track Page Views

Add to each page component:

```typescript
// pages/crudly/workspace.tsx
import { useActivityTracker } from '@/hooks/use-activity-tracker';

export default function Workspace() {
    useActivityTracker('workspace'); // Auto-tracks page view
    
    // ... rest of component
}
```

**Pages to add:**
- `pages/crudly/workspace.tsx` → `'workspace'`
- `pages/crudly/builder/index.tsx` → `'builder'`
- `pages/crudly/projects/index.tsx` → `'projects'`
- `pages/dashboard.tsx` → `'dashboard'`
- `pages/users/index.tsx` → `'users'`

### 3.2: Backend Auto-Tracking (Already Done)

These are automatically tracked by Spatie:
- ✅ User registered
- ✅ User logged in
- ✅ User logged out
- ✅ Email verified
- ✅ Project created/updated/deleted (if LogsActivity trait added)

---

## 4. Manual Tracking Points

### 4.1: Workspace Page

**File:** `resources/js/pages/crudly/workspace.tsx`

```typescript
import { useActivityTracker } from '@/hooks/use-activity-tracker';

export default function Workspace() {
    const { track } = useActivityTracker('workspace');

    const handlePromptSubmit = async () => {
        // ... existing code
        track('workspace_prompt_submitted', { prompt: promptInput });
        // ... rest of code
    };

    const handleDeleteProject = (project: Project) => {
        track('workspace_delete_clicked', { project_name: project.name });
        // ... existing code
    };

    return (
        // ... JSX
    );
}
```

### 4.2: Builder Page

**File:** `resources/js/pages/crudly/builder/index.tsx`

```typescript
import { useActivityTracker } from '@/hooks/use-activity-tracker';

export default function CrudlyBuilder() {
    const { track } = useActivityTracker('builder');

    const addTab = () => {
        track('builder_tab_added');
        // ... existing code
    };

    const handleDownloadCode = async () => {
        track('builder_download_clicked', { 
            tabs_count: tabs.length,
            project_name: currentProject?.name 
        });
        // ... existing code
    };

    const handleSaveProject = async (projectData) => {
        track('builder_project_saved', { project_name: projectData.name });
        // ... existing code
    };

    return (
        // ... JSX
    );
}
```

### 4.3: AI Chat Component

**File:** `resources/js/pages/crudly/builder/components/ai-chat.tsx`

```typescript
import { trackActivity } from '@/utils/activity-tracker';

export default function AIChat({ ... }) {
    const sendMessage = async () => {
        // ... existing code
        trackActivity('ai_chat_message_sent', { 
            prompt: text,
            has_context: currentTabs.length > 0 
        });
        // ... rest of code
    };

    return (
        // ... JSX
    );
}
```

### 4.4: Project Save Modal

**File:** `resources/js/pages/crudly/builder/components/project-save-modal.tsx`

```typescript
import { trackActivity } from '@/utils/activity-tracker';

// Inside form submit
const handleSubmit = () => {
    trackActivity('project_save_modal_submitted', { 
        project_name: formData.name,
        is_public: formData.is_public 
    });
    // ... existing code
};
```

---

## 5. Activity Log Page (Admin)

### Step 5.1: Add Activity Log Button to Users Page

**File:** `resources/js/pages/users/index.tsx`

Add to imports:
```typescript
import { Activity } from 'lucide-react';
```

Add to `customRowActions`:
```typescript
const customRowActions = (item: any) => (
    <>
        {/* ... existing actions ... */}
        {hasPermission('view_user') && (
            <Button
                variant="ghost"
                size="sm"
                onClick={() => router.visit(`/users/${item.id}/activity-log`)}
                title="View Activity Log"
            >
                <Activity className="h-4 w-4" />
            </Button>
        )}
    </>
);
```

### Step 5.2: Create Activity Log Page Component

**File:** `resources/js/pages/users/activity-log.tsx`

```typescript
import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { createBreadcrumbs } from '@/layouts/app/breadcrumbs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Badge } from '@/components/ui/feedback/badge';
import { Button } from '@/components/ui/form/button';
import { useTranslations } from '@/hooks/use-translations';
import { useFormatters } from '@/utils/formatters';
import { 
    Activity, 
    Calendar, 
    Globe, 
    User, 
    LogIn, 
    LogOut, 
    Mail,
    FileText,
    Download,
    Save,
    Trash2,
    Eye,
    ArrowLeft
} from 'lucide-react';

interface ActivityLogProps {
    user: {
        id: number;
        name: string;
        email: string;
    };
}

interface ActivityItem {
    id: number;
    log_name: string;
    description: string;
    properties: {
        action?: string;
        page?: string;
        details?: any;
        ip_address?: string;
        user_agent?: string;
    };
    created_at: string;
}

export default function ActivityLog({ user }: ActivityLogProps) {
    const { t } = useTranslations();
    const { formatDateTime } = useFormatters();
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        loadActivities();
    }, [currentPage]);

    const loadActivities = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/users/${user.id}/activities?page=${currentPage}`);
            const data = await response.json();
            setActivities(data.data);
            setTotalPages(data.last_page);
        } catch (error) {
            console.error('Failed to load activities:', error);
        } finally {
            setLoading(false);
        }
    };

    const getActionIcon = (action: string) => {
        if (action.includes('login')) return <LogIn className="h-4 w-4" />;
        if (action.includes('logout')) return <LogOut className="h-4 w-4" />;
        if (action.includes('register')) return <User className="h-4 w-4" />;
        if (action.includes('email')) return <Mail className="h-4 w-4" />;
        if (action.includes('created')) return <FileText className="h-4 w-4" />;
        if (action.includes('download')) return <Download className="h-4 w-4" />;
        if (action.includes('save')) return <Save className="h-4 w-4" />;
        if (action.includes('delete')) return <Trash2 className="h-4 w-4" />;
        if (action.includes('view')) return <Eye className="h-4 w-4" />;
        return <Activity className="h-4 w-4" />;
    };

    const getActionColor = (action: string) => {
        if (action.includes('login') || action.includes('register')) return 'bg-green-100 text-green-800';
        if (action.includes('logout')) return 'bg-gray-100 text-gray-800';
        if (action.includes('delete')) return 'bg-red-100 text-red-800';
        if (action.includes('email')) return 'bg-blue-100 text-blue-800';
        if (action.includes('created')) return 'bg-purple-100 text-purple-800';
        return 'bg-gray-100 text-gray-800';
    };

    const breadcrumbs = createBreadcrumbs('users', user.name, 'Activity Log');

    return (
        <AuthenticatedLayout breadcrumbs={breadcrumbs}>
            <Head title={`${user.name} - Activity Log`} />
            <div className="p-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.visit('/users')}
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    {t('Back')}
                                </Button>
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Activity className="h-5 w-5" />
                                        {t('Activity Log')}
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {user.name} ({user.email})
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                                <p className="mt-2 text-sm text-gray-500">{t('Loading...')}</p>
                            </div>
                        ) : activities.length === 0 ? (
                            <div className="text-center py-8">
                                <Activity className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                <p className="text-gray-500">{t('No activities found')}</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {activities.map((activity) => (
                                    <div
                                        key={activity.id}
                                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`p-2 rounded-lg ${getActionColor(activity.description)}`}>
                                                {getActionIcon(activity.description)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <Badge variant="outline" className="text-xs">
                                                        {activity.description.replace(/_/g, ' ')}
                                                    </Badge>
                                                    <span className="text-xs text-gray-500">
                                                        {formatDateTime(activity.created_at)}
                                                    </span>
                                                </div>
                                                {activity.properties?.details && (
                                                    <div className="text-sm text-gray-600 mb-2">
                                                        {JSON.stringify(activity.properties.details)}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                                    {activity.properties?.ip_address && (
                                                        <div className="flex items-center gap-1">
                                                            <Globe className="h-3 w-3" />
                                                            {activity.properties.ip_address}
                                                        </div>
                                                    )}
                                                    {activity.properties?.page && (
                                                        <div className="flex items-center gap-1">
                                                            <FileText className="h-3 w-3" />
                                                            {activity.properties.page}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-2 mt-6">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                        >
                                            {t('Previous')}
                                        </Button>
                                        <span className="text-sm text-gray-600">
                                            {t('Page')} {currentPage} {t('of')} {totalPages}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                        >
                                            {t('Next')}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
```

---

## 6. Testing

### Test Checklist

**Backend:**
- [ ] Install Spatie package successfully
- [ ] Migration runs without errors
- [ ] `/api/track-activity` endpoint works
- [ ] `/api/users/{id}/activities` returns data
- [ ] Authentication events are logged

**Frontend:**
- [ ] Page views are tracked automatically
- [ ] Button clicks are tracked
- [ ] Activity tracker doesn't break on errors
- [ ] Only authenticated users are tracked

**Activity Log Page:**
- [ ] Activity log button appears in users table
- [ ] Activity log page loads correctly
- [ ] Activities display with proper icons
- [ ] Pagination works
- [ ] Back button returns to users page

**Manual Testing:**
1. Register new user → Check activity log shows "registered"
2. Login → Check activity log shows "logged_in"
3. Visit workspace → Check activity log shows "page_viewed_workspace"
4. Create project → Check activity log shows "created"
5. Click download → Check activity log shows "builder_download_clicked"
6. Logout → Check activity log shows "logged_out"

---

## Summary

**What Gets Tracked:**

**Automatic (Spatie):**
- ✅ User registered
- ✅ User logged in/out
- ✅ Email verified
- ✅ Project created/updated/deleted

**Manual (Custom):**
- ✅ Page views (workspace, builder, etc.)
- ✅ Button clicks (download, save, delete)
- ✅ AI chat usage
- ✅ Form submissions
- ✅ Any custom events

**Admin View:**
- ✅ Activity log page per user
- ✅ Timeline view with icons
- ✅ IP address & user agent
- ✅ Pagination
- ✅ Action details

---

## Implementation Time Estimate

| Task | Time |
|------|------|
| Backend setup | 1 hour |
| Frontend utilities | 30 min |
| Add tracking points | 1 hour |
| Activity log page | 2 hours |
| Testing | 1 hour |
| **Total** | **5.5 hours** |

---

## Next Steps

1. Install Spatie package
2. Create backend endpoints
3. Create frontend utilities
4. Add tracking to key pages
5. Create activity log page
6. Test thoroughly

---

**End of Implementation Guide**
