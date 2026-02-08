import { Link } from "@inertiajs/react";
import { HiChat, HiPlus, HiChatAlt2, HiOutlineChat } from "react-icons/hi";
import { ImBubbles2 } from "react-icons/im";
import { ImPlus } from "react-icons/im";

const SIDEBAR_BG = "bg-green-700";
const SIDEBAR_ITEM_HOVER = "hover:bg-green-600";
const SIDEBAR_ITEM_ACTIVE = "bg-green-600";

export function SideMenu({ threads = [], activeThreadId = null }) {
    return (
        <aside
            className={`${SIDEBAR_BG} flex h-screen w-64 flex-col text-white`}
            aria-label="サイドメニュー"
        >
            {/* ヘッダー: ロゴ + アプリ名 */}
            <div className="flex items-center gap-3 border-b border-green-600 px-5 py-4">
                <ImBubbles2 className="h-10 w-10 text-sky-400" aria-hidden />
                <span className="font-bold text-white">MyEnglishApp</span>
            </div>

            {/* ナビゲーション */}
            <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto py-3">
                {/* 新規スレッド作成 */}
                <Link
                    href={route('threads.store')}
                    method="post"
                    as="button"
                    className={`flex items-center gap-3 px-5 py-3 ${SIDEBAR_ITEM_HOVER} ${SIDEBAR_ITEM_ACTIVE}`}
                >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-white">
                        <ImPlus className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="font-medium">新規スレッド作成</span>
                </Link>

                {/* スレッド一覧 */}
                {threads.map((thread) => {
                    const isActive = activeThreadId === thread.id;
                    return (
                        <Link
                            key={thread.id}
                            href={`/thread/${thread.id}`}
                            className={`flex items-center gap-3 px-5 py-3 ${SIDEBAR_ITEM_HOVER} ${isActive ? SIDEBAR_ITEM_ACTIVE : ""}`}
                        >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-400/90 text-white">
                                <HiChatAlt2 className="h-4 w-4" aria-hidden />
                            </span>
                            <span className="truncate font-medium">
                                {thread.title || `英会話スレッド${thread.id}`}
                            </span>
                        </Link>
                    );
                })}

                {/* スレッドが無いときのプレースホルダー表示 */}
                {threads.length === 0 && (
                    <>
                        {[1, 2, 3, 4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20].map((n) => (
                            <div
                                key={n}
                                className="flex items-center gap-3 px-5 py-3 text-white"
                            >
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-400/90 text-white">
                                    <HiChatAlt2 className="h-4 w-4" aria-hidden />
                                </span>
                                <span className="font-medium">英会話スレッド{n}</span>
                            </div>
                        ))}
                    </>
                )}
            </nav>
        </aside>
    );
}
