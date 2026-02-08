import { Link } from '@inertiajs/react'

/**
 * ログアウトボタン。
 * AuthenticatedLayout の Dropdown.Link と同様に、Inertia の Link で POST 送信する。
 * routes/auth.php の logout (AuthenticatedSessionController::destroy) が処理する。
 */
export default function LogoutButton({ className = '' }) {
  return (
    <Link
      href={route('logout')}
      method="post"
      as="button"
      className={
        'rounded-lg bg-neutral-300 px-4 py-2 text-sm font-medium text-black transition hover:bg-neutral-200 ' +
        className
      }
    >
      ログアウト
    </Link>
  )
}
