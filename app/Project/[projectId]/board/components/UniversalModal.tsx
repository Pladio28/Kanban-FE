"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  open: boolean;
  mode: "editCard" | "addColumn" | "editColumn" | null;
  payload: any;
  onClose: () => void;
  onSave: (mode: string, data: any) => void;
};

export default function UniversalModal({
  open,
  mode,
  payload,
  onClose,
  onSave,
}: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    setTitle(payload?.title ?? "");
    setDescription(payload?.description ?? "");
    setDueDate(payload?.dueDate ?? null);
  }, [open, payload]);

  // ===== VALIDATION =====
  const isTitleValid = title.trim().length > 0;

  const handleSave = () => {
    if (!mode) return;
    if (!isTitleValid) return;

    onSave(mode, {
      ...payload,
      title: title.trim(),
      description,
      dueDate,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && isTitleValid) {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "editCard" && "Edit Card"}
            {mode === "addColumn" && "Tambah Kolom"}
            {mode === "editColumn" && "Edit Kolom"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* TITLE */}
          <div>
            <Input
              autoFocus
              placeholder="Judul"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {!isTitleValid && (
              <p className="text-xs text-red-500 mt-1">
                Judul tidak boleh kosong
              </p>
            )}
          </div>

          {/* CARD EXTRA FIELDS */}
          {mode === "editCard" && (
            <>
              <Textarea
                placeholder="Deskripsi"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <Input
                type="date"
                value={dueDate ?? ""}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </>
          )}

          <Button
            className="w-full"
            onClick={handleSave}
            disabled={!isTitleValid}
          >
            Simpan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
