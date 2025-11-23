export interface Card {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  created_at?: string;
}

export interface Column {
  id: string;
  name: string;
  created_at?: string;
  cards: Card[];
}

export interface Board {
  id: string;
  name: string;
  created_at?: string;
  columns: Column[];
}
