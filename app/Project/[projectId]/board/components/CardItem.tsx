// Project/[projectId]/board/components/CardItem.tsx
"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2 } from "lucide-react";
import { CardType } from "../hooks/useKanban";

type Props = {
  id: string;
  card: CardType;
  isAdmin?: boolean;
  onOpen: (card: CardType) => void;
  onDelete: (cardId: string) => void;
  isOverlay?: boolean;
};

export default function CardItem({ id, card, onOpen, onDelete, isAdmin = false, isOverlay }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: transform ? CSS.Transform.toString(transform) : "none",
    transition: transition || "none",
    zIndex: isDragging || isOverlay ? 9999 : 0,
    boxShadow: isDragging || isOverlay ? "0 12px 30px rgba(2,6,23,0.12)" : "none",
    cursor: "grab",
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className="bg-white p-3 rounded-md shadow-sm border flex items-start justify-between hover:shadow"
      {...attributes}
      {...listeners}
      role="button"
      aria-label={card.title}
    >
      <div className="flex-1 pr-3" onClick={() => onOpen(card)}>
        <div className="font-medium text-slate-800">{card.title}</div>
        {card.description && <div className="text-sm text-slate-500 mt-1 line-clamp-2">{card.description}</div>}
        {card.dueDate && <div className="text-xs text-slate-400 mt-2">Due: {card.dueDate}</div>}
      </div>

      {isAdmin ? (
        <button onClick={() => onDelete(card.id)} className="text-red-500 p-1 hover:bg-red-50 rounded">
          <Trash2 className="w-4 h-4" />
        </button>
      ) : null}
    </article>
  );
}
