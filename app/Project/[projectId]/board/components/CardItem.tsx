// Project/[projectId]/board/components/CardItem.tsx
"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2, Paperclip, Clock, CheckCircle2, Lock } from "lucide-react";
import { CardType } from "../hooks/useKanban";
import { Member } from "../../team/hooks/useProjectMembers";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  card: CardType;
  isAdmin?: boolean;
  canDrag?: boolean;
  members?: Member[];
  onOpen: (card: CardType) => void;
  onDelete: (cardId: string) => void;
  isOverlay?: boolean;
};

const avatarColor = (name: string) => {
  const palettes = [
    "bg-red-500/20 text-red-400 border-red-500/30",
    "bg-blue-500/20 text-blue-400 border-blue-500/30",
    "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    "bg-purple-500/20 text-purple-400 border-purple-500/30",
    "bg-amber-500/20 text-amber-400 border-amber-500/30",
    "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  ];
  return palettes[(name.charCodeAt(0) || 0) % palettes.length];
};

const roleBadgeClass = (role?: string) => {
  if (role === "PM") return "bg-red-500/15 text-red-400 border-red-500/25";
  if (role === "Developer") return "bg-blue-500/15 text-blue-400 border-blue-500/25";
  if (role === "Designer") return "bg-purple-500/15 text-purple-400 border-purple-500/25";
  if (role === "QA") return "bg-green-500/15 text-green-400 border-green-500/25";
  return "bg-white/5 text-slate-400 border-white/10";
};

export default function CardItem({
  id, card, onOpen, onDelete,
  isAdmin = false, canDrag = true, members = [], isOverlay,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled: !canDrag,
  });

  const style: React.CSSProperties = {
    transform: transform ? CSS.Transform.toString(transform) : "none",
    transition: transition || "none",
    zIndex: isDragging || isOverlay ? 9999 : 0,
    opacity: isDragging ? 0.4 : !canDrag ? 0.6 : 1,
    cursor: canDrag ? "grab" : "not-allowed",
  };

  const progress = card.progress ?? 0;
  const isDone = progress === 100;
  const progressColor = isDone ? "#22c55e" : progress >= 50 ? "#3b82f6" : "#ef4444";

  const assigneeDetails = (card.assignees ?? [])
    .map((clerkId) => members.find((m) => m.clerk_user_id === clerkId))
    .filter(Boolean) as Member[];

  const dueBadge = () => {
    if (!card.dueDate) return null;
    const diff = new Date(card.dueDate).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    const label =
      days < 0 ? "Overdue"
      : days === 0 ? "Hari ini"
      : days === 1 ? "Besok"
      : new Date(card.dueDate).toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
    const cls =
      days < 0 ? "bg-red-50 text-red-700 border-red-200"
      : days <= 1 ? "bg-orange-50 text-orange-700 border-orange-200"
      : "bg-green-50 text-green-700 border-green-200";
    return { label, cls };
  };

  const due = dueBadge();
  const dragProps = canDrag ? { ...attributes, ...listeners } : {};

  return (
    <article
      ref={setNodeRef}
      style={style}
      title={!canDrag ? "Kamu tidak bisa memindahkan card ini karena bukan assignee-nya" : undefined}
      className={cn(
        "bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all duration-150 overflow-hidden",
        isDone && "opacity-70",
        !canDrag && !isOverlay && "ring-1 ring-slate-100"
      )}
      {...dragProps}
    >
      {progress > 0 && (
        <div className="h-[3px] bg-slate-100 w-full">
          <div className="h-full transition-all duration-500" style={{ width: `${progress}%`, background: progressColor }} />
        </div>
      )}

      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex-1 min-w-0" onClick={() => onOpen(card)}>
            <p className={cn("text-sm font-medium text-slate-800 leading-snug", isDone && "line-through text-slate-400")}>
              {card.title}
            </p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {!canDrag && !isOverlay && <Lock className="w-3 h-3 text-slate-300" />}
            {isAdmin && (
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); onDelete(card.id); }}
                className="p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-500 transition">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {card.description && (
          <p className="text-xs text-slate-400 line-clamp-1 mb-2 cursor-pointer" onClick={() => onOpen(card)}>
            {card.description}
          </p>
        )}

        {progress > 0 && (
          <div className="flex items-center gap-1.5 mb-2 cursor-pointer" onClick={() => onOpen(card)}>
            {isDone
              ? <CheckCircle2 className="w-3 h-3 text-green-600" />
              : <div className="w-3 h-3 rounded-full border-2" style={{ borderColor: progressColor }} />
            }
            <span className="text-[10px] font-medium" style={{ color: progressColor }}>
              {isDone ? "Selesai" : `${progress}%`}
            </span>
          </div>
        )}

        {/* ── Assignee chips dengan role ── */}
        {assigneeDetails.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2 cursor-pointer" onClick={() => onOpen(card)}>
            {assigneeDetails.map((m) => {
              const initial = (m.name?.[0] ?? "?").toUpperCase();
              const displayName = m.name ?? "Member";
              return (
                <div
                  key={m.clerk_user_id}
                  title={`${displayName} — ${m.role ?? "Member"}`}
                  className={cn(
                    "flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[10px] font-medium",
                    avatarColor(displayName)
                  )}
                >
                  <span className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold bg-black/10">
                    {initial}
                  </span>
                  <span className="truncate max-w-[60px]">{displayName}</span>
                  {m.role && (
                    <span className={cn(
                      "ml-0.5 px-1 py-px rounded border text-[8px] font-semibold uppercase tracking-wide",
                      roleBadgeClass(m.role)
                    )}>
                      {m.role}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-center gap-1.5 flex-wrap cursor-pointer" onClick={() => onOpen(card)}>
          {due && (
            <span className={cn("flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md border", due.cls)}>
              <Clock className="w-2.5 h-2.5" />{due.label}
            </span>
          )}
          {(card.fileCount ?? 0) > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md border border-slate-200 text-slate-500 bg-slate-50">
              <Paperclip className="w-2.5 h-2.5" />{card.fileCount} file
            </span>
          )}
          {(card.activityCount ?? 0) > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md border border-slate-200 text-slate-500 bg-slate-50">
              <Clock className="w-2.5 h-2.5" />{card.activityCount} log
            </span>
          )}
        </div>
      </div>
    </article>
  );
}