<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Fee extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'amount',
        'status',

        'created_by',
    ];

    protected $casts = [
        'student_id' => 'integer',
        'amount' => 'decimal:2',
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