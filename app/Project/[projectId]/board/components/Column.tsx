"use client";

import React, { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import CardItem from "./CardItem";
import { Pencil, Trash2, Clock3, CheckCircle2 } from "lucide-react";
import { ColumnType, CardType } from "../hooks/useKanban";
import { Button } from "@/components/ui/button";

type Props = {
  column: ColumnType;
  isAdmin?: boolean;
  onAddCard: (columnId: string, title: string) => void;
  onDeleteColumn: (id: string) => void;
  onEditColumnTitle: (id: string, title: string) => void;
  onOpenCard: (card: CardType) => void;
  onDeleteCard: (columnId: string, cardId: string) => void;
};

export default function Column({
  column,
  isAdmin = false,
  onAddCard,
  onDeleteColumn,
  onEditColumnTitle,
  onOpenCard,
  onDeleteCard,
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

  // STYLE LOGIC BERDASARKAN NAMA COLUMN
  const getHeaderStyle = () => {
    const title = column.title.toLowerCase();

    if (title.includes("to do") || title === "todo") {
      return {
        color: "#6b7280", // gray-500
        icon: null,
      };
    }

    if (title.includes("in progress")) {
      return {
        color: "#2563eb", // blue-600
        icon: <Clock3 className="w-4 h-4 text-blue-600" />,
      };
    }

    if (title.includes("done")) {
      return {
        color: "#059669", // green-600
        icon: <CheckCircle2 className="w-4 h-4 text-green-600" />,
      };
    }

    // default
    return {
      color: "#475569", // slate-600
      icon: null,
    };
  };

  const header = getHeaderStyle();

  return (
    <div
      ref={setNodeRef}
      className="w-[300px] bg-white rounded-2xl shadow-md border border-slate-200 flex flex-col overflow-hidden hover:shadow-lg transition-all duration-200"
    >
      {/* Header baru, clean + icon */}
      <div className="px-4 py-3 flex items-center justify-between bg-white border-b">
        <div className="flex items-center gap-2">
          {header.icon}
          <h3
            className="text-sm font-semibold tracking-wide"
            style={{ color: header.color }}
          >
            {column.title}
          </h3>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <button
              title="Edit judul"
              onClick={() => onEditColumnTitle(column.id, column.title)}
              className="p-1 rounded hover:bg-slate-100 transition"
            >
              <Pencil className="w-4 h-4 text-slate-500" />
            </button>
            <button
              title="Hapus kolom"
              onClick={() => onDeleteColumn(column.id)}
              className="p-1 rounded hover:bg-slate-100 transition"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>
        )}
      </div>

      {/* Cards */}
      <SortableContext items={column.cards.map((c) => c.id)} strategy={rectSortingStrategy}>
        <div className="p-4 space-y-3 min-h-[80px] bg-slate-50">
          {column.cards.map((card) => (
            <CardItem
              key={card.id}
              id={card.id}
              card={card}
              isAdmin={isAdmin}
              onOpen={onOpenCard}
              onDelete={(cardId) => onDeleteCard(column.id, cardId)}
            />
          ))}
        </div>
      </SortableContext>

      {/* Add Card */}
      {isAdmin && (
        <div className="p-4 border-t bg-white">
          {adding ? (
            <div className="flex flex-col gap-2">
              <input
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                placeholder="Judul tugas..."
                className="px-3 py-2 w-full rounded border focus:ring-2 focus:ring-blue-300"
              />
              <div className="flex gap-2">
                <Button onClick={handleAddCard} className="w-full">
                  Tambah
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setAdding(false);
                    setNewCardTitle("");
                  }}
                  className="w-full"
                >
                  Batal
                </Button>
              </div>
            </div>
          ) : (
            <Button
              onClick={() => setAdding(true)}
              className="w-full bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              + Add Task
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
