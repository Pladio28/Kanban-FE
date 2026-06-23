// app/Project/components/ProjectModal.tsx
"use client";

import { useState, useEffect } from "react";
import { Project } from "@/types/project";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

type Props = {
  open: boolean;
  payload: Project | null;
  onClose: () => void;
  onSave: (project: Project) => void;
};

export default function ProjectModal({ open, payload, onClose, onSave }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState(""); // format YYYY-MM-DD

  useEffect(() => {
    if (!open) return;
    setName(payload?.name ?? "");
    setDescription(payload?.description ?? "");
    setDeadline(payload?.deadline ?? "");
  }, [open, payload]);

  const handleSave = () => {
    const project: Project = {
      id: payload?.id ?? crypto.randomUUID(),
      name,
      description,
      createdAt: payload?.createdAt ?? new Date().toISOString(),
      deadline: deadline || null, // 🔥 kirim deadline ke BE
    };
    onSave(project);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-black/80 backdrop-blur-xl border border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">
            {payload ? "Edit Project" : "Tambah Project"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Nama */}
          <div>
            <label className="text-sm text-gray-300 block mb-1">Nama Project</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              placeholder="Masukkan nama project..."
            />
          </div>

          {/* Deskripsi */}
          <div>
            <label className="text-sm text-gray-300 block mb-1">Deskripsi</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              placeholder="Deskripsi project..."
            />
          </div>

          {/* 🔥 Deadline */}
          <div>
            <label className="text-sm text-gray-300 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Deadline <span className="text-gray-500">(opsional)</span>
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-red-500/50"
            />
            {deadline && (
              <button
                onClick={() => setDeadline("")}
                className="text-xs text-gray-500 hover:text-red-400 mt-1 transition"
              >
                Hapus deadline
              </button>
            )}
          </div>
        </div>

        <DialogFooter>
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Batal
            </Button>
            <Button
              onClick={handleSave}
              disabled={!name.trim()}
              className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30"
            >
              Simpan
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}