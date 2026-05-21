<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Class extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'status',

        'created_by',
    ];

    protected $casts = [
        'status' => 'string',

    ];


    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}