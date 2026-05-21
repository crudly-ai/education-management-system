<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\ClassModel;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'class_id',
        'status',

        'created_by',
    ];

    protected $casts = [
        'class_id' => 'integer',
        'status' => 'string',

    ];

    public function class(): BelongsTo
    {
        return $this->belongsTo(ClassModel::class);
    }


    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}