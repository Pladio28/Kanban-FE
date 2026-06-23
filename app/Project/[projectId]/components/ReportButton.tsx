// app/Project/[projectId]/components/ReportButton.tsx
"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReportModal from "./ReportModal";
import { Member } from "../team/hooks/useProjectMembers";

interface Props {
  projectId: string;
  members: Member[]; // dari layout untuk resolve nama di modal
}

export default function ReportButton({ projectId, members }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        size="sm"
        className="border-white/20 text-white hover:bg-white/10 gap-2"
      >
        <FileDown className="w-4 h-4" />
        Laporan
      </Button>

      {/* Modal preview laporan + tombol download PDF */}
      <ReportModal
        open={open}
        onClose={() => setOpen(false)}
        projectId={projectId}
        members={members}
      />
    </>
  );
}