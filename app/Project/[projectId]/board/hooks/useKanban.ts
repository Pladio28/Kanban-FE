"use client";

import { useState, useEffect, useRef } from "react"; // ← tambah useRef
import { supabase } from "@/lib/supabaseClient"; // ← tambah baris ini
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { useBoardsApi } from "@/lib/api/boards";
import { useColumnsApi } from "@/lib/api/columns";
import { useCardsApi } from "@/lib/api/cards";

export type CardType = {
  id: string;
  title: string;
  description?: string;
  dueDate?: string | null;
  progress?: number;
  fileCount?: number;
  activityCount?: number;
  assignees?: string[]; // clerk_user_id list
};

export type ColumnType = {
  id: string;
  title: string;
  type?: "todo" | "in_progress" | "done" | "other";
  cards: CardType[];
};

export const useKanban = (projectId?: string, isAdmin: boolean = false) => {
  const [columns, setColumns] = useState<ColumnType[]>([]);
  const [boardId, setBoardId] = useState<string | null>(null);

  const boardsApi = useBoardsApi();
  const columnsApi = useColumnsApi();
  const cardsApi = useCardsApi();

  // ⬇️ PINDAH KE SINI (sebelumnya nempel di dalam useEffect di bawah)
  const fetchAll = async () => {
    if (!projectId) return;
    try {
      const boards = await boardsApi.getBoardsByProject(projectId);
      let bId: string | null = boards?.[0]?.id ?? null;

      if (!bId) {
        const created = await boardsApi.createBoard(projectId, "Board");
        bId = created?.id ?? null;
      }

      setBoardId(bId);
      if (!bId) return;

      const fetchedColumns = await columnsApi.getColumns(bId);

      const cardsList = await Promise.all(
        (fetchedColumns ?? []).map((col: any) =>
          cardsApi.getCardsByColumn(col.id).catch(() => [])
        )
      );

      const allCards = (fetchedColumns ?? []).flatMap(
        (_: any, idx: number) => cardsList[idx] ?? []
      );

      const assigneeLists = await Promise.all(
        allCards.map((card: any) =>
          cardsApi.getCardMembers(card.id)
            .then((members: any[]) => members.map((m) => m.clerk_user_id))
            .catch(() => [] as string[])
        )
      );

      let cardOffset = 0;
      const mappedColumns: ColumnType[] = (fetchedColumns ?? []).map(
        (col: any, idx: number) => {
          const cards = (cardsList[idx] ?? []).map((t: any) => {
            const assignees = assigneeLists[cardOffset++] ?? [];
            return {
              id: t.id,
              title: t.title,
              description: t.description,
              dueDate: t.due_date ?? null,
              progress: t.progress ?? 0,
              assignees,
            };
          });
          return { id: col.id, title: col.name ?? col.title, type: col.type ?? "other", cards };
        }
      );

      setColumns(mappedColumns);
    } catch (err) {
      console.error("useKanban fetch error:", err);
    }
  };

  // ⬇️ SEKARANG CUMA MANGGIL fetchAll()
  useEffect(() => {
    if (!projectId) return;
    fetchAll();
  }, [projectId]);

  // Ref buat nyimpen state `columns` terkini, dipakai di dalam handler realtime
  const columnsRef = useRef<ColumnType[]>([]);
  useEffect(() => {
    columnsRef.current = columns;
  }, [columns]);
  
  // Subscribe ke perubahan real-time
  useEffect(() => {
    if (!boardId) return;
  
    const channel = supabase
      .channel(`board-${boardId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "columns", filter: `boards_id=eq.${boardId}` },
        () => fetchAll()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cards" },
        (payload) => {
          const changedColumnId =
            (payload.new as any)?.columns_id ?? (payload.old as any)?.columns_id;
          const belongsToThisBoard = columnsRef.current.some((c) => c.id === changedColumnId);
          if (belongsToThisBoard) fetchAll();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [boardId]);
  
    const adminOnly = <T extends (...args: any[]) => any>(fn: T) => {
      return ((...args: any[]) => {
        if (!isAdmin) { console.warn("Aksi ini hanya untuk admin"); return; }
        return (fn as any)(...args);
      }) as unknown as T;
    };

  // ─── Columns ─────────────────────────────────────────────────

  const _addColumn = async (title: string, type: "todo" | "in_progress" | "done" | "other" = "other") => {
    if (!boardId) return;
    try {
      const res = await columnsApi.createColumn(boardId, title, type);
      setColumns((prev) => [...prev, {
        id: res?.id ?? uuidv4(), title: res?.name ?? title,
        type: res?.type ?? type, cards: [],
      }]);
      toast.success("Kolom berhasil ditambahkan");
    } catch (err) {
      console.error("addColumn error:", err);
      toast.error("Gagal menambahkan kolom");
    }
  };

  const _renameColumn = async (id: string, title: string, type?: "todo" | "in_progress" | "done" | "other") => {
    try {
      await columnsApi.updateColumn(id, title, type);
      setColumns((prev) => prev.map((c) => c.id === id ? { ...c, title, ...(type ? { type } : {}) } : c));
      toast.success("Kolom berhasil diperbarui");
    } catch (err) {
      console.error("renameColumn error:", err);
      toast.error("Gagal memperbarui kolom");
    }
  };

  const _deleteColumn = async (id: string) => {
    try {
      await columnsApi.deleteColumn(id);
      setColumns((prev) => prev.filter((c) => c.id !== id));
      toast.success("Kolom berhasil dihapus");
    } catch (err) {
      console.error("deleteColumn error:", err);
      toast.error("Gagal menghapus kolom");
    }
  };

  // ─── Cards ───────────────────────────────────────────────────

  const _addCard = async (columnId: string, title: string) => {
    const tempCard: CardType = { id: uuidv4(), title, progress: 0, assignees: [] };
    setColumns((prev) => prev.map((c) =>
      c.id === columnId ? { ...c, cards: [...c.cards, tempCard] } : c
    ));
    try {
      const res = await cardsApi.createCard(columnId, title);
      setColumns((prev) => prev.map((c) =>
        c.id === columnId ? {
          ...c, cards: c.cards.map((card) =>
            card.id === tempCard.id ? { ...card, id: res?.id ?? card.id } : card
          ),
        } : c
      ));
      toast.success("Card berhasil ditambahkan");
    } catch (err) {
      console.error("addCard error:", err);
      toast.error("Gagal menambahkan card");
      setColumns((prev) => prev.map((c) =>
        c.id === columnId ? { ...c, cards: c.cards.filter((card) => card.id !== tempCard.id) } : c
      ));
    }
  };

  const _updateCard = async (cardId: string, data: Partial<CardType>) => {
    const payload: any = {};
    if (data.title !== undefined) payload.title = data.title;
    if (data.description !== undefined) payload.description = data.description;
    if (data.dueDate !== undefined) payload.due_date = data.dueDate;
    if (data.progress !== undefined) payload.progress = data.progress;

    setColumns((prev) => prev.map((c) => ({
      ...c, cards: c.cards.map((card) => card.id === cardId ? { ...card, ...data } : card),
    })));
    try {
      await cardsApi.updateCard(cardId, payload);
      toast.success("Card berhasil diperbarui");
    } catch (err) {
      console.error("updateCard error:", err);
      toast.error("Gagal memperbarui card");
    }
  };

  const _deleteCard = async (columnId: string, cardId: string) => {
    setColumns((prev) => prev.map((c) =>
      c.id === columnId ? { ...c, cards: c.cards.filter((t) => t.id !== cardId) } : c
    ));
    try {
      await cardsApi.deleteCard(cardId);
      toast.success("Card berhasil dihapus");
    } catch (err) {
      console.error("deleteCard error:", err);
      toast.error("Gagal menghapus card");
    }
  };

  // ─── Move Card ────────────────────────────────────────────────

  const moveCard = async (cardId: string, destColumnId: string, destIndex: number) => {
    let movingCard: CardType | undefined;
    setColumns((prev) => {
      const next = prev.map((col) => {
        const found = col.cards.find((c) => c.id === cardId);
        if (found) movingCard = found;
        return { ...col, cards: col.cards.filter((c) => c.id !== cardId) };
      });
      if (!movingCard) return prev;
      return next.map((col) => {
        if (col.id === destColumnId) {
          const newCards = [...col.cards];
          newCards.splice(destIndex, 0, movingCard!);
          return { ...col, cards: newCards };
        }
        return col;
      });
    });
    try {
      const destCol = columns.find((c) => c.id === destColumnId);
      const autoProgress = destCol?.type === "done" ? 100 : destCol?.type === "in_progress" ? 50 : 0;
      await cardsApi.updateCard(cardId, { columns_id: destColumnId, progress: autoProgress });
    } catch (err) {
      console.error("moveCard error:", err);
      toast.error("Gagal memindahkan card");
    }
  };

  return {
    columns, boardId,
    addColumn: adminOnly(_addColumn),
    renameColumn: adminOnly(_renameColumn),
    deleteColumn: adminOnly(_deleteColumn),
    addCard: adminOnly(_addCard),
    updateCard: adminOnly(_updateCard),
    deleteCard: adminOnly(_deleteCard),
    moveCard,
  };
};