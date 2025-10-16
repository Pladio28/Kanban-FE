"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import KanbanPage from "./kanbanPage";
import TeamPage from "./teamPage";

export default function ProjectDetailPage() {
  // 🔹 State tab aktif (kanban atau team)
  const [tab, setTab] = useState<"kanban" | "team">("kanban");

  return (
    <main className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-primary mb-6">Project Detail</h1>

        <Card className="p-6">
          <Tabs value={tab} onValueChange={(v) => setTab(v as "kanban" | "team")}>
            {/* 🔹 Tab Header */}
            <TabsList className="grid grid-cols-2 w-full mb-4">
              <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
            </TabsList>

            {/* 🔸 Tab Konten */}
            <TabsContent value="kanban">
              <KanbanPage />
            </TabsContent>

            <TabsContent value="team">
              <TeamPage />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </main>
  );
}
