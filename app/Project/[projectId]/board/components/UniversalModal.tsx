// Project/[projectId]/board/components/UniversalModal.tsx
"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ColType = "todo" | "in_progress" | "done" | "other";

const TYPE_OPTIONS: { value: ColType; label: string; desc: string; pill: string }[] = [
  { value: "todo",        label: "To Do",       desc: "Card belum dikerjakan",                    pill: "bg-slate-100 text-slate-600" },
  { value: "in_progress", label: "In Progress", desc: "Card sedang dikerjakan",                   pill: "bg-blue-50 text-blue-700" },
  { value: "done",        label: "Done",        desc: "Card selesai — masuk hitungan % progress", pill: "bg-green-50 text-green-700" },
  { value: "other",       label: "Other",       desc: "Kolom custom (Testing, Review, dll)",      pill: "bg-amber-50 text-amber-700" },
];

type Props = {
  open: boolean;
  mode: "editCard" | "addColumn" | "editColumn" | null;
  payload: any;
  onClose: () => void;
  onSave: (mode: string, data: any) => void;
};

export default function UniversalModal({ open, mode, payload, onClose, onSave }: Props) {
  const [title, setTitle] = useState("");
  const [colType, setColType] = useState<ColType>("other");

  useEffect(() => {
    if (!open) return;
    setTitle(payload?.title ?? "");
    setColType(payload?.type ?? "other");
  }, [open, payload]);

  const isTitleValid = title.trim().length > 0;
  const isColMode = mode === "addColumn" || mode === "editColumn";
  const selected = TYPE_OPTIONS.find((t) => t.value === colType);

  const handleSave = () => {
    if (!mode || !isTitleValid) return;
    onSave(mode, { ...payload, title: title.trim(), ...(isColMode ? { type: colType } : {}) });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "addColumn" && "Tambah Kolom"}
            {mode === "editColumn" && "Edit Kolom"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <label className="text-sm text-slate-500">Nama Kolom</label>
            <Input autoFocus placeholder="Contoh: Testing, Review..." value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && isTitleValid && handleSave()} />
            {!isTitleValid && <p className="text-xs text-red-500">Nama tidak boleh kosong</p>}
          </div>

          {isColMode && (
            <div className="space-y-1.5">
              <label className="text-sm text-slate-500">Type</label>
              <Select value={colType} onValueChange={(v) => setColType(v as ColType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Type" />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${t.pill}`}>
                        {t.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selected && <p className="text-xs text-slate-400">💡 {selected.desc}</p>}
            </div>
          )}

          <Button className="w-full" onClick={handleSave} disabled={!isTitleValid}>Simpan</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}