// Project/[projectId]/board/components/BoardActivitySidebar.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { Loader2, Clock, RefreshCw, X } from "lucide-react";

import { useActivityLogsApi, ActivityLog } from "@/lib/api/activityLogs";
import { useProjectMembers } from "../../team/hooks/useProjectMembers";

// --- INTERFACES ---
interface Props {
  projectId: string;
  onClose?: () => void;
}

// --- UTILITIES ---
const formatTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "Baru saja";
  if (mins < 60) return `${mins} mnt lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  if (days < 7) return `${days} hari lalu`;

  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
  });
};

const avatarColors = [
  "bg-red-500/20 border-red-500/30 text-red-400",
  "bg-blue-500/20 border-blue-500/30 text-blue-400",
  "bg-emerald-500/20 border-emerald-500/30 text-emerald-400",
  "bg-purple-500/20 border-purple-500/30 text-purple-400",
  "bg-amber-500/20 border-amber-500/30 text-amber-400",
];

const getAvatarColor = (str: string) =>
  avatarColors[str.charCodeAt(0) % avatarColors.length];

// --- SUB-COMPONENTS ---
/**
 * Komponen terpisah untuk setiap item log aktivitas
 * Membantu membuat komponen utama menjadi lebih bersih
 */
const LogItem = ({
  log,
  isLast,
  resolvedName,
  userFirstName,
}: {
  log: ActivityLog;
  isLast: boolean;
  resolvedName: string;
  userFirstName?: string;
}) => {
  const initial =
    resolvedName === "Kamu"
      ? (userFirstName?.[0] ?? "K").toUpperCase()
      : resolvedName[0].toUpperCase();
      
  const colorClass = getAvatarColor(initial);

  return (
    <div className="flex gap-2.5 py-2">
      <div
        className={`flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold mt-0.5 ${colorClass}`}
      >
        {initial}
      </div>
      <div
        className={`flex-1 min-w-0 pb-2 ${
          !isLast ? "border-b border-white/[0.04]" : ""
        }`}
      >
        <p className="text-[11px] text-slate-300 leading-relaxed">
          <span className="font-semibold">{resolvedName}</span>{" "}
          <span className="text-slate-400">{log.description}</span>
        </p>
        <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-600">
          <Clock className="w-2.5 h-2.5 flex-shrink-0" />
          {formatTime(log.created_at)}
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
export default function BoardActivitySidebar({ projectId, onClose }: Props) {
  // 1. Hooks
  const { user } = useUser();
  const activityApi = useActivityLogsApi();
  const { members } = useProjectMembers(projectId);

  // 2. States
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 3. Helper Functions
  const resolveName = (clerkUserId: string) => {
    if (clerkUserId === user?.id) return "Kamu";
    const member = members.find((m) => m.clerk_user_id === clerkUserId);
    if (!member) return "Member";
    return `${member.name ?? "Member"} ${member.role ? `(${member.role})` : ""}`;
  };

  const fetchLogs = useCallback(async () => {
    if (!projectId) return;
    try {
      const data = await activityApi.getLogsByProject(projectId);
      setLogs(data);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]); // activityApi diabaikan dari deps untuk mencegah re-render jika API hook tidak di-memoize

  // 4. Effects
  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 30000);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  // 5. Render
  return (
    <div
      className="flex flex-col bg-[#111114] border border-white/8 rounded-2xl overflow-hidden"
      style={{ maxHeight: "calc(100vh - 280px)", minHeight: "300px" }}
    >
      {/* --- Header --- */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Aktivitas
          </span>
          <span className="text-[10px] text-slate-600">({logs.length})</span>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setRefreshing(true);
              fetchLogs();
            }}
            disabled={refreshing}
            className="p-1 rounded-lg hover:bg-white/8 transition text-slate-500 hover:text-slate-300 disabled:opacity-50"
            aria-label="Refresh aktivitas"
          >
            <RefreshCw
              className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`}
            />
          </button>
          
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/8 transition text-slate-500 hover:text-slate-300"
              aria-label="Tutup sidebar"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* --- Log List Content --- */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.08)_transparent]">
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center mt-8">
            <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
          </div>
        )}

        {/* Empty State */}
        {!loading && logs.length === 0 && (
          <div className="text-center mt-8">
            <p className="text-xs text-slate-600">Belum ada aktivitas</p>
          </div>
        )}

        {/* Data State */}
        {!loading &&
          logs.map((log, i) => (
            <LogItem
              key={log.id}
              log={log}
              isLast={i === logs.length - 1}
              resolvedName={resolveName(log.clerk_user_id)}
              userFirstName={user?.firstName || undefined}
            />
          ))}
      </div>
    </div>
  );
}