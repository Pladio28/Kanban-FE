// Project/[projectId]/board/components/Column.tsx
"use client";

import React, { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import CardItem from "./CardItem";
import { Pencil, Trash2 } from "lucide-react";
import { ColumnType, CardType } from "../hooks/useKanban";
import { Member } from "../../team/hooks/useProjectMembers";

type Props = {
  column: ColumnType;
  isAdmin?: boolean;
  currentUserId?: string;
  members?: Member[];
  onAddCard: (columnId: string, title: string) => void;
  onDeleteColumn: (id: string) => void;
  onEditColumnTitle: (id: string, title: string) => void;
  onOpenCard: (card: CardType) => void;
  onDeleteCard: (columnId: string, cardId: string) => void;
};

const typeConfig: Record<string, { dot: string; text: string }> = {
  todo:        { dot: "#6b7280", text: "#9ca3af" },
  in_progress: { dot: "#3b82f6", text: "#60a5fa" },
  done:        { dot: "#22c55e", text: "#4ade80" },
  other:       { dot: "#f59e0b", text: "#fbbf24" },
};

export default function Column({
  column, isAdmin = false, currentUserId = "", members = [],
  onAddCard, onDeleteColumn, onEditColumnTitle, onOpenCard, onDeleteCard,
}: Props) {
  const { setNodeRef } = useDroppable({ id: column.id });
  const [adding, setAdding] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");

  const handleAddCard = () => {
    if (!newCardTitle.trim()) return;
    onAddCard(column.id, newCardTitle.trim());
    setNewCardTitle("");
    setAdding(false);
  };

  const cfg = typeConfig[column.type ?? "other"] ?? typeConfig.other;

  return (
    <div ref={setNodeRef}
      className="w-full rounded-2xl bg-[#111114] border border-white/8 flex flex-col overflow-hidden">

      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-white/8">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
          <h3 className="text-sm font-semibold truncate" style={{ color: cfg.text }}>{column.title}</h3>
          <span className="text-[10px] text-slate-600 bg-white/5 px-1.5 py-0.5 rounded-full">
            {column.cards.length}
          </span>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-1">
            <button onClick={() => onEditColumnTitle(column.id, column.title)}
              className="p-1 rounded-lg hover:bg-white/8 transition text-slate-600 hover:text-slate-300">
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onDeleteColumn(column.id)}
              className="p-1 rounded-lg hover:bg-red-500/10 transition text-slate-600 hover:text-red-400">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Cards */}
      <SortableContext items={column.cards.map((c) => c.id)} strategy={rectSortingStrategy}>
        <div className="p-3 space-y-2 min-h-[60px] flex-1">
          {column.cards.map((card) => {
            const isAssignee = (card.assignees ?? []).includes(currentUserId);
            const canDrag = isAdmin || isAssignee;
            return (
              <CardItem
                key={card.id}
                id={card.id}
                card={card}
                isAdmin={isAdmin}
                canDrag={canDrag}
                members={members}
                onOpen={onOpenCard}
                onDelete={(cardId) => onDeleteCard(column.id, cardId)}
              />
            );
          })}
        </div>
      </SortableContext>

      {/* Add Card */}
      {isAdmin && (
        <div className="p-3 border-t border-white/8">
          {adding ? (
            <div className="flex flex-col gap-2">
              <input autoFocus value={newCardTitle} onChange={(e) => setNewCardTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAddCard(); if (e.key === "Escape") { setAdding(false); setNewCardTitle(""); } }}
                placeholder="Judul tugas..."
                className="px-3 py-2 w-full rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-red-500/40" />
              <div className="flex gap-2">
                <button onClick={handleAddCard}
                  className="flex-1 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-medium transition">
                  Tambah
                </button>
                <button onClick={() => { setAdding(false); setNewCardTitle(""); }}
                  className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 text-xs font-medium transition">
                  Batal
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setAdding(true)}
              className="w-full py-2 rounded-xl border border-dashed border-white/10 text-slate-600 hover:border-white/20 hover:text-slate-400 text-xs font-medium transition">
              + Add Task
            </button>
          )}
        </div>
      )}
    </div>
  );
}