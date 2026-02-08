<?php

use App\Models\Message;
use App\Models\Thread;
use Illuminate\Database\Eloquent\Relations\HasMany;

describe('Thread モデル', function () {
    it('fillable プロパティに "title" が含まれている', function () {
        $thread = new Thread;

        expect($thread->getFillable())->toContain('title');
    });

    it('タイトルを指定して Thread を作成できる', function () {
        $thread = Thread::factory()->create(['title' => '2026-01-01 12:00:00']);

        expect($thread->title)->toBe('2026-01-01 12:00:00');
        expect($thread->id)->not->toBeNull();
    });

    it('作成した Thread の title を取得できる', function () {
        $thread = Thread::factory()->create(['title' => 'Test Title']);

        expect($thread->title)->toBe('Test Title');
    });

    it('messages() は HasMany のインスタンスを返す', function () {
        $thread = new Thread;

        expect($thread->messages())->toBeInstanceOf(HasMany::class);
    });

    it('messages() で紐づくメッセージを取得できる', function () {
        $thread = Thread::factory()->create();
        Message::factory()->count(2)->create(['thread_id' => $thread->id]);

        $thread->refresh();

        expect($thread->messages)->toHaveCount(2);
    });

    it('メッセージが0件のスレッドでも messages で空のコレクションが返る', function () {
        $thread = Thread::factory()->create();

        expect($thread->messages)->toHaveCount(0);
    });
});
