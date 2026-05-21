<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\Subject;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Yajra\DataTables\Facades\DataTables;

class ExamController extends Controller
{
    public function index(Request $request)
    {
        if (!auth()->user()->can('view_exam')) {
            abort(403, 'You do not have permission to view exams.');
        }
        
        if (($request->wantsJson() || $request->ajax()) && !$request->header('X-Inertia')) {
            $exams = Exam::select('exams.*')->with(['subject']);
            
            // Apply ownership filter
            if (auth()->user()->can('manage_all_exam')) {
                // User can see all exams
            } elseif (auth()->user()->can('manage_own_exam')) {
                $exams->where('created_by', auth()->id());
            }
            
            // Apply subject_id filter
            if ($request->filled('subject_id_filter')) {
                $exams->where('subject_id', $request->subject_id_filter);
            }
            
            // Apply status filter
            if ($request->filled('status_filter')) {
                $exams->where('status', $request->status_filter);
            }
            
            // Apply date range filter
            if ($request->filled('date_from')) {
                $exams->whereDate('created_at', '>=', $request->date_from);
            }
            if ($request->filled('date_to')) {
                $exams->whereDate('created_at', '<=', $request->date_to);
            }

            
            return DataTables::of($exams)
                ->addColumn('created_at_formatted', function ($exam) {
                    return $exam->created_at->format('Y-m-d H:i:s');
                })
                ->addColumn('subject_name', function ($exam) {
                    return $exam->subject ? $exam->subject->name : null;
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



        return Inertia::render('exams/index', [
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

    public function show(Exam $exam)
    {
        if (!auth()->user()->can('view_exam')) {
            abort(403, 'You do not have permission to view this exam.');
        }

        $exam->load(['subject']);
        return response()->json($exam);
    }

    public function store(Request $request)
    {
        if (!auth()->user()->can('create_exam')) {
            abort(403, 'You do not have permission to create exams.');
        }
        
        $request->validate([
            'name' => 'required|string|max:255',
            'subject_id' => 'nullable|integer',
            'status' => 'required',

        ]);

        Exam::create(array_merge($request->all(), ['created_by' => auth()->id()]));

        return redirect()->back()->with('success', 'Exam created successfully.');
    }

    public function update(Request $request, Exam $exam)
    {
        if (!auth()->user()->can('edit_exam')) {
            abort(403, 'You do not have permission to edit exams.');
        }
        
        // Check ownership for manage_own permission
        if (!auth()->user()->can('manage_all_exam') && 
            auth()->user()->can('manage_own_exam') && 
            $exam->created_by !== auth()->id()) {
            abort(403, 'You can only edit exams you created.');
        }
        
        $request->validate([
            'name' => 'required|string|max:255',
            'subject_id' => 'nullable|integer',
            'status' => 'required',

        ]);

        $exam->update($request->all());

        return redirect()->back()->with('success', 'Exam updated successfully.');
    }

    public function destroy(Exam $exam)
    {
        if (!auth()->user()->can('delete_exam')) {
            abort(403, 'You do not have permission to delete exams.');
        }
        
        // Check ownership for manage_own permission
        if (!auth()->user()->can('manage_all_exam') && 
            auth()->user()->can('manage_own_exam') && 
            $exam->created_by !== auth()->id()) {
            abort(403, 'You can only delete exams you created.');
        }
        
        $exam->delete();

        return redirect()->back()->with('success', 'Exam deleted successfully.');
    }

}