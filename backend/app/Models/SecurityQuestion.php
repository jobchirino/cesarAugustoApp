<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SecurityQuestion extends Model
{
    protected $fillable = [
        'user_id',
        'question',
        'answer',
    ];

    protected $hidden = [
        'answer',
    ];

    protected function casts(): array
    {
        return [
            'answer' => 'hashed',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
