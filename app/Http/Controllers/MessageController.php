<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Models\Thread;
use App\Models\Message;
use App\Http\Services\ApiService;

class MessageController extends Controller
{
    //メッセージ送信（音声アップロード）
    public function store(Request $request, Thread $thread)
    {
        if (!$request->hasFile('audio')) {
            return redirect()->route('threads.show', ['thread' => $thread->id]);
        }

        $audio = $request->file('audio');
        $timestamp = now()->format('YmdHis');
        $path = $audio->storeAs('audio', "audio_{$timestamp}.webm", 'public');
        //データベースに保存する処理を追加
        $message = Message::create([
            'thread_id' => $thread->id,
            'message_en' => 'dummy',
            'message_ja' => '',
            'sender' => Message::SENDER_USER,
            'audio_file_path' => $path,
        ]);

        //音声ファイルをAPIに送信
        $apiService = new ApiService();
        $response = $apiService->callwhisperApi($path);
        $message_en = $response['text'];
        //データベースを更新
        $message->update([
            'message_en' => $message_en,
        ]);

        $messages = Message::where('thread_id', $thread->id)->orderBy('created_at', 'asc')->get();
        // GPTにAPIリクエストを送信
        $gptresponse = $apiService->callGptApi($messages);
        $aimessageText = $gptresponse['choices'][0]['message']['content'];
        // AIメッセージをデータベースに保存
        $aiMessage = Message::create([
            'thread_id' => $thread->id,
            'message_ja' => '',
            'message_en' => $aimessageText,
            'sender' => Message::SENDER_AI,
            'audio_file_path' => '',
        ]);

        // TTSにAPIリクエスト
        $aiAudioFilePath = $apiService->callTtsApi($aimessageText);
        //dd($ttsResponse);
        //データベースに音声ファイルパスを保存する
        $aiMessage->update([
            'audio_file_path' => $aiAudioFilePath,
        ]);

        return redirect()->route('threads.show', ['thread' => $thread->id]);
    }

    /**
     * メッセージを日本語に翻訳（message_en → 日本語）
     *
     * @param Request $request
     * @param Thread $thread
     * @param Message $message
     * @return \Illuminate\Http\JsonResponse
     */
    public function translate(Request $request, Thread $thread, Message $message)
    {
        $message_en = $message->message_en ?? '';
        $apiService = new ApiService();
        $message_ja = $apiService->callTranslateApi($message_en);
        $message->update(['message_ja' => $message_ja]);

        return response()->json([
            'ok' => true,
            'message_id' => $message->id,
            'message_ja' => $message_ja,
        ]);
    }
}
