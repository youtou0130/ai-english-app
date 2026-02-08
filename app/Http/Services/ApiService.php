<?php

namespace App\Http\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\File;

class ApiService
{
    public function callwhisperApi($audioFilePath)
    {
        //$audioFilePath(audio/audio_20260207013801.webm)をwhisperAPIに送信してテキストを取得
        //callの場合はこのようなコマンドを実行する
        // curl https://api.openai.com/v1/audio/transcriptions \
        // -H "Authorization: Bearer $OPENAI_API_KEY" \
        // -H "Content-Type: multipart/form-data" \
        // -F file="@/path/to/file/audio.mp3" \
        // -F model="gpt-4o-transcribe"

        $response = Http::attach(
            'file',
            file_get_contents(
            storage_path('app/public/'.$audioFilePath)),
            'audio.webm'
            )
            ->withHeaders([
                'Authorization' => 'Bearer ' . env('OPENAI_API_KEY'),
                //'Content-Type' => 'multipart/form-data',
            ])
            ->post('https://api.openai.com/v1/audio/transcriptions', [
                'model' => 'whisper-1',
                'language' => 'en',
        ]);
        //dd($response->json());
        return $response->json();
    }

    /**
     * OpenAI Chat Completions API を呼び出す。
     * curl 参考:
     *   curl https://api.openai.com/v1/chat/completions \
     *     -H "Content-Type: application/json" \
     *     -H "Authorization: Bearer $OPENAI_API_KEY" \
     *     -d '{"model":"gpt-4o-mini","messages":[{"role":"system","content":"You are a helpful assistant."},{"role":"user","content":"Hello!"}]}'
     *
     * @param \Illuminate\Support\Collection<int, \App\Models\Message> $messages
     * @return array
     */
    public function callGptApi($messages)
    {
        $apiMessages = [
            [
                'role' => 'system',
                'content' => 'You are a friendly person having a casual conversation with the user in English.Act naturally and encourage conversation.Don\'t provide lists, extensive advice, or instructional content unless the user occasionally requests it.',
            ],
        ];

        foreach ($messages as $msg) {
            $role = $msg->sender === \App\Models\Message::SENDER_USER ? 'user' : 'assistant';
            $content = $msg->message_en ?? $msg->message_ja ?? '';
            if ($content !== '') {
                $apiMessages[] = [
                    'role' => $role,
                    'content' => $content,
                ];
            }
        }

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'Authorization' => 'Bearer ' . config('services.openai.key', env('OPENAI_API_KEY')),
        ])->post('https://api.openai.com/v1/chat/completions', [
            'model' => 'gpt-4o-mini',
            'messages' => $apiMessages,
        ]);
        //dd($response->json());
        return $response->json();
    }

    /**
    * OpenAI Audio Speech API を呼び出す。
    * curl 参考:
    * curl https://api.openai.com/v1/audio/speech \
    *   -H "Authorization: Bearer $OPENAI_API_KEY" \
    *   -H "Content-Type: application/json" \
    *   -d '{
    *     "model": "gpt-4o-mini-tts",
    *     "input": "Today is a wonderful day to build something people love!",
    *     "voice": "coral",
    *     "instructions": "Speak in a cheerful and positive tone."
    *   }' \
    *   --output speech.mp3
    * @param string $aimessageText
    * @return string 保存した音声ファイルのパス（storage/app/public からの相対パス）
    */
    public function callTtsApi($aimessageText): string
    {
        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'Authorization' => 'Bearer ' . config('services.openai.key', env('OPENAI_API_KEY')),
        ])->post('https://api.openai.com/v1/audio/speech', [
            'model' => 'tts-1',
            'input' => $aimessageText,
            //alloy, ash, coral, echo, fable, onyx, nova, sage
            'voice' => 'nova',
            //'instructions' => 'Speak in a clear and natural tone as an English teacher.',
            'response_format' => 'wav',
        ]);

        $filename = 'speech_' . date('YmdHis') . '.wav';
        $relativePath = 'ai_audio/' . $filename;
        $fullPath = storage_path('app/public/' . $relativePath);

        File::ensureDirectoryExists(dirname($fullPath));

        file_put_contents($fullPath, $response->body());

        return $relativePath;
    }

    /**
     * 英文を日本語に翻訳（GPT を使用）
     *
     * @param string $messageEn 英文
     * @return string 日本語訳
     */
    public function callTranslateApi(string $messageEn): string
    {
        if ($messageEn === '') {
            return '';
        }

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'Authorization' => 'Bearer ' . config('services.openai.key', env('OPENAI_API_KEY')),
        ])->post('https://api.openai.com/v1/chat/completions', [
            'model' => 'gpt-4o-mini',
            'messages' => [
                [
                    'role' => 'system',
                    'content' => 'You are a translator. Translate the following English text into natural Japanese. Reply with only the Japanese translation, no explanation or prefix.',
                ],
                [
                    'role' => 'user',
                    'content' => $messageEn,
                ],
            ],
        ]);

        $json = $response->json();
        $message_ja = $json['choices'][0]['message']['content'] ?? '';

        return trim($message_ja);
    }
}
