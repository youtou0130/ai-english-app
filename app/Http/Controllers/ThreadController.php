<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use App\Http\Requests\StoreThreadRequest;
use App\Http\Requests\UpdateThreadRequest;
use App\Models\Thread;
use App\Models\Message;

class ThreadController extends Controller
{
    /**
     * トップ画面表示
     */
    public function index(): InertiaResponse
    {
        $threads = Thread::orderBy('updated_at', 'desc')->get();

        // メッセージが1件以上存在する日を学習日として取得（日付文字列 Y-m-d）
        $activityDates = Message::query()
            ->selectRaw('DATE(created_at) as activity_date')
            ->whereNotNull('created_at')
            ->distinct()
            ->pluck('activity_date')
            ->map(fn ($d) => $d instanceof \DateTimeInterface ? $d->format('Y-m-d') : (string) $d)
            ->values()
            ->all();

        return Inertia::render('Top', [
            'threads' => $threads,
            'activityDates' => $activityDates,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    // public function create()
    // {
    //     //
    // }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreThreadRequest $request)
    {
        // タイトルは現在日時で新しいThreadを1件登録
        $now = now();
        $thread = Thread::create([
            'title' => $now->format('Y-m-d H:i:s'),
        ]);

        // showアクションにリダイレクト
        return redirect()->route('threads.show', ['thread' => $thread->id]);

    }

    /**
     * 英会話「Show」ページ表示（/thread/show）
     */
    public function showPage(): InertiaResponse
    {
        $threads = Thread::orderBy('updated_at', 'desc')->get();

        return Inertia::render('Thread/Show', [
            'threads' => $threads,
        ]);
    }

    /**
     * 英会話画面表示（特定スレッド /thread/{id}）
     */
    public function show(Thread $thread): InertiaResponse
    {
        $threads = Thread::orderBy('updated_at', 'desc')->get();
        $messages = Message::where('thread_id', $thread->id)->orderBy('created_at', 'asc')->get();
        return Inertia::render('Thread/Show', [
            'threads' => $threads,  // スレッド一覧
            'activeThreadId' => $thread->id,  // アクティブスレッドID
            'messages' => $messages,  // メッセージ一覧
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Thread $thread)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateThreadRequest $request, Thread $thread)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Thread $thread)
    {
        $thread->delete();

        return redirect()->route('threads.index')
            ->with('success', 'Thread deleted successfully.');
    }
}
