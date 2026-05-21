<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\ClassModel;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Yajra\DataTables\Facades\DataTables;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        if (!auth()->user()->can('view_student')) {
            abort(403, 'You do not have permission to view students.');
        }
        
        if (($request->wantsJson() || $request->ajax()) && !$request->header('X-Inertia')) {
            $students = Student::select('students.*')->with(['class']);
            
            // Apply ownership filter
            if (auth()->user()->can('manage_all_student')) {
                // User can see all students
            } elseif (auth()->user()->can('manage_own_student')) {
                $students->where('created_by', auth()->id());
            }
            
            // Apply class_id filter
            if ($request->filled('class_id_filter')) {
                $students->where('class_id', $request->class_id_filter);
            }
            
            // Apply status filter
            if ($request->filled('status_filter')) {
                $students->where('status', $request->status_filter);
            }
            
            // Apply date range filter
            if ($request->filled('date_from')) {
                $students->whereDate('created_at', '>=', $request->date_from);
            }
            if ($request->filled('date_to')) {
                $students->whereDate('created_at', '<=', $request->date_to);
            }

            
            return DataTables::of($students)
                ->addColumn('created_at_formatted', function ($student) {
                    return $student->created_at->format('Y-m-d H:i:s');
                })
                ->addColumn('class_name', function ($student) {
                    return $student->class ? $student->class->name : null;
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



        return Inertia::render('students/index', [
            'statusOptions' => $statusOptions,

            'classes' => ClassModel::all(),

            'currencySettings' => [
                'currency_symbol' => \App\Models\SystemSetting::get('currency_symbol', '$'),
                'currency_position' => \App\Models\SystemSetting::get('currency_position', 'before'),
                'decimal_separator' => \App\Models\SystemSetting::get('decimal_separator', '.'),
                'thousand_separator' => \App\Models\SystemSetting::get('thousand_separator', ','),
            ],
        ]);
    }

    public function show(Student $student)
    {
        if (!auth()->user()->can('view_student')) {
            abort(403, 'You do not have permission to view this student.');
        }

        $student->load(['class']);
        return response()->json($student);
    }

    public function store(Request $request)
    {
        if (!auth()->user()->can('create_student')) {
            abort(403, 'You do not have permission to create students.');
        }
        
        $request->validate([
            'name' => 'required|string|max:255',
            'class_id' => 'nullable|integer',
            'status' => 'required',

        ]);

        Student::create(array_merge($request->all(), ['created_by' => auth()->id()]));

        return redirect()->back()->with('success', 'Student created successfully.');
    }

    public function update(Request $request, Student $student)
    {
        if (!auth()->user()->can('edit_student')) {
            abort(403, 'You do not have permission to edit students.');
        }
        
        // Check ownership for manage_own permission
        if (!auth()->user()->can('manage_all_student') && 
            auth()->user()->can('manage_own_student') && 
            $student->created_by !== auth()->id()) {
            abort(403, 'You can only edit students you created.');
        }
        
        $request->validate([
            'name' => 'required|string|max:255',
            'class_id' => 'nullable|integer',
            'status' => 'required',

        ]);

        $student->update($request->all());

        return redirect()->back()->with('success', 'Student updated successfully.');
    }

    public function destroy(Student $student)
    {
        if (!auth()->user()->can('delete_student')) {
            abort(403, 'You do not have permission to delete students.');
        }
        
        // Check ownership for manage_own permission
        if (!auth()->user()->can('manage_all_student') && 
            auth()->user()->can('manage_own_student') && 
            $student->created_by !== auth()->id()) {
            abort(403, 'You can only delete students you created.');
        }
        
        $student->delete();

        return redirect()->back()->with('success', 'Student deleted successfully.');
    }

}