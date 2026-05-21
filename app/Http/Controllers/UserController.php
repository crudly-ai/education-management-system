<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Yajra\DataTables\Facades\DataTables;

class UserController extends Controller
{
    public function index(Request $request)
    {
        if (!auth()->user()->can('manage_all_user') && !auth()->user()->can('manage_own_user')) {
            abort(403, 'You do not have permission to manage users.');
        }

        if (($request->wantsJson() || $request->ajax()) && !$request->header('X-Inertia')) {
            $users = User::with(['roles'])->select('users.*');

            // Apply ownership filter
            if (auth()->user()->can('manage_all_user')) {
                // User can see all users
            } elseif (auth()->user()->can('manage_own_user')) {
                $users->where('created_by', auth()->id());
            }

            // Apply role filter
            if ($request->filled('role_filter')) {
                $users->whereHas('roles', function($query) use ($request) {
                    $query->where('name', $request->role_filter);
                });
            }

            // Apply date range filter
            if ($request->filled('date_from')) {
                $users->whereDate('created_at', '>=', $request->date_from);
            }
            if ($request->filled('date_to')) {
                $users->whereDate('created_at', '<=', $request->date_to);
            }

            return DataTables::of($users)
                ->addColumn('roles_count', function ($user) {
                    return $user->roles->count();
                })
                ->addColumn('roles_list', function ($user) {
                    return $user->roles->pluck('name')->toArray();
                })
                ->addColumn('avatar', function ($user) {
                    return $user->avatar;
                })
                ->addColumn('email_verified', function ($user) {
                    return $user->email_verified_at ? true : false;
                })
                ->addColumn('email_verified_at_formatted', function ($user) {
                    return $user->email_verified_at ? $user->email_verified_at->format('Y-m-d H:i:s') : null;
                })
                ->addColumn('created_at_formatted', function ($user) {
                    return $user->created_at->format('Y-m-d H:i:s');
                })
                ->addColumn('avatar', function ($user) {
                    return $user->avatar;
                })
                ->filterColumn('name', function($query, $keyword) {
                    $query->where('name', 'like', "%{$keyword}%");
                })
                ->filterColumn('email', function($query, $keyword) {
                    $query->where('email', 'like', "%{$keyword}%");
                })
                ->make(true);
        }

        $roles = Role::all();
        $roleOptions = $roles->map(function($role) {
            return [
                'value' => $role->name,
                'label' => ucfirst(str_replace('_', ' ', $role->name))
            ];
        });

        return Inertia::render('users/index', [
            'roles' => $roles,
            'roleOptions' => $roleOptions,
        ]);
    }

    public function show(User $user)
    {
        if (!auth()->user()->can('view_user')) {
            abort(403, 'You do not have permission to view this user.');
        }

        $user->load(['roles']);
        return response()->json($user);
    }

    public function store(Request $request)
    {
        if (!auth()->user()->can('create_user')) {
            abort(403, 'You do not have permission to create users.');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'roles' => 'array',
            'avatar' => 'nullable|string',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'avatar' => $request->avatar,
            'created_by' => auth()->id(),
        ]);

        if ($request->roles) {
            $user->assignRole($request->roles);
        }

        return redirect()->back()->with('success', 'User created successfully.');
    }

    public function update(Request $request, User $user)
    {
        if (!auth()->user()->can('edit_user')) {
            abort(403, 'You do not have permission to edit users.');
        }

        // Check ownership for manage_own permission
        if (!auth()->user()->can('manage_all_user') &&
            auth()->user()->can('manage_own_user') &&
            $user->created_by !== auth()->id()) {
            abort(403, 'You can only edit users you created.');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8',
            'roles' => 'array',
            'avatar' => 'nullable|string',
        ]);

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'avatar' => $request->avatar,
        ]);

        if ($request->password) {
            $user->update(['password' => Hash::make($request->password)]);
        }

        $user->syncRoles($request->roles ?? []);

        return redirect()->back()->with('success', 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        if (!auth()->user()->can('delete_user')) {
            abort(403, 'You do not have permission to delete users.');
        }

        // Check ownership for manage_own permission
        if (!auth()->user()->can('manage_all_user') &&
            auth()->user()->can('manage_own_user') &&
            $user->created_by !== auth()->id()) {
            abort(403, 'You can only delete users you created.');
        }

        $user->delete();

        return redirect()->back()->with('success', 'User deleted successfully.');
    }

    public function activityLog(User $user)
    {
        if (!auth()->user()->can('view_user')) {
            abort(403, 'You do not have permission to view user activities.');
        }

        return Inertia::render('users/activity-log', [
            'user' => $user,
        ]);
    }
}