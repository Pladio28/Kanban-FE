// Project/[projectId]/board/page.tsx
"use client";

import Board from "./components/Board";
import { useParams } from "next/navigation";

export default function BoardPage() {
  const { projectId } = useParams();

  // projectId mungkin undefined first render; Board handles undefined safely
  return (
    <main className="min-h-screen">
      <Board projectId={projectId as string | undefined} />
    </main>
  );
}
