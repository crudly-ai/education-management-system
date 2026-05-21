<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\Activitylog\Models\Activity;

class ActivityLogController extends Controller
{
    public function track(Request $request)
    {
        $request->validate([
            'action' => 'required|string',
            'page' => 'nullable|string',
            'details' => 'nullable|array'
        ]);

        if (!auth()->check()) {
            return response()->json(['success' => false], 401);
        }

        activity()
            ->causedBy(auth()->user())
            ->withProperties([
                'action' => $request->action,
                'page' => $request->page,
                'details' => $request->details,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent()
            ])
            ->log($request->action);

        return response()->json(['success' => true]);
    }

    public function getUserActivities($userId)
    {
        if (!auth()->user()->can('view_user')) {
            abort(403);
        }

        $activities = Activity::where('causer_id', $userId)
            ->where('causer_type', 'App\\Models\\User')
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return response()->json($activities);
    }
}
