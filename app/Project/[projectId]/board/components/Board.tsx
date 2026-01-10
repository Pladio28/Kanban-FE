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

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

type Props = { projectId?: string };

export default function Board({ projectId }: Props) {
  /* ================= MEMBERS & ROLE ================= */
  const { members } = useProjectMembers(projectId ?? "");
  const me = members.find((m) => m.isSelf);
  const isAdmin = me?.role === "admin";

  /* ================= KANBAN ================= */
  const {
    columns,
    addColumn,
    addCard,
    updateCard,
    deleteCard,
    renameColumn,
    deleteColumn,
    moveCard,
  } = useKanban(projectId, Boolean(isAdmin));

  /* ================= MODAL ================= */
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] =
    useState<"editCard" | "addColumn" | "editColumn" | null>(null);
  const [modalPayload, setModalPayload] = useState<any>(null);

  /* ================= DELETE CONFIRM ================= */
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "column" | "card";
    columnId?: string;
    cardId?: string;
  } | null>(null);

  /* ================= DND ================= */
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overlayCard, setOverlayCard] = useState<CardType | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const findCardLocation = (id: string) => {
    for (const col of columns) {
      const idx = col.cards.findIndex((c) => c.id === id);
      if (idx !== -1) return { colId: col.id, index: idx };
    }
    return null;
  };

  /* ================= MODAL HANDLER ================= */
  const openModal = (
    mode: "editCard" | "addColumn" | "editColumn",
    payload?: any
  ) => {
    if (!isAdmin && mode !== "editCard") return;
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
    }
    closeModal();
  };

  /* ================= DND EVENTS ================= */
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

  const droppableIds = columns.flatMap((c) => [
    c.id,
    ...c.cards.map((t) => t.id),
  ]);

  /* ================= RENDER ================= */
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="text-primary text-lg font-semibold">
          🚀 My Kanban Board
        </div>
        {isAdmin && (
          <Button
            onClick={() => openModal("addColumn")}
            className="bg-teal-600 hover:bg-teal-700"
          >
            + Kolom Baru
          </Button>
        )}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}
      >
        <div className="flex gap-6 overflow-x-auto pb-8">
          <SortableContext
            items={droppableIds}
            strategy={rectSortingStrategy}
          >
            {columns.map((col) => (
              <div key={col.id} className="min-w-[300px]">
                <Column
                  column={col}
                  isAdmin={Boolean(isAdmin)}
                  onAddCard={(colId, title) => addCard?.(colId, title)}
                  onEditColumnTitle={(colId, title) =>
                    openModal("editColumn", { id: colId, title })
                  }
                  onOpenCard={(card) => openModal("editCard", card)}
                  onDeleteColumn={(colId) =>
                    setDeleteTarget({ type: "column", columnId: colId })
                  }
                  onDeleteCard={(colId, cardId) =>
                    setDeleteTarget({
                      type: "card",
                      columnId: colId,
                      cardId,
                    })
                  }
                />
              </div>
            ))}
          </SortableContext>
        </div>

        <DragOverlay dropAnimation={{ duration: 160 }}>
          {activeId && overlayCard && (
            <div className="w-[300px]">
              <CardItem
                id={overlayCard.id}
                card={overlayCard}
                isOverlay
                onOpen={() => {}}
                onDelete={() => {}}
                isAdmin={Boolean(isAdmin)}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* ================= DELETE CONFIRM ================= */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteTarget?.type === "column"
                ? "Hapus Kolom?"
                : "Hapus Card?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Aksi ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTarget(null)}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (
                  deleteTarget?.type === "column" &&
                  deleteTarget.columnId
                ) {
                  deleteColumn?.(deleteTarget.columnId);
                }

                if (
                  deleteTarget?.type === "card" &&
                  deleteTarget.columnId &&
                  deleteTarget.cardId
                ) {
                  deleteCard?.(
                    deleteTarget.columnId,
                    deleteTarget.cardId
                  );
                }

                setDeleteTarget(null);
              }}
            >
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <UniversalModal
        open={modalOpen}
        mode={modalMode}
        payload={modalPayload}
        onClose={closeModal}
        onSave={handleModalSave}
      />
    </>
  );
}
