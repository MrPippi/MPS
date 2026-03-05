import Link from 'next/link';
import { PickaxeIcon } from '@/components/icons/PickaxeIcon';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-800 text-emerald-400">
        <PickaxeIcon className="h-10 w-10" />
      </div>
      <h1 className="text-4xl font-bold text-slate-100 mb-2">404</h1>
      <p className="text-slate-400 mb-6">找不到這個頁面，可能已移除或路徑輸入有誤。</p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400 transition-colors"
      >
        回首頁
      </Link>
    </div>
  );
}
