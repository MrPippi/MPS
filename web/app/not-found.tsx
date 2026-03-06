import Link from 'next/link';
import { PickaxeIcon } from '@/components/icons/PickaxeIcon';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl border border-[#30363d] bg-[#161b22] text-[#3fb950]">
        <PickaxeIcon className="h-8 w-8" />
      </div>
      <div className="text-6xl font-extrabold text-[#21262d] mb-3 tabular-nums">404</div>
      <h1 className="text-xl font-bold text-[#e6edf3] mb-2">找不到頁面</h1>
      <p className="text-sm text-[#484f58] mb-8 max-w-sm">
        找不到這個頁面，可能已移除或路徑輸入有誤。
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-md bg-[#3fb950] px-5 py-2.5 text-sm font-semibold text-[#0d1117] transition-all hover:bg-[#56d364]"
      >
        回首頁
      </Link>
    </div>
  );
}
