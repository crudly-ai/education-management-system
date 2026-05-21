<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MediaFolder extends Model
{
    protected $fillable = [
        'name',
        'parent_id',
        'created_by',
    ];

    protected $casts = [
        'created_by' => 'integer',
        'parent_id' => 'integer',
    ];

    public function media(): HasMany
    {
        return $this->hasMany(Media::class, 'folder_id');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(MediaFolder::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(MediaFolder::class, 'parent_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
