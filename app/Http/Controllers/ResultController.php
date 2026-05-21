<?php

namespace App\Http\Controllers;

use App\Models\Result;
use App\Models\Student;
use App\Models\Exam;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Yajra\DataTables\Facades\DataTables;

class ResultController extends Controller
{
    public function index(Request $request)
    {
        if (!auth()->user()->can('view_result')) {
            abort(403, 'You do not have permission to view results.');
        }
        
        if (($request->wantsJson() || $request->ajax()) && !$request->header('X-Inertia')) {
            $results = Result::select('results.*')->with(['student', 'exam']);
            
            // Apply ownership filter
            if (auth()->user()->can('manage_all_result')) {
                // User can see all results
            } elseif (auth()->user()->can('manage_own_result')) {
                $results->where('created_by', auth()->id());
            }
            
            // Apply student_id filter
            if ($request->filled('student_id_filter')) {
                $results->where('student_id', $request->student_id_filter);
            }
            
            // Apply exam_id filter
            if ($request->filled('exam_id_filter')) {
                $results->where('exam_id', $request->exam_id_filter);
            }
            
            // Apply marks rating range filter
            if ($request->filled('marks_min')) {
                $results->where('marks', '>=', $request->marks_min);
            }
            if ($request->filled('marks_max')) {
                $results->where('marks', '<=', $request->marks_max);
            }
            
            // Apply status filter
            if ($request->filled('status_filter')) {
                $results->where('status', $request->status_filter);
            }
            
            // Apply date range filter
            if ($request->filled('date_from')) {
                $results->whereDate('created_at', '>=', $request->date_from);
            }
            if ($request->filled('date_to')) {
                $results->whereDate('created_at', '<=', $request->date_to);
            }

            
            return DataTables::of($results)
                ->addColumn('created_at_formatted', function ($result) {
                    return $result->created_at->format('Y-m-d H:i:s');
                })
                ->addColumn('student_name', function ($result) {
                    return $result->student ? $result->student->name : null;
                })
                ->addColumn('exam_name', function ($result) {
                    return $result->exam ? $result->exam->name : null;
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



        return Inertia::render('results/index', [
            'statusOptions' => $statusOptions,

            'students' => Student::all(),
            'exams' => Exam::all(),

            'currencySettings' => [
                'currency_symbol' => \App\Models\SystemSetting::get('currency_symbol', '$'),
                'currency_position' => \App\Models\SystemSetting::get('currency_position', 'before'),
                'decimal_separator' => \App\Models\SystemSetting::get('decimal_separator', '.'),
                'thousand_separator' => \App\Models\SystemSetting::get('thousand_separator', ','),
            ],
        ]);
    }

    public function show(Result $result)
    {
        if (!auth()->user()->can('view_result')) {
            abort(403, 'You do not have permission to view this result.');
        }

        $result->load(['student', 'exam']);
        return response()->json($result);
    }

    public function store(Request $request)
    {
        if (!auth()->user()->can('create_result')) {
            abort(403, 'You do not have permission to create results.');
        }
        
        $request->validate([
            'student_id' => 'nullable|integer',
            'exam_id' => 'nullable|integer',
            'marks' => 'required|min:0',
            'status' => 'required',

        ]);

        Result::create(array_merge($request->all(), ['created_by' => auth()->id()]));

        return redirect()->back()->with('success', 'Result created successfully.');
    }

    public function update(Request $request, Result $result)
    {
        if (!auth()->user()->can('edit_result')) {
            abort(403, 'You do not have permission to edit results.');
        }
        
        // Check ownership for manage_own permission
        if (!auth()->user()->can('manage_all_result') && 
            auth()->user()->can('manage_own_result') && 
            $result->created_by !== auth()->id()) {
            abort(403, 'You can only edit results you created.');
        }
        
        $request->validate([
            'student_id' => 'nullable|integer',
            'exam_id' => 'nullable|integer',
            'marks' => 'required|min:0',
            'status' => 'required',

        ]);

        $result->update($request->all());

        return redirect()->back()->with('success', 'Result updated successfully.');
    }

    public function destroy(Result $result)
    {
        if (!auth()->user()->can('delete_result')) {
            abort(403, 'You do not have permission to delete results.');
        }
        
        // Check ownership for manage_own permission
        if (!auth()->user()->can('manage_all_result') && 
            auth()->user()->can('manage_own_result') && 
            $result->created_by !== auth()->id()) {
            abort(403, 'You can only delete results you created.');
        }
        
        $result->delete();

        return redirect()->back()->with('success', 'Result deleted successfully.');
    }

}