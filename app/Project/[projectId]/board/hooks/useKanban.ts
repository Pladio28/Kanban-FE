// Project/[projectId]/board/hooks/useKanban.ts
"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
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

export const useKanban = (projectId?: string) => {
  const [columns, setColumns] = useState<ColumnType[]>([]);
  const [boardId, setBoardId] = useState<string | null>(null);

  const boardsApi = useBoardsApi();
  const columnsApi = useColumnsApi();
  const cardsApi = useCardsApi();

  // load board (by project) -> then load columns for that board
  useEffect(() => {
    if (!projectId) return;
  
    let mounted = true;
  
    const fetchAll = async () => {
      try {
        // 1) get boards
        const boards = await boardsApi.getBoardsByProject(projectId);
        let bId: string | null = boards?.[0]?.id ?? null;
      
        if (!bId) {
          const created = await boardsApi.createBoard(projectId, "Board");
          bId = created?.id ?? null;
        }
      
        if (!mounted) return;
        setBoardId(bId);
        if (!bId) return;
      
        // 2) get columns
        const fetchedColumns = await columnsApi.getColumns(bId);
      
        // 3) fetch cards for each column (INI BAGIAN YG HILANG DARI KODE LU)
        const cardsList = await Promise.all(
          fetchedColumns.map((col: any) => cardsApi.getCardsByColumn(col.id))
        );
      
        // 4) mapping final
        const mappedColumns: ColumnType[] = fetchedColumns.map(
          (col: any, index: number) => ({
            id: col.id,
            title: col.name ?? col.title,
            cards: cardsList[index].map((t: any) => ({
              id: t.id,
              title: t.title,
              description: t.description,
              dueDate: t.due_date ?? null,
            })),
          })
        );
      
        if (!mounted) return;
        setColumns(mappedColumns);
      } catch (err) {
        console.error("useKanban fetch error:", err);
      }
    };
  
    fetchAll();
  
    return () => {
      mounted = false;
    };
  }, [projectId]);
  
  // CREATE column -> POST /api/columns { boards_id, name }
  const addColumn = async (title: string) => {
    if (!boardId) {
      console.warn("No boardId yet when creating column");
      return;
    }
    try {
      const res = await columnsApi.createColumn(boardId, title);
      const newColumn: ColumnType = {
        id: res?.id ?? uuidv4(),
        title: res?.name ?? title,
        cards: [],
      };
      setColumns((prev) => [...prev, newColumn]);
    } catch (err) {
      console.error("addColumn error:", err);
    }
  };

  // RENAME column -> PUT /api/columns/:id
  const renameColumn = async (id: string, title: string) => {
    try {
      await columnsApi.updateColumn(id, title);
      setColumns((prev) => prev.map((c) => (c.id === id ? { ...c, title } : c)));
    } catch (err) {
      console.error("renameColumn error:", err);
    }
  };

  // DELETE column
  const deleteColumn = async (id: string) => {
    try {
      await columnsApi.deleteColumn(id);
      setColumns((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("deleteColumn error:", err);
    }
  };

  // ADD card -> POST /api/cards { columns_id, title, description?, due_date? }
  const addCard = async (columnId: string, title: string) => {
    const newCard: CardType = { id: uuidv4(), title };
    setColumns((prev) => prev.map((c) => (c.id === columnId ? { ...c, cards: [...c.cards, newCard] } : c)));
    try {
      const res = await cardsApi.createCard(columnId, title);
      // update card id/title if backend returns real id
      setColumns((prev) =>
        prev.map((c) =>
          c.id === columnId
            ? {
                ...c,
                cards: c.cards.map((card) =>
                  card.id === newCard.id ? { ...card, id: res?.id ?? newCard.id, title: res?.title ?? newCard.title } : card
                ),
              }
            : c
        )
      );
    } catch (err) {
      console.error("addCard error:", err);
    }
  };

  // update card (including moving columns by changing columns_id)
  const updateCard = async (cardId: string, data: Partial<CardType>) => {
    const payload: any = { ...data };
    if (data.dueDate !== undefined) {
      payload.due_date = data.dueDate;
      delete payload.dueDate;
    }

    // optimistic UI
    setColumns((prev) =>
      prev.map((c) => ({ ...c, cards: c.cards.map((card) => (card.id === cardId ? { ...card, ...data } : card)) }))
    );

    try {
      await cardsApi.updateCard(cardId, payload);
    } catch (err) {
      console.error("updateCard error:", err);
    }
  };

  const deleteCard = async (columnId: string, cardId: string) => {
    setColumns((prev) => prev.map((c) => (c.id === columnId ? { ...c, cards: c.cards.filter((t) => t.id !== cardId) } : c)));
    try {
      await cardsApi.deleteCard(cardId);
    } catch (err) {
      console.error("deleteCard error:", err);
    }
  };

  // move card: update local state and call PUT /api/cards/:id { columns_id, position }
  const moveCard = async (cardId: string, destColumnId: string, destIndex: number) => {
    let movingCard: CardType | null = null;

    setColumns((prev) => {
      const removed = prev.map((c) => {
        if (c.cards.some((t) => t.id === cardId)) {
          movingCard = c.cards.find((t) => t.id === cardId)!;
          return { ...c, cards: c.cards.filter((t) => t.id !== cardId) };
        }
        return c;
      });

      return removed.map((c) => {
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
      console.error("moveCard error:", err);
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
    boardId,
  };
};
