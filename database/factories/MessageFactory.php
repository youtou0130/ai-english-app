<?php

namespace Database\Factories;

use App\Models\Message;
use App\Models\Thread;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Message>
 */
class MessageFactory extends Factory
{
    protected $model = Message::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'thread_id' => Thread::factory(),
            'message_en' => fake()->sentence(),
            'message_ja' => fake()->realText(20),
            'sender' => Message::SENDER_USER,
            'audio_file_path' => null,
        ];
    }
}
