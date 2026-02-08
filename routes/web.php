<?php

//use App\Http\Controllers\ProfileController;
//use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ThreadController;
use App\Http\Requests\MessageController;
//use Inertia\Inertia;

// トップ: 認証済みなら /top、未認証なら /login へ
Route::get('/', function () {
    return Auth::check()
        ? redirect()->route('top')
        : redirect()->route('login');
})->name('home');

// Route::get('/dashboard', function () {
//     return Inertia::render('Dashboard');
// })->middleware(['auth', 'verified'])->name('dashboard');

// Route::middleware('auth')->group(function () {
//     Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
//     Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
//     Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
// });

require __DIR__.'/auth.php';
Route::middleware('auth')->group(function () {
    //トップ画面表示
    Route::get('/top', [\App\Http\Controllers\ThreadController::class, 'index'])->name('top');
    Route::get('/thread/show', [\App\Http\Controllers\ThreadController::class, 'showPage'])
        ->name('threads.show.page');
    //英会話画面表示
    Route::get('/thread/{thread}', [\App\Http\Controllers\ThreadController::class, 'show'])
        ->name('threads.show');
    //新規スレッド作成
    Route::post('/thread', [\App\Http\Controllers\ThreadController::class, 'store'])
        ->name('threads.store');
    //メッセージ送信
    Route::post('/thread/{thread}/message', [\App\Http\Controllers\MessageController::class, 'store'])
        ->name('messages.store');
    //メッセージを日本語に翻訳
    Route::post('/thread/{thread}/message/{message}/translate', [\App\Http\Controllers\MessageController::class, 'translate'])
        ->name('messages.translate');
    //メッセージを英語に翻訳
    // Route::post('/thread/{thread}/message/{messageId}/translate', [\App\Http\Controllers\MessageController::class, 'translate'])
    //     ->name('messages.translate.en');
    // //メッセージを音声に変換
    // Route::post('/thread/{thread}/message/{messageId}/audio', [\App\Http\Controllers\MessageController::class, 'audio'])
    //     ->name('messages.audio');
});
