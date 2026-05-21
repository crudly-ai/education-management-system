<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Yajra\DataTables\Facades\DataTables;

class RoleController extends Controller
{
    public function index(Request $request)
    {
        if (!auth()->user()->can('manage_all_role') && !auth()->user()->can('manage_own_role')) {
            abort(403, 'You do not have permission to manage roles.');
        }
        
        if (($request->wantsJson() || $request->ajax()) && !$request->header('X-Inertia')) {
            $roles = Role::with('permissions')->select('roles.*');
            
            // Apply ownership filter
            if (auth()->user()->can('manage_all_role')) {
                // User can see all roles
            } elseif (auth()->user()->can('manage_own_role')) {
                $roles->where('created_by', auth()->id());
            }
            
            // Apply permission filter
            if ($request->filled('permission_filter')) {
                $roles->whereHas('permissions', function($query) use ($request) {
                    $query->where('name', $request->permission_filter);
                });
            }
            
            // Apply date range filter
            if ($request->filled('date_from')) {
                $roles->whereDate('created_at', '>=', $request->date_from);
            }
            if ($request->filled('date_to')) {
                $roles->whereDate('created_at', '<=', $request->date_to);
            }
            
            return DataTables::of($roles)
                ->addColumn('permissions_count', function ($role) {
                    return $role->permissions->count();
                })
                ->addColumn('permissions_list', function ($role) {
                    return $role->permissions->pluck('name')->toArray();
                })
                ->addColumn('created_at_formatted', function ($role) {
                    return $role->created_at->format('Y-m-d H:i:s');
                })
                ->filterColumn('name', function($query, $keyword) {
                    $query->where('name', 'like', "%{$keyword}%");
                })
                ->make(true);
        }

        $permissions = Permission::all();
        $permissionOptions = $permissions->map(function($permission) {
            return [
                'value' => $permission->name,
                'label' => ucfirst(str_replace('_', ' ', $permission->name))
            ];
        });

        return Inertia::render('roles/index', [
            'permissions' => $permissions,
            'permissionOptions' => $permissionOptions,
        ]);
    }

    public function show(Role $role)
    {
        if (!auth()->user()->can('view_role')) {
            abort(403, 'You do not have permission to view this role.');
        }

        return response()->json($role->load('permissions'));
    }

    public function store(Request $request)
    {
        if (!auth()->user()->can('create_role')) {
            abort(403, 'You do not have permission to create roles.');
        }
        $request->validate([
            'name' => 'required|string|max:255|unique:roles',
            'permissions' => 'array',
        ]);

        $role = Role::create(['name' => $request->name, 'created_by' => auth()->id()]);

        if ($request->permissions) {
            $role->givePermissionTo($request->permissions);
        }

        return redirect()->back()->with('success', 'Role created successfully.');
    }





    public function update(Request $request, Role $role)
    {
        if (!auth()->user()->can('edit_role')) {
            abort(403, 'You do not have permission to edit roles.');
        }
        
        // Check ownership for manage_own permission
        if (!auth()->user()->can('manage_all_role') && 
            auth()->user()->can('manage_own_role') && 
            $role->created_by !== auth()->id()) {
            abort(403, 'You can only edit roles you created.');
        }
        $request->validate([
            'name' => 'required|string|max:255|unique:roles,name,' . $role->id,
            'permissions' => 'array',
        ]);

        $role->update(['name' => $request->name]);
        $role->syncPermissions($request->permissions ?? []);

        return redirect()->back()->with('success', 'Role updated successfully.');
    }

    public function destroy(Role $role)
    {
        if (!auth()->user()->can('delete_role')) {
            abort(403, 'You do not have permission to delete roles.');
        }
        
        // Check ownership for manage_own permission
        if (!auth()->user()->can('manage_all_role') && 
            auth()->user()->can('manage_own_role') && 
            $role->created_by !== auth()->id()) {
            abort(403, 'You can only delete roles you created.');
        }
        $role->delete();

        return redirect()->back()->with('success', 'Role deleted successfully.');
    }
}