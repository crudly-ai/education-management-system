<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Assign User role to new registrant
        $userRole = Role::firstOrCreate(['name' => 'User']);
        $user->assignRole($userRole);

        event(new Registered($user));

        Auth::login($user);

        // Check if there's guest project data to save
        if ($request->session()->has('guestProjectData')) {
            $guestData = $request->session()->get('guestProjectData');

            // Generate friendly project name and description
            [$projectName, $description] = $this->generateFriendlyProjectDetails($guestData);

            // Create project with friendly name and description
            $project = \App\Models\Crudly\CrudlyProject::create([
                'user_id' => $user->id,
                'name' => $projectName,
                'description' => $description,
                'icon' => 'Building2',
                'project_data' => $guestData,
                'is_public' => false,
            ]);

            // Clear the session data
            $request->session()->forget('guestProjectData');

            // Redirect to dashboard since crudly-builder is removed
            return redirect()->route('dashboard');
        }

        return to_route('dashboard');
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
}
