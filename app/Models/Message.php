<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Message extends Model
{
    use HasFactory;
    /** 送信者: ユーザー */
    public const SENDER_USER = 1;

    /** 送信者: AI */
    public const SENDER_AI = 2;

    protected $fillable = [
        'thread_id',
        'message_en',
        'message_ja',
        'sender',
        'audio_file_path',
    ];

    protected function casts(): array
    {
        return [
            'sender' => 'integer',
        ];
    }

    /**
     * このメッセージが属するスレッド（多対1）
     */
    public function thread(): BelongsTo
    {
        return $this->belongsTo(Thread::class);
    }
}
