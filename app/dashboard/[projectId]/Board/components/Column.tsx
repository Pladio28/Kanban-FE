"use client";
import React, { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import CardItem from "./CardItem";
import { Pencil, Trash2 } from "lucide-react";
import { ColumnType, CardType } from "../hooks/useLocalKanban";
import { Button } from "@/components/ui/button";

type Props = {
  column: ColumnType;
  onAddCard: (columnId: string, title: string) => void;
  onDeleteColumn: (id: string) => void;
  onEditColumnTitle: (id: string, title: string) => void;
  onOpenCard: (card: CardType) => void;
  onDeleteCard: (columnId: string, cardId: string) => void;
};

export default function Column({ column, onAddCard, onDeleteColumn, onEditColumnTitle, onOpenCard, onDeleteCard }: Props) {
  const { setNodeRef } = useDroppable({ id: column.id });
  const [adding, setAdding] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");

  const handleAddCard = () => {
    if (!newCardTitle.trim()) return;
    onAddCard(column.id, newCardTitle.trim());
    setNewCardTitle("");
    setAdding(false);
  };

  return (
    <div ref={setNodeRef} className="w-[300px] bg-[#f4f5f7] rounded-2xl shadow-sm border flex flex-col">
      <div className="px-4 py-3 rounded-t-2xl flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">{column.title}</h3>

        <div className="flex items-center gap-2">
          <button title="Edit judul" onClick={() => onEditColumnTitle(column.id, column.title)} className="p-1 rounded hover:bg-white/30">
            <Pencil className="w-4 h-4 text-slate-700" />
          </button>
          <button title="Hapus kolom" onClick={() => onDeleteColumn(column.id)} className="p-1 rounded hover:bg-white/30 text-red-500">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <SortableContext items={column.cards.map((c) => c.id)} strategy={rectSortingStrategy}>
        <div className="p-4 space-y-3 min-h-[80px]">
          {column.cards.map((card) => (
            <CardItem key={card.id} id={card.id} card={card} onOpen={(c) => onOpenCard(c)} onDelete={(cardId) => onDeleteCard(column.id, cardId)} />
          ))}
        </div>
      </SortableContext>

      <div className="p-4 border-t bg-[#f4f5f7] rounded-b-2xl">
        {adding ? (
          <div className="flex flex-col gap-2">
            <input value={newCardTitle} onChange={(e) => setNewCardTitle(e.target.value)} placeholder="Judul tugas..." className="px-3 py-2 w-full rounded border" />
            <div className="flex gap-2">
              <Button onClick={handleAddCard}>Tambah</Button>
              <Button variant="outline" onClick={() => { setAdding(false); setNewCardTitle(""); }}>Batal</Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <div className="flex-1">
              <Button onClick={() => setAdding(true)} className="w-full bg-white/60 text-slate-800">Add to {column.title}</Button>
            </div>
            <div>
              <Button onClick={() => setAdding(true)} className="w-10 h-10 rounded">+</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
