<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectChatMessage extends Model
{
    protected $fillable = [
        'project_slug',
        'role',
        'content'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}