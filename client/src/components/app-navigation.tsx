'use client';
import Link from 'next/link';
import { shopConfig } from '@/lib/shop';
import { navigationItems } from '@/config/navigation';
import { useUnsavedChanges } from '@/components/ui/unsaved-changes';

type Props = { current: (typeof navigationItems)[number]['id'] };
export function AppNavigation({ current }: Props) {
  const { unsaved } = useUnsavedChanges();
  const confirmLeave = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (
      unsaved &&
      !window.confirm(
        'You have an unsaved order. Leave this page and discard it?',
      )
    )
      event.preventDefault();
  };
  return (
    <>
      <header className="sticky top-0 z-30 flex min-h-14 items-center justify-between border-b border-stone-200 bg-white/95 px-4 shadow-sm backdrop-blur lg:hidden">
        <Link
          href="/"
          onClick={confirmLeave}
          className="flex min-h-11 items-center gap-2 font-extrabold text-stone-950"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-800 text-xs text-white">
            KA
          </span>
          {shopConfig.shopName}
        </Link>
      </header>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-stone-200 bg-white p-4 lg:flex lg:flex-col">
        <Link
          href="/"
          onClick={confirmLeave}
          className="flex min-h-14 items-center gap-3 rounded-xl px-2 font-extrabold leading-tight text-stone-950"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-800 text-sm text-white">
            KA
          </span>
          <span>{shopConfig.shopName}</span>
        </Link>
        <p className="mb-2 mt-8 px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-stone-400">
          Workspace
        </p>
        <nav aria-label="Main navigation" className="space-y-1">
          {navigationItems.map(({ href, id, label, icon: Icon }) => (
            <Link
              key={id}
              href={href}
              onClick={confirmLeave}
              aria-current={current === id ? 'page' : undefined}
              className={`flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-200 ${current === id ? 'bg-amber-100 text-amber-950' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-950'}`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-950">
          <p className="font-bold">Daily order desk</p>
          <p className="mt-1 text-amber-900/80">
            Bills and reports for your shop.
          </p>
        </div>
      </aside>
      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-50 grid min-h-[68px] grid-cols-3 border-t border-stone-200 bg-white/95 px-2 pb-2 pt-1 shadow-[0_-5px_20px_rgba(41,37,36,0.08)] backdrop-blur lg:hidden"
      >
        {navigationItems.map(({ href, id, label, icon: Icon }) => (
          <Link
            key={id}
            href={href}
            onClick={confirmLeave}
            aria-current={current === id ? 'page' : undefined}
            className={`flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-200 ${current === id ? 'text-amber-900' : 'text-stone-500'}`}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
}
