"use client";
import { useCallback, useEffect, useState } from "react";
import { nanoid } from "nanoid";

export type CardType = {
  id: string;
  title: string;
  description?: string;
  dueDate?: string | null;
  created_at?: string;
};

export type ColumnType = {
  id: string;
  title: string;
  cards: CardType[];
};

const STORAGE_KEY = "kanban_local_v2";

const seed = (): ColumnType[] => [
  {
    id: "col-todo",
    title: "To Do",
    cards: [
      { id: "c-1", title: "Belajar Next.js", description: "Baca dokumentasi App Router", dueDate: null, created_at: new Date().toISOString() },
      { id: "c-2", title: "Setup Tailwind", description: "", dueDate: null, created_at: new Date().toISOString() },
    ],
  },
  {
    id: "col-progress",
    title: "In Progress",
    cards: [{ id: "c-3", title: "Bikin UI Kanban", description: "Implement drag & drop", dueDate: null, created_at: new Date().toISOString() }],
  },
  {
    id: "col-done",
    title: "Done",
    cards: [{ id: "c-4", title: "Setup Project", description: "", dueDate: null, created_at: new Date().toISOString() }],
  },
];

export function useLocalKanban(projectId?: string) {
  const [columns, setColumns] = useState<ColumnType[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY + (projectId ? `_${projectId}` : ""));
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setColumns(parsed);
          return;
        }
      }
      setColumns(seed());
    } catch {
      setColumns(seed());
    }
  }, [projectId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY + (projectId ? `_${projectId}` : ""), JSON.stringify(columns));
    } catch {}
  }, [columns, projectId]);

  const addColumn = useCallback((title: string) => {
    const id = `col-${nanoid()}`;
    setColumns((p) => [...p, { id, title, cards: [] }]);
  }, []);

  const renameColumn = useCallback((colId: string, title: string) => {
    setColumns((p) => p.map((c) => (c.id === colId ? { ...c, title } : c)));
  }, []);

  const deleteColumn = useCallback((colId: string) => {
    setColumns((p) => p.filter((c) => c.id !== colId));
  }, []);

  const addCard = useCallback((colId: string, title: string) => {
    const id = `card-${nanoid()}`;
    const card = { id, title, description: "", dueDate: null, created_at: new Date().toISOString() };
    setColumns((p) => p.map((c) => (c.id === colId ? { ...c, cards: [...c.cards, card] } : c)));
    return id;
  }, []);

  const updateCard = useCallback((cardId: string, data: Partial<CardType>) => {
    setColumns((p) => p.map((c) => ({ ...c, cards: c.cards.map((t) => (t.id === cardId ? { ...t, ...data } : t)) })));
  }, []);

  const deleteCard = useCallback((colId: string, cardId: string) => {
    setColumns((p) => p.map((c) => (c.id === colId ? { ...c, cards: c.cards.filter((t) => t.id !== cardId) } : c)));
  }, []);

  const moveCard = useCallback((cardId: string, toColId: string, toIndex: number) => {
    setColumns((prev) => {
      let moving: CardType | null = null;
      const without = prev.map((c) => {
        const idx = c.cards.findIndex((t) => t.id === cardId);
        if (idx !== -1) {
          moving = c.cards[idx];
          return { ...c, cards: c.cards.filter((t) => t.id !== cardId) };
        }
        return c;
      });

      if (!moving) return prev;

      return without.map((c) => {
        if (c.id === toColId) {
          const nextCards = Array.from(c.cards);
          nextCards.splice(toIndex, 0, moving!);
          return { ...c, cards: nextCards };
        }
        return c;
      });
    });
  }, []);

  return {
    columns,
    setColumns,
    addColumn,
    renameColumn,
    deleteColumn,
    addCard,
    updateCard,
    deleteCard,
    moveCard,
  };
}
