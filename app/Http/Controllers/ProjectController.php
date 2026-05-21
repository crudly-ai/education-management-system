<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Yajra\DataTables\Facades\DataTables;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        if (!auth()->user()->can('manage_all_projects') && !auth()->user()->can('manage_own_projects')) {
            abort(403, 'You do not have permission to manage projects.');
        }

        if (($request->wantsJson() || $request->ajax()) && !$request->header('X-Inertia')) {
            // Create a query builder with static data
            $projects = DB::table(DB::raw('(SELECT
                1 as id, "E-commerce Platform" as name, "Complete online shopping platform with payment integration" as description, "Tech Solutions Ltd" as client, "active" as status, "high" as priority, "2024-01-15" as start_date, "2024-06-15" as end_date, 45000.00 as budget, 75 as progress, "John Smith" as project_manager, 5 as team_size, "Web Development" as category, "2024-01-15 10:30:00" as created_at
                UNION ALL SELECT 2, "Mobile Banking App", "Secure mobile banking application with biometric authentication", "Global Bank Corp", "active", "high", "2024-02-01", "2024-08-01", 85000.00, 45, "Sarah Johnson", 8, "Mobile Development", "2024-02-01 09:15:00"
                UNION ALL SELECT 3, "CRM System", "Customer relationship management system with analytics", "StartUp Co", "completed", "medium", "2023-10-01", "2024-01-31", 32000.00, 100, "Mike Davis", 4, "Web Development", "2023-10-01 14:20:00"
                UNION ALL SELECT 4, "Data Analytics Dashboard", "Real-time data visualization and reporting dashboard", "Digital Agency Inc", "on_hold", "low", "2024-03-01", "2024-07-01", 28000.00, 25, "Emily Wilson", 3, "Data Analytics", "2024-03-01 11:45:00"
                UNION ALL SELECT 5, "IoT Monitoring System", "Internet of Things device monitoring and control system", "Industrial Corp", "active", "medium", "2024-01-20", "2024-09-20", 65000.00, 60, "David Brown", 6, "IoT Development", "2024-01-20 16:10:00"
                UNION ALL SELECT 6, "Learning Management System", "Online education platform with video streaming and assessments", "Education Plus", "cancelled", "low", "2023-12-01", "2024-05-01", 38000.00, 15, "Lisa Anderson", 4, "Web Development", "2023-12-01 13:30:00"
            ) as projects'));

            return DataTables::of($projects)
                ->filterColumn('name', function($query, $keyword) {
                    $query->where('name', 'like', "%{$keyword}%");
                })
                ->filterColumn('client', function($query, $keyword) {
                    $query->where('client', 'like', "%{$keyword}%");
                })
                ->make(true);
        }

        return Inertia::render('projects/index');
    }

    public function show($id)
    {
        if (!auth()->user()->can('view_projects')) {
            abort(403, 'You do not have permission to view projects.');
        }

        // Static project data - find by ID
        $projects = [
            1 => [
                'id' => 1,
                'name' => 'E-commerce Platform',
                'description' => 'Complete online shopping platform with payment integration, featuring user authentication, product catalog, shopping cart, payment processing, order management, and admin dashboard.',
                'client' => 'Tech Solutions Ltd',
                'status' => 'active',
                'priority' => 'high',
                'start_date' => '2024-01-15',
                'end_date' => '2024-06-15',
                'budget' => 45000.00,
                'progress' => 75,
                'project_manager' => 'John Smith',
                'team_size' => 5,
                'category' => 'Web Development',
                'estimated_hours' => 800,
                'actual_hours' => 600,
                'team_members' => [
                    ['name' => 'John Smith', 'role' => 'Project Manager', 'email' => 'john@company.com'],
                    ['name' => 'Sarah Wilson', 'role' => 'Frontend Developer', 'email' => 'sarah@company.com'],
                    ['name' => 'Mike Johnson', 'role' => 'Backend Developer', 'email' => 'mike@company.com'],
                    ['name' => 'Lisa Chen', 'role' => 'UI/UX Designer', 'email' => 'lisa@company.com'],
                    ['name' => 'David Brown', 'role' => 'QA Engineer', 'email' => 'david@company.com']
                ],
                'files' => [
                    ['name' => 'Project Requirements.pdf', 'size' => '2.4 MB', 'type' => 'pdf', 'uploaded_by' => 'John Smith', 'uploaded_at' => '2024-01-16'],
                    ['name' => 'UI Mockups.fig', 'size' => '15.2 MB', 'type' => 'figma', 'uploaded_by' => 'Lisa Chen', 'uploaded_at' => '2024-01-20'],
                    ['name' => 'Database Schema.sql', 'size' => '156 KB', 'type' => 'sql', 'uploaded_by' => 'Mike Johnson', 'uploaded_at' => '2024-01-25'],
                    ['name' => 'Test Cases.xlsx', 'size' => '890 KB', 'type' => 'excel', 'uploaded_by' => 'David Brown', 'uploaded_at' => '2024-02-01']
                ],
                'created_at' => '2024-01-15 10:30:00'
            ],
            2 => [
                'id' => 2,
                'name' => 'Mobile Banking App',
                'description' => 'Secure mobile banking application with biometric authentication, account management, fund transfers, bill payments, and transaction history.',
                'client' => 'Global Bank Corp',
                'status' => 'active',
                'priority' => 'high',
                'start_date' => '2024-02-01',
                'end_date' => '2024-08-01',
                'budget' => 85000.00,
                'progress' => 45,
                'project_manager' => 'Sarah Johnson',
                'team_size' => 8,
                'category' => 'Mobile Development',
                'estimated_hours' => 1200,
                'actual_hours' => 540,
                'team_members' => [
                    ['name' => 'Sarah Johnson', 'role' => 'Project Manager', 'email' => 'sarah.j@company.com'],
                    ['name' => 'Alex Rodriguez', 'role' => 'iOS Developer', 'email' => 'alex@company.com'],
                    ['name' => 'Emma Davis', 'role' => 'Android Developer', 'email' => 'emma@company.com'],
                    ['name' => 'Tom Wilson', 'role' => 'Backend Developer', 'email' => 'tom@company.com'],
                    ['name' => 'Nina Patel', 'role' => 'UI/UX Designer', 'email' => 'nina@company.com'],
                    ['name' => 'Chris Lee', 'role' => 'QA Engineer', 'email' => 'chris@company.com'],
                    ['name' => 'Mark Taylor', 'role' => 'DevOps Engineer', 'email' => 'mark@company.com'],
                    ['name' => 'Amy Zhang', 'role' => 'Security Specialist', 'email' => 'amy@company.com']
                ],
                'files' => [
                    ['name' => 'App Wireframes.sketch', 'size' => '8.7 MB', 'type' => 'sketch', 'uploaded_by' => 'Nina Patel', 'uploaded_at' => '2024-02-05'],
                    ['name' => 'API Documentation.pdf', 'size' => '1.2 MB', 'type' => 'pdf', 'uploaded_by' => 'Tom Wilson', 'uploaded_at' => '2024-02-10'],
                    ['name' => 'Security Audit.docx', 'size' => '445 KB', 'type' => 'word', 'uploaded_by' => 'Amy Zhang', 'uploaded_at' => '2024-02-15']
                ],
                'created_at' => '2024-02-01 09:15:00'
            ],
            3 => [
                'id' => 3,
                'name' => 'CRM System',
                'description' => 'Customer relationship management system with analytics, lead tracking, sales pipeline, and reporting capabilities.',
                'client' => 'StartUp Co',
                'status' => 'completed',
                'priority' => 'medium',
                'start_date' => '2023-10-01',
                'end_date' => '2024-01-31',
                'budget' => 32000.00,
                'progress' => 100,
                'project_manager' => 'Mike Davis',
                'team_size' => 4,
                'category' => 'Web Development',
                'estimated_hours' => 600,
                'actual_hours' => 580,
                'team_members' => [
                    ['name' => 'Mike Davis', 'role' => 'Project Manager', 'email' => 'mike.d@company.com'],
                    ['name' => 'Jessica Brown', 'role' => 'Full Stack Developer', 'email' => 'jessica@company.com'],
                    ['name' => 'Ryan Miller', 'role' => 'Frontend Developer', 'email' => 'ryan@company.com'],
                    ['name' => 'Sophie Anderson', 'role' => 'Business Analyst', 'email' => 'sophie@company.com']
                ],
                'files' => [
                    ['name' => 'Business Requirements.pdf', 'size' => '3.1 MB', 'type' => 'pdf', 'uploaded_by' => 'Sophie Anderson', 'uploaded_at' => '2023-10-05'],
                    ['name' => 'System Architecture.png', 'size' => '2.8 MB', 'type' => 'image', 'uploaded_by' => 'Jessica Brown', 'uploaded_at' => '2023-10-12'],
                    ['name' => 'Final Report.docx', 'size' => '1.5 MB', 'type' => 'word', 'uploaded_by' => 'Mike Davis', 'uploaded_at' => '2024-01-30']
                ],
                'created_at' => '2023-10-01 14:20:00'
            ]
        ];

        $project = $projects[$id] ?? null;

        if (!$project) {
            abort(404, 'Project not found.');
        }

        return Inertia::render('projects/view', [
            'project' => $project
        ]);
    }

    public function store(Request $request)
    {
        if (!auth()->user()->can('create_projects')) {
            abort(403, 'You do not have permission to create projects.');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'client' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'budget' => 'required|numeric|min:0',
            'priority' => 'required|in:high,medium,low',
            'project_manager' => 'required|string|max:255',
            'status' => 'required|in:active,on_hold,completed,cancelled',
            'notes' => 'nullable|string',
        ]);

        // In a real app, you would save to database here
        // For now, just redirect back with success message

        return response()->json([
            'success' => true,
            'message' => 'Project created successfully.'
        ]);
    }
}
