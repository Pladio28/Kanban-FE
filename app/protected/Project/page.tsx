"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// 🧩 Definisikan tipe project
interface Project {
  id: string;
  name: string;
  desc: string;
}

export default function ProjectListPage() {
  const [projects, setProjects] = useState<Project[]>([
    { id: "1", name: "Website Perusahaan", desc: "Membuat website profil perusahaan." },
    { id: "2", name: "Aplikasi Kanban Tim", desc: "Manajemen tugas dengan sistem Kanban." },
  ]);

  const [open, setOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [form, setForm] = useState({ name: "", desc: "" });

  const handleAdd = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: form.name,
      desc: form.desc,
    };
    setProjects([...projects, newProject]);
    setForm({ name: "", desc: "" });
    setOpen(false);
  };

  const handleEdit = (id: string) => {
    const updated = projects.map((p) =>
      p.id === id ? { ...p, name: form.name, desc: form.desc } : p
    );
    setProjects(updated);
    setForm({ name: "", desc: "" });
    setEditingProject(null);
    setOpen(false);
  };

  const handleDelete = (id: string) => {
    setProjects(projects.filter((p) => p.id !== id));
  };

  return (
    <main className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-5xl mx-auto">
        {/* 🔹 Header + tombol tambah */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-primary">Daftar Project</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingProject(null)}>+ New Project</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingProject ? "Edit Project" : "Tambah Project Baru"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Input
                  placeholder="Nama Project"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <Textarea
                  placeholder="Deskripsi Project"
                  value={form.desc}
                  onChange={(e) => setForm({ ...form, desc: e.target.value })}
                />
              </div>
              <DialogFooter>
                <Button
                  onClick={
                    editingProject
                      ? () => handleEdit(editingProject.id)
                      : handleAdd
                  }
                  className="w-full"
                >
                  {editingProject ? "Simpan Perubahan" : "Tambah"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* GRID LIST PROJECT */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="border border-border hover:border-primary/40 transition duration-300 hover:-translate-y-2"
            >
              <CardHeader>
                <CardTitle>{project.name}</CardTitle>
                <CardDescription>{project.desc}</CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-between">
                <Link href={`/protected/Project/${project.id}`}>
                  <Button variant="secondary">Lihat</Button>
                </Link>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingProject(project);
                      setForm({ name: project.name, desc: project.desc });
                      setOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(project.id)}
                  >
                    Hapus
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
