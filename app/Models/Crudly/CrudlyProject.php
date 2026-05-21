<?php

namespace App\Models\Crudly;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class CrudlyProject extends Model
{
    protected $table = 'crudly_projects';
    
    protected $fillable = [
        'user_id', 'name', 'slug', 'description', 
        'icon', 'project_data', 'is_public'
    ];
    
    protected $casts = [
        'project_data' => 'array',
        'is_public' => 'boolean'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($project) {
            if (empty($project->slug)) {
                $project->slug = static::generateUniqueSlug($project->name);
            }
        });
        
        static::updating(function ($project) {
            if ($project->isDirty('name')) {
                $project->slug = static::generateUniqueSlug($project->name);
            }
        });
    }

    public static function generateUniqueSlug($name)
    {
        $slug = Str::slug($name);
        $originalSlug = $slug;
        $counter = 1;

        while (static::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }
}