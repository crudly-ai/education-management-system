<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Media extends Model
{
    use HasFactory;

    protected $table = 'media_library';

    protected $fillable = [
        'name',
        'file_name',
        'mime_type',
        'size',
        'disk',
        'path',
        'folder_id',
        'created_by',
    ];

    protected $casts = [
        'size' => 'integer',
        'created_by' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function folder()
    {
        return $this->belongsTo(MediaFolder::class, 'folder_id');
    }

    public function getUrlAttribute()
    {
        if (!$this->path) {
            return null;
        }
        
        return \Storage::url($this->path);
    }
}