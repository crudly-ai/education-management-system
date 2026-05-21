<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'date',
        'student_id',
        'status',

        'created_by',
    ];

    protected $casts = [
        'date' => 'date',
        'student_id' => 'integer',
        'status' => 'string',

    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }


    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}