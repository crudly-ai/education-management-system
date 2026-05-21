<?php

namespace App\Http\Controllers;

use App\Models\Fee;
use App\Models\Student;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Yajra\DataTables\Facades\DataTables;

class FeeController extends Controller
{
    public function index(Request $request)
    {
        if (!auth()->user()->can('view_fee')) {
            abort(403, 'You do not have permission to view fees.');
        }
        
        if (($request->wantsJson() || $request->ajax()) && !$request->header('X-Inertia')) {
            $fees = Fee::select('fees.*')->with(['student']);
            
            // Apply ownership filter
            if (auth()->user()->can('manage_all_fee')) {
                // User can see all fees
            } elseif (auth()->user()->can('manage_own_fee')) {
                $fees->where('created_by', auth()->id());
            }
            
            // Apply student_id filter
            if ($request->filled('student_id_filter')) {
                $fees->where('student_id', $request->student_id_filter);
            }
            
            // Apply amount currency range filter
            if ($request->filled('amount_min')) {
                $fees->where('amount', '>=', $request->amount_min);
            }
            if ($request->filled('amount_max')) {
                $fees->where('amount', '<=', $request->amount_max);
            }
            
            // Apply status filter
            if ($request->filled('status_filter')) {
                $fees->where('status', $request->status_filter);
            }
            
            // Apply date range filter
            if ($request->filled('date_from')) {
                $fees->whereDate('created_at', '>=', $request->date_from);
            }
            if ($request->filled('date_to')) {
                $fees->whereDate('created_at', '<=', $request->date_to);
            }

            
            return DataTables::of($fees)
                ->addColumn('created_at_formatted', function ($fee) {
                    return $fee->created_at->format('Y-m-d H:i:s');
                })
                ->addColumn('student_name', function ($fee) {
                    return $fee->student ? $fee->student->name : null;
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



        return Inertia::render('fees/index', [
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

    public function show(Fee $fee)
    {
        if (!auth()->user()->can('view_fee')) {
            abort(403, 'You do not have permission to view this fee.');
        }

        $fee->load(['student']);
        return response()->json($fee);
    }

    public function store(Request $request)
    {
        if (!auth()->user()->can('create_fee')) {
            abort(403, 'You do not have permission to create fees.');
        }
        
        $request->validate([
            'student_id' => 'nullable|integer',
            'amount' => 'required|numeric|min:0',
            'status' => 'required',

        ]);

        Fee::create(array_merge($request->all(), ['created_by' => auth()->id()]));

        return redirect()->back()->with('success', 'Fee created successfully.');
    }

    public function update(Request $request, Fee $fee)
    {
        if (!auth()->user()->can('edit_fee')) {
            abort(403, 'You do not have permission to edit fees.');
        }
        
        // Check ownership for manage_own permission
        if (!auth()->user()->can('manage_all_fee') && 
            auth()->user()->can('manage_own_fee') && 
            $fee->created_by !== auth()->id()) {
            abort(403, 'You can only edit fees you created.');
        }
        
        $request->validate([
            'student_id' => 'nullable|integer',
            'amount' => 'required|numeric|min:0',
            'status' => 'required',

        ]);

        $fee->update($request->all());

        return redirect()->back()->with('success', 'Fee updated successfully.');
    }

    public function destroy(Fee $fee)
    {
        if (!auth()->user()->can('delete_fee')) {
            abort(403, 'You do not have permission to delete fees.');
        }
        
        // Check ownership for manage_own permission
        if (!auth()->user()->can('manage_all_fee') && 
            auth()->user()->can('manage_own_fee') && 
            $fee->created_by !== auth()->id()) {
            abort(403, 'You can only delete fees you created.');
        }
        
        $fee->delete();

        return redirect()->back()->with('success', 'Fee deleted successfully.');
    }

}