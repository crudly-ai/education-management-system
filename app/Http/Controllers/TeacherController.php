<?php

namespace App\Http\Controllers;

use App\Models\Teacher;
use App\Models\Subject;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Yajra\DataTables\Facades\DataTables;

class TeacherController extends Controller
{
    public function index(Request $request)
    {
        if (!auth()->user()->can('view_teacher')) {
            abort(403, 'You do not have permission to view teachers.');
        }
        
        if (($request->wantsJson() || $request->ajax()) && !$request->header('X-Inertia')) {
            $teachers = Teacher::select('teachers.*')->with(['subject']);
            
            // Apply ownership filter
            if (auth()->user()->can('manage_all_teacher')) {
                // User can see all teachers
            } elseif (auth()->user()->can('manage_own_teacher')) {
                $teachers->where('created_by', auth()->id());
            }
            
            // Apply subject_id filter
            if ($request->filled('subject_id_filter')) {
                $teachers->where('subject_id', $request->subject_id_filter);
            }
            
            // Apply status filter
            if ($request->filled('status_filter')) {
                $teachers->where('status', $request->status_filter);
            }
            
            // Apply date range filter
            if ($request->filled('date_from')) {
                $teachers->whereDate('created_at', '>=', $request->date_from);
            }
            if ($request->filled('date_to')) {
                $teachers->whereDate('created_at', '<=', $request->date_to);
            }

            
            return DataTables::of($teachers)
                ->addColumn('created_at_formatted', function ($teacher) {
                    return $teacher->created_at->format('Y-m-d H:i:s');
                })
                ->addColumn('subject_name', function ($teacher) {
                    return $teacher->subject ? $teacher->subject->name : null;
                })

                ->filterColumn('status', function($query, $keyword) {
                    $query->where('status', 'like', "%{$keyword}%");
                })

                ->escapeColumns([])
                ->make(true);
        }

        $statusOptions = [
            ['value' => 'active', 'label' => 'Active'],
            ['value' => 'inactive', 'label' => 'Inactive'],
        ];



        return Inertia::render('teachers/index', [
            'statusOptions' => $statusOptions,

            'subjects' => Subject::all(),

            'currencySettings' => [
                'currency_symbol' => \App\Models\SystemSetting::get('currency_symbol', '$'),
                'currency_position' => \App\Models\SystemSetting::get('currency_position', 'before'),
                'decimal_separator' => \App\Models\SystemSetting::get('decimal_separator', '.'),
                'thousand_separator' => \App\Models\SystemSetting::get('thousand_separator', ','),
            ],
        ]);
    }

    public function show(Teacher $teacher)
    {
        if (!auth()->user()->can('view_teacher')) {
            abort(403, 'You do not have permission to view this teacher.');
        }

        $teacher->load(['subject']);
        return response()->json($teacher);
    }

    public function store(Request $request)
    {
        if (!auth()->user()->can('create_teacher')) {
            abort(403, 'You do not have permission to create teachers.');
        }
        
        $request->validate([
            'name' => 'required|string|max:255',
            'subject_id' => 'nullable|integer',
            'status' => 'required',

        ]);

        Teacher::create(array_merge($request->all(), ['created_by' => auth()->id()]));

        return redirect()->back()->with('success', 'Teacher created successfully.');
    }

    public function update(Request $request, Teacher $teacher)
    {
        if (!auth()->user()->can('edit_teacher')) {
            abort(403, 'You do not have permission to edit teachers.');
        }
        
        // Check ownership for manage_own permission
        if (!auth()->user()->can('manage_all_teacher') && 
            auth()->user()->can('manage_own_teacher') && 
            $teacher->created_by !== auth()->id()) {
            abort(403, 'You can only edit teachers you created.');
        }
        
        $request->validate([
            'name' => 'required|string|max:255',
            'subject_id' => 'nullable|integer',
            'status' => 'required',

        ]);

        $teacher->update($request->all());

        return redirect()->back()->with('success', 'Teacher updated successfully.');
    }

    public function destroy(Teacher $teacher)
    {
        if (!auth()->user()->can('delete_teacher')) {
            abort(403, 'You do not have permission to delete teachers.');
        }
        
        // Check ownership for manage_own permission
        if (!auth()->user()->can('manage_all_teacher') && 
            auth()->user()->can('manage_own_teacher') && 
            $teacher->created_by !== auth()->id()) {
            abort(403, 'You can only delete teachers you created.');
        }
        
        $teacher->delete();

        return redirect()->back()->with('success', 'Teacher deleted successfully.');
    }

}