// Project/[projectId]/board/components/ProjectProgressBar.tsx
"use client";

import { useEffect, useState } from "react";
import { useCardsApi } from "@/lib/api/cards";
import { Loader2 } from "lucide-react";

interface BreakdownItem {
  column_name: string;
  type: "todo" | "in_progress" | "done" | "other";
  count: number;
}
interface Progress {
  percentage: number;
  total: number;
  done: number;
  breakdown?: BreakdownItem[];
}

const typeStyle: Record<string, { dot: string; pill: string }> = {
  todo:        { dot: "#6b7280", pill: "bg-slate-700 text-slate-300" },
  in_progress: { dot: "#3b82f6", pill: "bg-blue-900/50 text-blue-300" },
  done:        { dot: "#22c55e", pill: "bg-green-900/50 text-green-300" },
  other:       { dot: "#f59e0b", pill: "bg-amber-900/50 text-amber-300" },
};

interface Props {
  projectId: string;
  // 🔥 Ganti onReady callback dengan refreshKey — lebih simpel dan reliable
  // Setiap kali refreshKey berubah, komponen ini re-fetch data
  refreshKey?: number;
}

export default function ProjectProgressBar({ projectId, refreshKey = 0 }: Props) {
  const cardsApi = useCardsApi();
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔥 useEffect depend on refreshKey — tiap kali drag selesai, Board increment refreshKey
  // sehingga progress otomatis re-fetch tanpa perlu callback/ref
  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;

    setLoading(true);
    cardsApi.getProjectProgress(projectId)
      .then((data) => { if (!cancelled) setProgress(data); })
      .catch(() => { if (!cancelled) setProgress(null); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [projectId, refreshKey]); // 🔥 refreshKey di dependency array

  if (loading) return (
    <div className="flex items-center gap-2 text-slate-500 text-xs px-1">
      <Loader2 className="w-3 h-3 animate-spin" /> Memuat progress...
    </div>
  );
  if (!progress) return null;

  const pct = progress.percentage;
  const barColor = pct === 100 ? "#22c55e" : pct >= 50 ? "#3b82f6" : "#ef4444";

  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden">
      {/* Stats + progress bar */}
      <div className="px-5 py-3 flex items-center gap-4">
        {/* Angka */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-center">
            <div className="text-sm font-semibold text-white">{progress.total ?? 0}</div>
            <div className="text-[10px] text-slate-500">Total</div>
          </div>
          <div className="w-px h-5 bg-white/10" />
          <div className="text-center">
            <div className="text-sm font-semibold text-green-400">{progress.done ?? 0}</div>
            <div className="text-[10px] text-slate-500">Done</div>
          </div>
        </div>
        <div className="w-px h-5 bg-white/10 flex-shrink-0" />
        {/* Bar */}
        <div className="flex-1 flex items-center gap-3">
          <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: barColor }} />
          </div>
          <span className="text-sm font-bold tabular-nums flex-shrink-0" style={{ color: barColor }}>
            {pct}%
          </span>
        </div>
      </div>

      {/* Breakdown per kolom */}
      {(progress.breakdown ?? []).length > 0 && (
        <div className="border-t border-white/[0.06] px-5 py-2 flex gap-2 flex-wrap">
          {(progress.breakdown ?? []).map((item) => {
            const s = typeStyle[item.type] ?? typeStyle.other;
            return (
              <span key={item.column_name}
                className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full ${s.pill}`}>
                <span className="w-1.5 h-1.5 rounded-full inline-block flex-shrink-0"
                  style={{ background: s.dot }} />
                {item.column_name}
                <strong>{item.count}</strong>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}