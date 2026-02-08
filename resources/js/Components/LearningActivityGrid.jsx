/**
 * GitHub風の学習記録グリッド（英会話の「草」）
 * - 縦7マス（行）: 曜日（上＝日、下＝土）。row 0=日, 1=月, …, 6=土
 * - 横12列（列）: 週。col 0=過去、col 11=最新の週
 * - highlightedCells: [col, row][] の配列。該当セルを緑で表示
 */
const ROWS = 7
const COLS = 12
const GAP_PX = 4

const DAY_LABELS = ['日', '月', '火', '水', '木', '金', '土']

export function LearningActivityGrid({
  highlightedCells = [],
  showDayLabels = false,
}) {
  return (
    <div className="learning-activity-grid flex h-full w-full min-h-0 min-w-0">
      {showDayLabels && (
        <div
          className="flex flex-col justify-between shrink-0 pr-3 text-neutral-400"
          style={{
            fontSize: 'clamp(0.75rem, 1.5vw, 0.95rem)',
          }}
        >
          {DAY_LABELS.map((label, i) => (
            <span key={i}>{label}</span>
          ))}
        </div>
      )}

      {/* グリッド: 7行×12列。左が過去・右が最新、上が日曜・下が土曜 */}
      <div
        className="flex-1 min-h-[240px] rounded-xl border border-neutral-600/80 bg-neutral-700/60 p-4"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`,
          columnGap: GAP_PX,
          rowGap: GAP_PX,
        }}
      >
        {Array.from({ length: ROWS * COLS }, (_, i) => {
          const col = i % COLS
          const row = Math.floor(i / COLS)
          const isHighlighted = highlightedCells.some(
            ([c, r]) => c === col && r === row
          )
          return (
            <div
              key={i}
              className={`min-h-[8px] rounded-md ${isHighlighted ? 'bg-emerald-500' : 'bg-neutral-400'}`}
              title={isHighlighted ? `${DAY_LABELS[row]}（学習日）` : `${DAY_LABELS[row]}`}
            />
          )
        })}
      </div>
    </div>
  )
}
