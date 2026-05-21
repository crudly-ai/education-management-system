<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Yajra\DataTables\Facades\DataTables;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        if (!auth()->user()->can('manage_all_tasks') && !auth()->user()->can('manage_own_tasks')) {
            abort(403, 'You do not have permission to manage tasks.');
        }
        
        if (($request->wantsJson() || $request->ajax()) && !$request->header('X-Inertia')) {
            // Create a query builder with static task data
            $tasks = DB::table(DB::raw('(SELECT 
                1 as id, "Implement User Authentication" as title, "Add login, registration, and password reset functionality" as description, "High" as priority, "In Progress" as status, "John Smith" as assigned_to, "E-commerce Platform" as project, "2024-01-20" as due_date, "2024-01-15" as created_at
                UNION ALL SELECT 2, "Design Homepage Layout", "Create responsive homepage design with hero section and features", "Medium", "To Do", "Sarah Wilson", "E-commerce Platform", "2024-01-25", "2024-01-16"
                UNION ALL SELECT 3, "Setup Database Schema", "Design and implement database tables for products and users", "High", "Done", "Mike Johnson", "E-commerce Platform", "2024-01-18", "2024-01-14"
                UNION ALL SELECT 4, "API Integration", "Integrate payment gateway and shipping APIs", "High", "Review", "Lisa Chen", "E-commerce Platform", "2024-01-30", "2024-01-17"
                UNION ALL SELECT 5, "Mobile App Testing", "Test app functionality on iOS and Android devices", "Medium", "In Progress", "David Brown", "Mobile Banking App", "2024-02-05", "2024-01-18"
                UNION ALL SELECT 6, "Security Audit", "Perform comprehensive security testing and vulnerability assessment", "High", "To Do", "Amy Zhang", "Mobile Banking App", "2024-02-10", "2024-01-19"
                UNION ALL SELECT 7, "User Interface Polish", "Refine UI components and improve user experience", "Low", "In Progress", "Nina Patel", "Mobile Banking App", "2024-02-15", "2024-01-20"
                UNION ALL SELECT 8, "Documentation Update", "Update technical documentation and user guides", "Low", "Done", "Chris Lee", "CRM System", "2024-01-22", "2024-01-21"
            ) as tasks'));
            
            return DataTables::of($tasks)
                ->filterColumn('title', function($query, $keyword) {
                    $query->where('title', 'like', "%{$keyword}%");
                })
                ->filterColumn('assigned_to', function($query, $keyword) {
                    $query->where('assigned_to', 'like', "%{$keyword}%");
                })
                ->make(true);
        }
        
        return Inertia::render('tasks/index');
    }
    
    public function kanban(Request $request)
    {
        if (!auth()->user()->can('manage_all_tasks') && !auth()->user()->can('manage_own_tasks')) {
            abort(403, 'You do not have permission to manage tasks.');
        }
        
        if ($request->header('X-Requested-With') === 'XMLHttpRequest' && !$request->header('X-Inertia')) {
            // Static task data organized by status
            $tasks = [
                'To Do' => [
                    ['id' => 2, 'title' => 'Design Homepage Layout', 'description' => 'Create responsive homepage design with hero section and features', 'priority' => 'Medium', 'assigned_to' => 'Sarah Wilson', 'project' => 'E-commerce Platform', 'due_date' => '2024-01-25', 'created_at' => '2024-01-16'],
                    ['id' => 6, 'title' => 'Security Audit', 'description' => 'Perform comprehensive security testing and vulnerability assessment', 'priority' => 'High', 'assigned_to' => 'Amy Zhang', 'project' => 'Mobile Banking App', 'due_date' => '2024-02-10', 'created_at' => '2024-01-19']
                ],
                'In Progress' => [
                    ['id' => 1, 'title' => 'Implement User Authentication', 'description' => 'Add login, registration, and password reset functionality', 'priority' => 'High', 'assigned_to' => 'John Smith', 'project' => 'E-commerce Platform', 'due_date' => '2024-01-20', 'created_at' => '2024-01-15'],
                    ['id' => 5, 'title' => 'Mobile App Testing', 'description' => 'Test app functionality on iOS and Android devices', 'priority' => 'Medium', 'assigned_to' => 'David Brown', 'project' => 'Mobile Banking App', 'due_date' => '2024-02-05', 'created_at' => '2024-01-18'],
                    ['id' => 7, 'title' => 'User Interface Polish', 'description' => 'Refine UI components and improve user experience', 'priority' => 'Low', 'assigned_to' => 'Nina Patel', 'project' => 'Mobile Banking App', 'due_date' => '2024-02-15', 'created_at' => '2024-01-20']
                ],
                'Review' => [
                    ['id' => 4, 'title' => 'API Integration', 'description' => 'Integrate payment gateway and shipping APIs', 'priority' => 'High', 'assigned_to' => 'Lisa Chen', 'project' => 'E-commerce Platform', 'due_date' => '2024-01-30', 'created_at' => '2024-01-17']
                ],
                'Done' => [
                    ['id' => 3, 'title' => 'Setup Database Schema', 'description' => 'Design and implement database tables for products and users', 'priority' => 'High', 'assigned_to' => 'Mike Johnson', 'project' => 'E-commerce Platform', 'due_date' => '2024-01-18', 'created_at' => '2024-01-14'],
                    ['id' => 8, 'title' => 'Documentation Update', 'description' => 'Update technical documentation and user guides', 'priority' => 'Low', 'assigned_to' => 'Chris Lee', 'project' => 'CRM System', 'due_date' => '2024-01-22', 'created_at' => '2024-01-21']
                ]
            ];
            
            return response()->json($tasks);
        }
        
        return Inertia::render('tasks/kanban');
    }
    
    public function store(Request $request)
    {
        if (!auth()->user()->can('create_tasks')) {
            abort(403, 'You do not have permission to create tasks.');
        }
        
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:To Do,In Progress,Review,Done',
            'priority' => 'required|in:High,Medium,Low',
            'assigned_to' => 'required|string|max:255',
            'project' => 'nullable|string|max:255',
            'due_date' => 'required|date',
            'estimated_hours' => 'nullable|numeric|min:0',
            'tags' => 'nullable|string',
        ]);
        
        // In a real app, you would save to database here
        // For now, just redirect back with success message
        
        return response()->json([
            'success' => true,
            'message' => 'Task created successfully.'
        ]);
    }
}