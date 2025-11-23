"use client";

import Board from "./components/Board";

type Props = { params: { projectId: string } };

export default function BoardPage({ params }: Props) {
  return (
    <main className="min-h-screen">
      <Board projectId={params.projectId} />
    </main>
  );
}
