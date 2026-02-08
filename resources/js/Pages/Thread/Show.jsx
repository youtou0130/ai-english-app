import { Head, router } from '@inertiajs/react'
import { useRef, useState, useCallback, useEffect } from 'react'
import axios from 'axios'
import LogoutButton from '@/Components/LogoutButton'
import { SideMenu } from '@/Components/SideMenu'
import { HiMicrophone } from 'react-icons/hi2'
import { HiSpeakerphone } from 'react-icons/hi'

/** sender: 1=ユーザー, 2=AI */
const SENDER_USER = 1
const SENDER_AI = 2

export default function Show({ threads = [], activeThreadId = null, messages = [] }) {
  const [isRecording, setIsRecording] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [translatedJa, setTranslatedJa] = useState({})
  const [showJaByMessageId, setShowJaByMessageId] = useState({})
  const mediaRecorderRef = useRef(null)
  const streamRef = useRef(null)
  const chunksRef = useRef([])
  const audioRef = useRef(null)
  const playingMessageIdRef = useRef(null)
  const messagesScrollRef = useRef(null)

  // 表示時に、会話エリアを一番下にスクロール
  useEffect(() => {
    messagesScrollRef.current?.scrollTo({
      top: messagesScrollRef.current.scrollHeight,
      behavior: 'auto',
    })
  }, [messages])

  // 表示時に、音声ファイルを持つ最新メッセージの音声を自動再生
  useEffect(() => {
    const withAudio = messages.filter((m) => m.audio_file_path)
    const latest = withAudio[withAudio.length - 1]
    if (!latest?.audio_file_path) return
    const audio = new Audio(`/storage/${latest.audio_file_path}`)
    const p = audio.play()
    if (p !== undefined) p.catch(() => {}) // 自動再生がブロックされても無視
  }, [messages])

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      chunksRef.current = []

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm'
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = async () => {
        streamRef.current?.getTracks().forEach((track) => track.stop())
        streamRef.current = null
        if (chunksRef.current.length === 0) return

        const blob = new Blob(chunksRef.current, { type: mimeType })
        const formData = new FormData()
        formData.append('audio', blob, 'audio.webm')
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
        if (csrfToken) formData.append('_token', csrfToken)

        setIsUploading(true)
        try {
          await axios.post(route('messages.store', { thread: activeThreadId }), formData, {
            headers: { 'Content-Type': 'multipart/form-data', 'Accept': 'application/json' },
          })
          router.reload()
        } catch (err) {
          console.error('Failed to send audio:', err)
        } finally {
          setIsUploading(false)
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (err) {
      console.error('Failed to start recording:', err)
    }
  }, [activeThreadId])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }, [])

  const handleMicClick = useCallback(() => {
    if (!activeThreadId) return
    if (isRecording) stopRecording()
    else startRecording()
  }, [activeThreadId, isRecording, startRecording, stopRecording])

  const handleTranslateClick = useCallback(
    async (msg) => {
      const message_ja = translatedJa[msg.id] ?? msg.message_ja ?? ''

      if (showJaByMessageId[msg.id]) {
        setShowJaByMessageId((prev) => ({ ...prev, [msg.id]: false }))
        return
      }

      if (message_ja) {
        setShowJaByMessageId((prev) => ({ ...prev, [msg.id]: true }))
        return
      }

      try {
        const { data } = await axios.post(
          route('messages.translate', { thread: activeThreadId, message: msg.id }),
          {},
          { headers: { Accept: 'application/json' } }
        )
        if (data?.ok && data?.message_ja != null) {
          setTranslatedJa((prev) => ({ ...prev, [data.message_id]: data.message_ja }))
          setShowJaByMessageId((prev) => ({ ...prev, [data.message_id]: true }))
        }
      } catch (err) {
        console.error('Failed to translate:', err)
      }
    },
    [activeThreadId, translatedJa, showJaByMessageId]
  )

  const handleSpeakerClick = useCallback((msg) => {
    if (!msg.audio_file_path) return
    if (playingMessageIdRef.current === msg.id) {
      audioRef.current?.pause()
      audioRef.current = null
      playingMessageIdRef.current = null
      return
    }
    audioRef.current?.pause()
    const audio = new Audio(`/storage/${msg.audio_file_path}`)
    audioRef.current = audio
    playingMessageIdRef.current = msg.id
    audio.onended = () => {
      playingMessageIdRef.current = null
      audioRef.current = null
    }
    audio.play().catch(() => {})
  }, [])

  const displayMessages = messages.map((msg) => {
    const message_ja = translatedJa[msg.id] ?? msg.message_ja ?? ''
    const showJa = !!showJaByMessageId[msg.id]
    const text = showJa && message_ja ? message_ja : (msg.message_en ?? '')
    return {
      id: msg.id,
      role: msg.sender === SENDER_USER ? 'user' : 'ai',
      text,
      message_en: msg.message_en ?? '',
      message_ja: msg.message_ja ?? '',
      audio_file_path: msg.audio_file_path ?? null,
    }
  })
  return (
    <>
      <Head title="英会話" />
      {/* アップロード中オーバーレイ: 画面操作をブロック＋スピナー */}
      {isUploading && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          aria-hidden="true"
          style={{ pointerEvents: 'all' }}
        >
          <div className="flex flex-col items-center gap-4">
            <div
              className="h-14 w-14 animate-spin rounded-full border-4 border-white border-t-transparent"
              role="status"
              aria-label="送信中"
            />
            <p className="text-sm font-medium text-white">送信中...</p>
          </div>
        </div>
      )}
      <div className="flex h-screen overflow-hidden">
        <SideMenu threads={threads} activeThreadId={activeThreadId} />

        {/* メインエリア: ダークグレー背景（チャット） */}
        <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[#363636] p-6">
          {/* 右上: ログアウト */}
          <div className="mb-6 flex justify-end">
            <LogoutButton />
          </div>

          {/* 会話表示エリア */}
          <div
            ref={messagesScrollRef}
            className="flex flex-1 flex-col gap-6 overflow-y-auto pb-24"
          >
            {displayMessages.map((msg) =>
              msg.role === 'user' ? (
                /* ユーザーメッセージ: 右寄せ・吹き出し＋「You」ラベル */
                <div key={msg.id} className="flex items-end justify-end gap-2">
                  <div className="max-w-[80%] rounded-xl bg-[#D3D3D3] px-4 py-2.5">
                    <p className="text-neutral-800">{msg.text}</p>
                  </div>
                  <div className="rounded-lg bg-[#D3D3D3] px-2.5 py-1.5">
                    <span className="text-sm font-medium text-neutral-800">You</span>
                  </div>
                </div>
              ) : (
                /* AIメッセージ: 左寄せ・AIアバター＋吹き出し＋スピーカー＋Aあ */
                <div key={msg.id} className="flex items-end gap-2">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#D3D3D3] text-sm font-medium text-neutral-800">
                    AI
                  </div>
                  <div className="max-w-[80%] rounded-xl bg-[#D3D3D3] px-4 py-2.5">
                    <p className="text-neutral-800">{msg.text}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSpeakerClick(msg)}
                      disabled={!msg.audio_file_path}
                      className="rounded p-1.5 text-white transition hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label={msg.audio_file_path ? '音声を再生' : '音声なし'}
                    >
                      <HiSpeakerphone className="h-5 w-5" size={24} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTranslateClick(msg)}
                      className="rounded-lg bg-[#D3D3D3] px-2.5 py-1.5 text-sm font-medium text-neutral-800 transition hover:bg-neutral-400"
                      aria-label={showJaByMessageId[msg.id] ? '英語で表示' : '日本語で表示'}
                    >
                      Aあ
                    </button>
                  </div>
                </div>
              )
            )}
          </div>

          {/* 音声入力ボタン: 右下に常時表示 */}
          <div className="absolute bottom-6 right-6 pb-10">
            <button
              type="button"
              onClick={handleMicClick}
              disabled={!activeThreadId}
              className={`flex h-20 w-20 items-center justify-center rounded-full shadow-lg transition focus:outline-none focus:ring-2 focus:ring-neutral-400 disabled:opacity-50 disabled:cursor-not-allowed ${
                isRecording
                  ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
                  : 'bg-white text-neutral-800 hover:bg-neutral-100'
              }`}
              aria-label={isRecording ? '録音停止' : '録音開始'}
            >
              <HiMicrophone className="h-10 w-10" />
            </button>
          </div>
        </main>
      </div>
    </>
  )
}
