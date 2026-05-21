<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Student;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Yajra\DataTables\Facades\DataTables;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        if (!auth()->user()->can('view_attendance')) {
            abort(403, 'You do not have permission to view attendances.');
        }
        
        if (($request->wantsJson() || $request->ajax()) && !$request->header('X-Inertia')) {
            $attendances = Attendance::select('attendances.*')->with(['student']);
            
            // Apply ownership filter
            if (auth()->user()->can('manage_all_attendance')) {
                // User can see all attendances
            } elseif (auth()->user()->can('manage_own_attendance')) {
                $attendances->where('created_by', auth()->id());
            }
            
            // Apply date date range filter
            if ($request->filled('date_from')) {
                $attendances->whereDate('date', '>=', $request->date_from);
            }
            if ($request->filled('date_to')) {
                $attendances->whereDate('date', '<=', $request->date_to);
            }
            
            // Apply student_id filter
            if ($request->filled('student_id_filter')) {
                $attendances->where('student_id', $request->student_id_filter);
            }
            
            // Apply status filter
            if ($request->filled('status_filter')) {
                $attendances->where('status', $request->status_filter);
            }
            
            // Apply date range filter
            if ($request->filled('date_from')) {
                $attendances->whereDate('created_at', '>=', $request->date_from);
            }
            if ($request->filled('date_to')) {
                $attendances->whereDate('created_at', '<=', $request->date_to);
            }

            
            return DataTables::of($attendances)
                ->addColumn('created_at_formatted', function ($attendance) {
                    return $attendance->created_at->format('Y-m-d H:i:s');
                })
                ->addColumn('student_name', function ($attendance) {
                    return $attendance->student ? $attendance->student->name : null;
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



        return Inertia::render('attendances/index', [
            'statusOptions' => $statusOptions,

            'students' => Student::all(),

            'currencySettings' => [
                'currency_symbol' => \App\Models\SystemSetting::get('currency_symbol', '$'),
                'currency_position' => \App\Models\SystemSetting::get('currency_position', 'before'),
                'decimal_separator' => \App\Models\SystemSetting::get('decimal_separator', '.'),
                'thousand_separator' => \App\Models\SystemSetting::get('thousand_separator', ','),
            ],
        ]);
    }

    public function show(Attendance $attendance)
    {
        if (!auth()->user()->can('view_attendance')) {
            abort(403, 'You do not have permission to view this attendance.');
        }

        $attendance->load(['student']);
        return response()->json($attendance);
    }

    public function store(Request $request)
    {
        if (!auth()->user()->can('create_attendance')) {
            abort(403, 'You do not have permission to create attendances.');
        }
        
        $request->validate([
            'date' => 'nullable|date',
            'student_id' => 'nullable|integer',
            'status' => 'required',

        ]);

        Attendance::create(array_merge($request->all(), ['created_by' => auth()->id()]));

        return redirect()->back()->with('success', 'Attendance created successfully.');
    }

    public function update(Request $request, Attendance $attendance)
    {
        if (!auth()->user()->can('edit_attendance')) {
            abort(403, 'You do not have permission to edit attendances.');
        }
        
        // Check ownership for manage_own permission
        if (!auth()->user()->can('manage_all_attendance') && 
            auth()->user()->can('manage_own_attendance') && 
            $attendance->created_by !== auth()->id()) {
            abort(403, 'You can only edit attendances you created.');
        }
        
        $request->validate([
            'date' => 'nullable|date',
            'student_id' => 'nullable|integer',
            'status' => 'required',

        ]);

        $attendance->update($request->all());

        return redirect()->back()->with('success', 'Attendance updated successfully.');
    }

    public function destroy(Attendance $attendance)
    {
        if (!auth()->user()->can('delete_attendance')) {
            abort(403, 'You do not have permission to delete attendances.');
        }
        
        // Check ownership for manage_own permission
        if (!auth()->user()->can('manage_all_attendance') && 
            auth()->user()->can('manage_own_attendance') && 
            $attendance->created_by !== auth()->id()) {
            abort(403, 'You can only delete attendances you created.');
        }
        
        $attendance->delete();

        return redirect()->back()->with('success', 'Attendance deleted successfully.');
    }

}