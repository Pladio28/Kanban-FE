// Project/[projectId]/board/components/Board.tsx
"use client";

import React, { useState } from "react";
import {
  DndContext, PointerSensor, useSensor, useSensors,
  pointerWithin, DragOverlay,
} from "@dnd-kit/core";
import { LayoutList } from "lucide-react";

import Column from "./Column";
import CardItem from "./CardItem";
import CardDetailModal from "./CardDetailModal";
import UniversalModal from "./UniversalModal";
import ProjectProgressBar from "./ProjectProgressBar";
import BoardActivitySidebar from "./BoardActivitySidebar";
import { useKanban, CardType } from "../hooks/useKanban";
import { Button } from "@/components/ui/button";
import { useProjectMembers } from "../../team/hooks/useProjectMembers";

type Props = { projectId?: string };

export default function Board({ projectId }: Props) {
  const { members } = useProjectMembers(projectId ?? "");
  const me = members.find((m) => m.isSelf);
  const isAdmin = me?.role === "PM";
  const currentUserId = me?.clerk_user_id ?? "";

  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = () => setRefreshKey((k) => k + 1);
  const [showSidebar, setShowSidebar] = useState(true);

  const { columns, addColumn, addCard, updateCard, deleteCard, renameColumn, deleteColumn, moveCard } =
    useKanban(projectId, Boolean(isAdmin));

  const moveCardAndRefresh = async (cardId: string, destColumnId: string, destIndex: number) => {
    await moveCard(cardId, destColumnId, destIndex);
    triggerRefresh();
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"editCard" | "addColumn" | "editColumn" | null>(null);
  const [modalPayload, setModalPayload] = useState<any>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overlayCard, setOverlayCard] = useState<CardType | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const findCardLocation = (id: string) => {
    for (const col of columns) {
      const idx = col.cards.findIndex((c) => c.id === id);
      if (idx !== -1) return { colId: col.id, index: idx };
    }
    return null;
  };

  const openModal = (mode: any, payload?: any) => {
    if (!isAdmin && mode !== "editCard") return;
    setModalMode(mode);
    setModalPayload(payload ?? null);
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setModalMode(null); setModalPayload(null); };

  const handleModalSave = (mode: string, data: any) => {
    if (mode === "editCard") { updateCard?.(data.id, data); triggerRefresh(); }
    else if (mode === "addColumn") addColumn?.(data.title, data.type);
    else if (mode === "editColumn") renameColumn?.(data.id, data.title, data.type);
    closeModal();
  };

  const onDragStart = (event: any) => {
    const id = event.active.id;
    setActiveId(id);
    const loc = findCardLocation(id);
    if (loc) {
      const card = columns.find((c) => c.id === loc.colId)!.cards[loc.index];
      setOverlayCard(card);
    }
  };

  const onDragEnd = async (event: any) => {
    const { active, over } = event;
    setActiveId(null); setOverlayCard(null);
    if (!over) return;
    const aId = active.id; const oId = over.id;
    const destCol = columns.find((c) => c.id === oId);
    if (destCol) { await moveCardAndRefresh(aId, destCol.id, destCol.cards.length); return; }
    const destLoc = findCardLocation(oId);
    if (destLoc) await moveCardAndRefresh(aId, destLoc.colId, destLoc.index);
  };

  const totalCards = columns.reduce((a, c) => a + c.cards.length, 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">🚀 Kanban Board</h1>
          <p className="text-xs text-slate-500 mt-0.5">{columns.length} kolom · {totalCards} task</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowSidebar((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
              showSidebar ? "bg-white/10 border-white/20 text-white" : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20"
            }`}>
            <LayoutList className="w-3.5 h-3.5" /> Aktivitas
          </button>
          {isAdmin && (
            <Button onClick={() => openModal("addColumn")}
              className="bg-red-600 hover:bg-red-700 text-white text-sm shadow-lg shadow-red-600/20">
              + Kolom Baru
            </Button>
          )}
        </div>
      </div>

      <ProjectProgressBar projectId={projectId ?? ""} refreshKey={refreshKey} />

      <div className="flex gap-4 items-start">
        <div className="flex-1 min-w-0 overflow-x-auto pb-2 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.1)_transparent]">
          <DndContext sensors={sensors} collisionDetection={pointerWithin} onDragStart={onDragStart} onDragEnd={onDragEnd}>
            <div className="flex gap-4 w-max">
              {columns.map((col) => (
                <div key={col.id} className="w-[270px] flex-shrink-0">
                  <Column
                    column={col}
                    isAdmin={isAdmin}
                    currentUserId={currentUserId}
                    members={members}
                    onAddCard={(colId, title) => addCard?.(colId, title)}
                    onDeleteColumn={(colId) => deleteColumn?.(colId)}
                    onEditColumnTitle={(id, title) => openModal("editColumn", { id, title })}
                    onOpenCard={(card) => openModal("editCard", card)}
                    onDeleteCard={(colId, cardId) => deleteCard?.(colId, cardId)}
                  />
                </div>
              ))}
            </div>

            <DragOverlay dropAnimation={{ duration: 150 }}>
              {activeId && overlayCard && (
                <div className="w-[270px] rotate-1 scale-105 opacity-90">
                  <CardItem id={overlayCard.id} card={overlayCard} members={members} isOverlay onOpen={() => {}} onDelete={() => {}} />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        </div>

        {showSidebar && (
          <div className="w-[260px] flex-shrink-0 sticky top-4">
            <BoardActivitySidebar projectId={projectId ?? ""} onClose={() => setShowSidebar(false)} />
          </div>
        )}
      </div>

      <CardDetailModal
        open={modalOpen && modalMode === "editCard"}
        payload={modalPayload} projectId={projectId ?? ""}
        onClose={closeModal} onSave={handleModalSave} isAdmin={isAdmin}
      />
      <UniversalModal
        open={modalOpen && modalMode !== "editCard"}
        mode={modalMode} payload={modalPayload}
        onClose={closeModal} onSave={handleModalSave}
      />
    </div>
  );
}