// components/UniversalModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
  const [dueDate, setDueDate] = useState<string | null>("");

  useEffect(() => {
    if (payload) {
      setTitle(payload.title || "");
      setDescription(payload.description || "");
      setDueDate(payload.dueDate || null);
    }
  }, [payload]);

  const handleSave = () => {
    if (!mode) return;
    const data: any = { ...payload, title, description, dueDate };
    onSave(mode, data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "editCard" && "Edit Card"}
            {mode === "addColumn" && "Tambah Kolom"}
            {mode === "editColumn" && "Edit Kolom"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 my-4">
          {(mode === "addColumn" || mode === "editColumn") && (
            <Input placeholder="Judul kolom..." value={title} onChange={(e) => setTitle(e.target.value)} />
          )}

          {mode === "editCard" && (
            <>
              <Input placeholder="Judul kartu..." value={title} onChange={(e) => setTitle(e.target.value)} />
              <Input placeholder="Deskripsi..." value={description} onChange={(e) => setDescription(e.target.value)} />
              <Input
                type="date"
                value={dueDate || ""}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </>
          )}
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={handleSave}>Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
