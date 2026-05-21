<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Exam extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'subject_id',
        'status',

        'created_by',
    ];

    protected $casts = [
        'subject_id' => 'integer',
        'status' => 'string',

    ];

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }


    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}