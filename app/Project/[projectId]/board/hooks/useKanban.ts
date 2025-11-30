"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

// import API yang udah kita bikin
import { useBoardsApi } from "@/lib/api/boards";
import { useColumnsApi } from "@/lib/api/columns";
import { useCardsApi } from "@/lib/api/cards";

export type CardType = {
  id: string;
  title: string;
  description?: string;
  dueDate?: string | null;
};

export type ColumnType = {
  id: string;
  title: string;
  cards: CardType[];
};

export const useKanban = (projectId: string) => {
  const [columns, setColumns] = useState<ColumnType[]>([]);

  const boardsApi = useBoardsApi();
  const columnsApi = useColumnsApi();
  const cardsApi = useCardsApi();

  // ===== Load columns + cards dari backend =====
  useEffect(() => {
    const fetchKanban = async () => {
      try {
        const fetchedColumns = await columnsApi.getColumns(projectId);

        const mappedColumns: ColumnType[] = fetchedColumns.map((c: any) => ({
          id: c.id,
          title: c.name ?? c.title,
          cards: (c.cards ?? []).map((t: any) => ({
            id: t.id,
            title: t.title,
            description: t.description,
            dueDate: t.due_date ?? null,
          })),
        }));

        setColumns(mappedColumns);
      } catch (err) {
        console.error("Failed to fetch kanban:", err);
      }
    };

    fetchKanban();
  }, [projectId]);

  // ===== Columns =====
  const addColumn = async (title: string) => {
    try {
      const res = await columnsApi.createColumn(projectId, title);
      const newColumn: ColumnType = { id: res?.id ?? uuidv4(), title: res?.name ?? title, cards: [] };
      setColumns((prev) => [...prev, newColumn]);
    } catch (err) {
      console.error(err);
    }
  };

  const renameColumn = async (id: string, title: string) => {
    try {
      await columnsApi.updateColumn(id, title);
      setColumns((prev) => prev.map((c) => (c.id === id ? { ...c, title } : c)));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteColumn = async (id: string) => {
    try {
      await columnsApi.deleteColumn(id);
      setColumns((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // ===== Cards =====
  const addCard = async (columnId: string, title: string) => {
    const newCard: CardType = { id: uuidv4(), title };
    setColumns((prev) =>
      prev.map((c) => (c.id === columnId ? { ...c, cards: [...c.cards, newCard] } : c))
    );

    try {
      const res = await cardsApi.createCard(columnId, title);
      // update card id/title dari backend kalau ada
      setColumns((prev) =>
        prev.map((c) =>
          c.id === columnId
            ? {
                ...c,
                cards: c.cards.map((card) =>
                  card.id === newCard.id
                    ? { ...card, id: res?.id ?? newCard.id, title: res?.title ?? newCard.title }
                    : card
                ),
              }
            : c
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const updateCard = async (cardId: string, data: Partial<CardType>) => {
    const payload: any = { ...data };
    if (data.dueDate !== undefined) {
      payload.due_date = data.dueDate;
      delete payload.dueDate;
    }

    setColumns((prev) =>
      prev.map((c) => ({
        ...c,
        cards: c.cards.map((card) => (card.id === cardId ? { ...card, ...data } : card)),
      }))
    );

    try {
      await cardsApi.updateCard(cardId, payload);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteCard = async (columnId: string, cardId: string) => {
    setColumns((prev) =>
      prev.map((c) => (c.id === columnId ? { ...c, cards: c.cards.filter((t) => t.id !== cardId) } : c))
    );

    try {
      await cardsApi.deleteCard(cardId);
    } catch (err) {
      console.error(err);
    }
  };

  // ===== Move Card =====
  const moveCard = async (cardId: string, destColumnId: string, destIndex: number) => {
    let movingCard: CardType | null = null;

    setColumns((prev) => {
      const newCols = prev.map((c) => {
        if (c.cards.some((t) => t.id === cardId)) {
          movingCard = c.cards.find((t) => t.id === cardId)!;
          return { ...c, cards: c.cards.filter((t) => t.id !== cardId) };
        }
        return c;
      });

      return newCols.map((c) => {
        if (c.id === destColumnId && movingCard) {
          const newCards = [...c.cards];
          newCards.splice(destIndex, 0, movingCard);
          return { ...c, cards: newCards };
        }
        return c;
      });
    });

    try {
      await cardsApi.updateCard(cardId, { columns_id: destColumnId, position: destIndex });
    } catch (err) {
      console.error(err);
    }
  };

  return {
    columns,
    addColumn,
    renameColumn,
    deleteColumn,
    addCard,
    updateCard,
    deleteCard,
    moveCard,
  };
};
