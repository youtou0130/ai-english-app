import { Head } from '@inertiajs/react'
import LogoutButton from '@/Components/LogoutButton'
import { LearningActivityGrid } from '@/Components/LearningActivityGrid'
import { SideMenu } from '@/Components/SideMenu'

const COLS = 12 // 週の数（右が最新）
const ROWS = 7  // 曜日（上=日〜下=土）

/**
 * 学習日リスト（Y-m-d）を、グリッドの [列, 行] に変換する。
 * 縦=曜日(0=日〜6=土)、横=週(0=過去〜11=最新)。表示範囲は過去12週間。
 */
function activityDatesToHighlightedCells(activityDates = []) {
  if (!activityDates.length) return []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const rangeEnd = today.getTime()
  const rangeStart = new Date(today)
  rangeStart.setDate(rangeStart.getDate() - 7 * COLS)
  const rangeStartTime = rangeStart.getTime()

  const cells = []
  const seen = new Set()
  for (const dateStr of activityDates) {
    const d = new Date(dateStr + 'T00:00:00')
    const t = d.getTime()
    if (t < rangeStartTime || t > rangeEnd) continue
    const row = d.getDay()
    const diffDays = Math.floor((rangeEnd - t) / (24 * 60 * 60 * 1000))
    const col = Math.max(0, COLS - 1 - Math.floor(diffDays / 7))
    const key = `${col},${row}`
    if (seen.has(key)) continue
    seen.add(key)
    cells.push([col, row])
  }
  return cells
}

export default function Top({ threads = [], activityDates = [] }) {
  const highlightedCells = activityDatesToHighlightedCells(activityDates)

  return (
    <>
      <Head title="トップ" />
      <div className="flex h-screen overflow-hidden">
        <SideMenu threads={threads} />

        {/* メインエリア: ダークグレー背景 */}
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-neutral-800 p-6">
          {/* 右上: ログアウト */}
          <div className="mb-6 flex justify-end">
            <LogoutButton />
          </div>

          {/* タイトル */}
          <h1 className="mb-6 text-xl font-semibold text-white sm:text-2xl">
            英会話学習記録
          </h1>

          {/* グリッド: このエリアのサイズに合わせてセルを伸縮 */}
          <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
            <LearningActivityGrid highlightedCells={highlightedCells} showDayLabels />
          </div>
        </main>
      </div>
    </>
  )
}
