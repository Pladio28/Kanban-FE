"use client";

import { useState, useEffect } from "react";
import { Project } from "@/types/project";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  payload: Project | null;
  onClose: () => void;
  onSave: (project: Project) => void;
};

export default function ProjectModal({ open, payload, onClose, onSave }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(payload?.name ?? "");
    setDescription(payload?.description ?? "");
  }, [open, payload]);

  const handleSave = () => {
    const project: Project = {
      id: payload?.id ?? crypto.randomUUID(),
      name,
      description,
      createdAt: payload?.createdAt ?? new Date().toISOString(),
    };
    onSave(project);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{payload ? "Edit Project" : "Tambah Project"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <label className="text-sm block mb-1">Nama Project</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-sm block mb-1">Deskripsi</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Batal</Button>
            <Button onClick={handleSave}>Simpan</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}