// Project/[projectId]/board/components/Board.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  DragCancelEvent,
} from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";

import Column from "./Column";
import CardItem from "./CardItem";
import UniversalModal from "./UniversalModal";
import { useKanban, CardType } from "../hooks/useKanban";
import { Button } from "@/components/ui/button";
import { useProjectMembers } from "../../team/hooks/useProjectMembers";

type Props = { projectId?: string };

export default function Board({ projectId }: Props) {
  // get members to determine if current user is admin
  const { members } = useProjectMembers(projectId ?? "");
  const me = members.find((m) => m.isSelf);
  const isAdmin = me?.role === "admin";

  // pass isAdmin into useKanban so admin-only actions are protected
  const { columns, addColumn, addCard, updateCard, deleteCard, renameColumn, deleteColumn, moveCard } =
    useKanban(projectId, Boolean(isAdmin));

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"editCard" | "addColumn" | "editColumn" | null>(null);
  const [modalPayload, setModalPayload] = useState<any>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overlayCard, setOverlayCard] = useState<CardType | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const findCardLocation = (id: string) => {
    for (let ci = 0; ci < columns.length; ci++) {
      const col = columns[ci];
      const idx = col.cards.findIndex((c) => c.id === id);
      if (idx !== -1) return { colId: col.id, index: idx };
    }
    return null;
  };

  // open modal; restrict non-admin from opening column actions / adding
  const openModal = (mode: "editCard" | "addColumn" | "editColumn", payload?: any) => {
    if (!isAdmin && mode !== "editCard") return; // members only allowed editCard modal
    setModalMode(mode);
    setModalPayload(payload ?? null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalMode(null);
    setModalPayload(null);
  };

  const handleModalSave = (mode: string, data: any) => {
    // actions already no-op'd in useKanban for non-admin, but double-check here
    if (mode === "editCard") {
      updateCard?.(data.id, {
        title: data.title,
        description: data.description,
        dueDate: data.dueDate || null,
      });
    } else if (mode === "addColumn") {
      addColumn?.(data.title);
    } else if (mode === "editColumn") {
      renameColumn?.(data.id, data.title);
    } else if (mode === "deleteCard") {
      const col = columns.find((c) => c.cards.some((t) => t.id === data.id));
      if (col) deleteCard?.(col.id, data.id);
    }
    closeModal();
  };

  const onDragStart = (event: DragStartEvent) => {
    const id = event.active.id as string;
    setActiveId(id);
    const loc = findCardLocation(id);
    if (loc) {
      const col = columns.find((c) => c.id === loc.colId)!;
      setOverlayCard(col.cards[loc.index]);
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverlayCard(null);
    if (!over) return;

    const activeIdStr = active.id as string;
    const overIdStr = over.id as string;

    const destColumn = columns.find((c) => c.id === overIdStr);
    if (destColumn) {
      moveCard(activeIdStr, destColumn.id, destColumn.cards.length);
      return;
    }

    const destLoc = findCardLocation(overIdStr);
    if (!destLoc) return;
    moveCard(activeIdStr, destLoc.colId, destLoc.index);
  };

  const onDragCancel = (_: DragCancelEvent) => {
    setActiveId(null);
    setOverlayCard(null);
  };

  if (!isMounted) return null;

  const droppableIds = columns.flatMap((c) => [c.id, ...c.cards.map((t) => t.id)]);

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-white text-lg font-semibold">🚀 My Kanban Board</div>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Button onClick={() => openModal("addColumn")} className="bg-teal-600 hover:bg-teal-700">
              + Kolom Baru
            </Button>
          )}
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={onDragCancel}>
        <div className="flex gap-6 overflow-x-auto pb-8">
          <SortableContext items={droppableIds} strategy={rectSortingStrategy}>
            {columns.map((col) => (
              <div key={col.id} className="min-w-[300px]">
                <Column
                  column={col}
                  isAdmin={Boolean(isAdmin)}
                  onAddCard={(colId, title) => addCard?.(colId, title)}
                  onDeleteColumn={(colId) => deleteColumn?.(colId)}
                  onEditColumnTitle={(colId, title) => openModal("editColumn", { id: colId, title })}
                  onOpenCard={(card) => openModal("editCard", card)}
                  onDeleteCard={(colId, cardId) => deleteCard?.(colId, cardId)}
                />
              </div>
            ))}
          </SortableContext>
        </div>

        <DragOverlay dropAnimation={{ duration: 160 }}>
          {activeId && overlayCard && (
            <div className="w-[300px]">
              <CardItem id={overlayCard.id} card={overlayCard} isOverlay onOpen={() => {}} onDelete={() => {}} isAdmin={Boolean(isAdmin)} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <UniversalModal open={modalOpen} mode={modalMode} payload={modalPayload} onClose={closeModal} onSave={handleModalSave} />
    </>
  );
}
