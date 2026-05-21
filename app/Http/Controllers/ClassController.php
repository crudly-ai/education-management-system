<?php

namespace App\Http\Controllers;

use App\Models\ClassModel;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Yajra\DataTables\Facades\DataTables;

class ClassController extends Controller
{
    public function index(Request $request)
    {
        if (!auth()->user()->can('view_class')) {
            abort(403, 'You do not have permission to view classes.');
        }
        
        if (($request->wantsJson() || $request->ajax()) && !$request->header('X-Inertia')) {
            $classes = ClassModel::select('classes.*');
            
            // Apply ownership filter
            if (auth()->user()->can('manage_all_class')) {
                // User can see all classes
            } elseif (auth()->user()->can('manage_own_class')) {
                $classes->where('created_by', auth()->id());
            }
            
            // Apply status filter
            if ($request->filled('status_filter')) {
                $classes->where('status', $request->status_filter);
            }
            
            // Apply date range filter
            if ($request->filled('date_from')) {
                $classes->whereDate('created_at', '>=', $request->date_from);
            }
            if ($request->filled('date_to')) {
                $classes->whereDate('created_at', '<=', $request->date_to);
            }

            
            return DataTables::of($classes)
                ->addColumn('created_at_formatted', function ($class) {
                    return $class->created_at->format('Y-m-d H:i:s');
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



        return Inertia::render('classes/index', [
            'statusOptions' => $statusOptions,


            'currencySettings' => [
                'currency_symbol' => \App\Models\SystemSetting::get('currency_symbol', '$'),
                'currency_position' => \App\Models\SystemSetting::get('currency_position', 'before'),
                'decimal_separator' => \App\Models\SystemSetting::get('decimal_separator', '.'),
                'thousand_separator' => \App\Models\SystemSetting::get('thousand_separator', ','),
            ],
        ]);
    }

    public function show(ClassModel $class)
    {
        if (!auth()->user()->can('view_class')) {
            abort(403, 'You do not have permission to view this class.');
        }

        $class->load([]);
        return response()->json($class);
    }

    public function store(Request $request)
    {
        if (!auth()->user()->can('create_class')) {
            abort(403, 'You do not have permission to create classes.');
        }
        
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required',

        ]);

        ClassModel::create(array_merge($request->all(), ['created_by' => auth()->id()]));

        return redirect()->back()->with('success', 'Class created successfully.');
    }

    public function update(Request $request, ClassModel $class)
    {
        if (!auth()->user()->can('edit_class')) {
            abort(403, 'You do not have permission to edit classes.');
        }
        
        // Check ownership for manage_own permission
        if (!auth()->user()->can('manage_all_class') && 
            auth()->user()->can('manage_own_class') && 
            $class->created_by !== auth()->id()) {
            abort(403, 'You can only edit classes you created.');
        }
        
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required',

        ]);

        $class->update($request->all());

        return redirect()->back()->with('success', 'Class updated successfully.');
    }

    public function destroy(ClassModel $class)
    {
        if (!auth()->user()->can('delete_class')) {
            abort(403, 'You do not have permission to delete classes.');
        }
        
        // Check ownership for manage_own permission
        if (!auth()->user()->can('manage_all_class') && 
            auth()->user()->can('manage_own_class') && 
            $class->created_by !== auth()->id()) {
            abort(403, 'You can only delete classes you created.');
        }
        
        $class->delete();

        return redirect()->back()->with('success', 'Class deleted successfully.');
    }

}