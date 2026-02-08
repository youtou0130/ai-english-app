<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use App\Models\Thread;

class ThreadSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //スレッドデータを作成
        Thread::create([
            'title' => '英会話スレッド1',
        ]);
        Thread::create([
            'title' => '英会話スレッド2',
        ]);
        Thread::create([
            'title' => '英会話スレッド3',
        ]);
        Thread::create([
            'title' => '英会話スレッド4',
        ]);
        Thread::create([
            'title' => '英会話スレッド5',
        ]);
        Thread::create([
            'title' => '英会話スレッド6',
        ]);
        Thread::create([
            'title' => '英会話スレッド7',
        ]);
        Thread::create([
            'title' => '英会話スレッド8',
        ]);
    }
}
