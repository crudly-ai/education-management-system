<?php

namespace App\Http\Controllers;

use App\Models\Subject;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Yajra\DataTables\Facades\DataTables;

class SubjectController extends Controller
{
    public function index(Request $request)
    {
        if (!auth()->user()->can('view_subject')) {
            abort(403, 'You do not have permission to view subjects.');
        }
        
        if (($request->wantsJson() || $request->ajax()) && !$request->header('X-Inertia')) {
            $subjects = Subject::select('subjects.*');
            
            // Apply ownership filter
            if (auth()->user()->can('manage_all_subject')) {
                // User can see all subjects
            } elseif (auth()->user()->can('manage_own_subject')) {
                $subjects->where('created_by', auth()->id());
            }
            
            // Apply status filter
            if ($request->filled('status_filter')) {
                $subjects->where('status', $request->status_filter);
            }
            
            // Apply date range filter
            if ($request->filled('date_from')) {
                $subjects->whereDate('created_at', '>=', $request->date_from);
            }
            if ($request->filled('date_to')) {
                $subjects->whereDate('created_at', '<=', $request->date_to);
            }

            
            return DataTables::of($subjects)
                ->addColumn('created_at_formatted', function ($subject) {
                    return $subject->created_at->format('Y-m-d H:i:s');
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



        return Inertia::render('subjects/index', [
            'statusOptions' => $statusOptions,


            'currencySettings' => [
                'currency_symbol' => \App\Models\SystemSetting::get('currency_symbol', '$'),
                'currency_position' => \App\Models\SystemSetting::get('currency_position', 'before'),
                'decimal_separator' => \App\Models\SystemSetting::get('decimal_separator', '.'),
                'thousand_separator' => \App\Models\SystemSetting::get('thousand_separator', ','),
            ],
        ]);
    }

    public function show(Subject $subject)
    {
        if (!auth()->user()->can('view_subject')) {
            abort(403, 'You do not have permission to view this subject.');
        }

        $subject->load([]);
        return response()->json($subject);
    }

    public function store(Request $request)
    {
        if (!auth()->user()->can('create_subject')) {
            abort(403, 'You do not have permission to create subjects.');
        }
        
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required',

        ]);

        Subject::create(array_merge($request->all(), ['created_by' => auth()->id()]));

        return redirect()->back()->with('success', 'Subject created successfully.');
    }

    public function update(Request $request, Subject $subject)
    {
        if (!auth()->user()->can('edit_subject')) {
            abort(403, 'You do not have permission to edit subjects.');
        }
        
        // Check ownership for manage_own permission
        if (!auth()->user()->can('manage_all_subject') && 
            auth()->user()->can('manage_own_subject') && 
            $subject->created_by !== auth()->id()) {
            abort(403, 'You can only edit subjects you created.');
        }
        
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required',

        ]);

        $subject->update($request->all());

        return redirect()->back()->with('success', 'Subject updated successfully.');
    }

    public function destroy(Subject $subject)
    {
        if (!auth()->user()->can('delete_subject')) {
            abort(403, 'You do not have permission to delete subjects.');
        }
        
        // Check ownership for manage_own permission
        if (!auth()->user()->can('manage_all_subject') && 
            auth()->user()->can('manage_own_subject') && 
            $subject->created_by !== auth()->id()) {
            abort(403, 'You can only delete subjects you created.');
        }
        
        $subject->delete();

        return redirect()->back()->with('success', 'Subject deleted successfully.');
    }

}