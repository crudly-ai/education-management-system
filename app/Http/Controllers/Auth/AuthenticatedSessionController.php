<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        // Check if there's remix intent
        if ($request->session()->has('remixProjectSlug')) {
            $originalSlug = $request->session()->get('remixProjectSlug');
            
            try {
                $originalProject = \App\Models\Crudly\CrudlyProject::where('slug', $originalSlug)
                    ->where('is_public', true)
                    ->firstOrFail();

                $remixedProject = \App\Models\Crudly\CrudlyProject::create([
                    'user_id' => auth()->id(),
                    'name' => $originalProject->name . ' (Remix)',
                    'description' => $originalProject->description,
                    'icon' => $originalProject->icon,
                    'project_data' => $originalProject->project_data,
                    'is_public' => false,
                ]);
                
                // Clear the session data
                $request->session()->forget('remixProjectSlug');
                
                // Redirect to dashboard since crudly-builder is removed
                return redirect()->route('dashboard');
            } catch (\Exception $e) {
                // If remix fails, clear session and continue to normal flow
                $request->session()->forget('remixProjectSlug');
            }
        }
        
        // Check if there's guest project data to save
        if ($request->session()->has('guestProjectData')) {
            $guestData = $request->session()->get('guestProjectData');
            $guestChatMessages = $request->session()->get('guestChatMessages', []);
            
            // Generate friendly project name and description
            [$projectName, $description] = $this->generateFriendlyProjectDetails($guestData);
            
            // Create project with friendly name and description
            $project = \App\Models\Crudly\CrudlyProject::create([
                'user_id' => auth()->id(),
                'name' => $projectName,
                'description' => $description,
                'icon' => 'Building2',
                'project_data' => $guestData,
                'is_public' => false,
            ]);
            
            // Save chat messages if any
            if (!empty($guestChatMessages)) {
                foreach ($guestChatMessages as $message) {
                    \App\Models\ProjectChatMessage::create([
                        'project_slug' => $project->slug,
                        'role' => $message['type'] === 'user' ? 'user' : 'assistant',
                        'content' => $message['content']
                    ]);
                }
            }
            
            // Clear the session data
            $request->session()->forget(['guestProjectData', 'guestChatMessages']);
            
            // Redirect to dashboard since crudly-builder is removed
            return redirect()->route('dashboard');
        }

        return redirect()->intended(route('dashboard', absolute: false));
    }

    private function generateFriendlyProjectDetails($guestData)
    {
        $projectTemplates = [
            'Blog System' => 'A content management system for creating and managing blog posts, categories, and user interactions.',
            'E-commerce Store' => 'An online store platform for managing products, orders, customers, and inventory.',
            'Task Manager' => 'A productivity application for organizing tasks, projects, and team collaboration.',
            'CRM System' => 'A customer relationship management system for tracking leads, contacts, and sales.',
            'Inventory Tracker' => 'A system for managing stock levels, suppliers, and warehouse operations.',
            'Booking Platform' => 'A reservation system for scheduling appointments, rooms, or services.',
            'Social Network' => 'A platform for user connections, posts, and social interactions.',
            'Learning Portal' => 'An educational platform for courses, students, and learning materials.'
        ];

        // Try to generate name based on models
        if (isset($guestData['tabs']) && count($guestData['tabs']) > 0) {
            $modelNames = array_map(function($tab) {
                return $tab['modelName'] ?? 'Model';
            }, $guestData['tabs']);
            
            $primaryModel = $modelNames[0];
            $modelCount = count($modelNames);
            
            // Check for common patterns
            if (in_array($primaryModel, ['Post', 'Article', 'Blog'])) {
                return ['Blog System', $projectTemplates['Blog System']];
            }
            if (in_array($primaryModel, ['Product', 'Order', 'Shop'])) {
                return ['E-commerce Store', $projectTemplates['E-commerce Store']];
            }
            if (in_array($primaryModel, ['Task', 'Todo', 'Project'])) {
                return ['Task Manager', $projectTemplates['Task Manager']];
            }
            if (in_array($primaryModel, ['User', 'Customer', 'Contact'])) {
                return ['CRM System', $projectTemplates['CRM System']];
            }
            
            // Use primary model name
            $name = $primaryModel . ' Management';
            $description = "A management system for {$primaryModel} with {$modelCount} models: " . implode(', ', $modelNames) . '.';
            return [$name, $description];
        }
        
        // Fallback to random template
        $randomTemplate = array_rand($projectTemplates);
        return [$randomTemplate, $projectTemplates[$randomTemplate]];
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
