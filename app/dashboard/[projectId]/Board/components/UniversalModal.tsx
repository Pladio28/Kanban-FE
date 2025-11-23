"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  mode: "editCard" | "addColumn" | "editColumn" | null;
  payload: any;
  onClose: () => void;
  onSave: (mode: string, data: any) => void;
};

export default function UniversalModal({ open, mode, payload, onClose, onSave }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (!open) return;
    setTitle(payload?.title ?? "");
    setDescription(payload?.description ?? "");
    setDueDate(payload?.dueDate ?? payload?.due_date ?? "");
  }, [open, payload, mode]);

  const handleSave = () => {
    if (mode === "editCard") {
      onSave("editCard", { id: payload?.id, title: title.trim(), description: description.trim(), dueDate: dueDate || null });
      return;
    }
    if (mode === "addColumn") {
      onSave("addColumn", { title: title.trim() });
      return;
    }
    if (mode === "editColumn") {
      onSave("editColumn", { id: payload?.id, title: title.trim() });
      return;
    }
  };

  const handleDelete = () => {
    // signal delete via onSave with special mode
    onSave("deleteCard", { id: payload?.id, columns_id: payload?.columns_id });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "editCard" && "Edit Kartu"}
            {mode === "addColumn" && "Buat Kolom Baru"}
            {mode === "editColumn" && "Edit Kolom"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <label className="text-sm block mb-1">Judul</label>
            <Input value={title} onChange={(e) => setTitle((e.target as HTMLInputElement).value)} />
          </div>

          {mode === "editCard" && (
            <>
              <div>
                <label className="text-sm block mb-1">Deskripsi</label>
                <Textarea value={description} onChange={(e) => setDescription((e.target as HTMLTextAreaElement).value)} />
              </div>

              <div>
                <label className="text-sm block mb-1">Due date</label>
                <Input type="date" value={dueDate || ""} onChange={(e) => setDueDate((e.target as HTMLInputElement).value)} />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <div className="flex w-full items-center justify-between gap-2">
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>Batal</Button>
              <Button onClick={handleSave}>Simpan</Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
