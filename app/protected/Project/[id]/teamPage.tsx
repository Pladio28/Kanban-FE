"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

// 🔹 Definisikan tipe data
interface Member {
  id: string;
  name: string;
  role: string;
}

export default function TeamPage() {
  // 🧠 State anggota tim
  const [members, setMembers] = useState<Member[]>([
    { id: "1", name: "Pladio.M", role: "Admin" },
    { id: "2", name: "Abdillah", role: "Member" },
  ]);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{ name: string; role: string }>({
    name: "",
    role: "",
  });
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  // ➕ Tambah anggota baru
  const handleAdd = () => {
    if (!form.name.trim()) return;
    const newMember: Member = {
      id: Date.now().toString(),
      name: form.name,
      role: form.role || "Member",
    };
    setMembers([...members, newMember]);
    setForm({ name: "", role: "" });
    setOpen(false);
  };

  // ✏️ Edit anggota
  const handleEdit = (id: string) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, name: form.name, role: form.role } : m
      )
    );
    setForm({ name: "", role: "" });
    setEditingMember(null);
    setOpen(false);
  };

  // ❌ Hapus anggota
  const handleDelete = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <main className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Anggota Tim</h1>

          {/* Dialog Tambah/Edit */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingMember(null);
                  setForm({ name: "", role: "" });
                }}
              >
                + Add Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingMember ? "Edit Member" : "Tambah Anggota Baru"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Input
                  placeholder="Nama"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <Input
                  placeholder="Role (contoh: Admin, Member)"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                />
              </div>
              <DialogFooter>
                <Button
                  onClick={() =>
                    editingMember ? handleEdit(editingMember.id) : handleAdd()
                  }
                  className="w-full"
                >
                  {editingMember ? "Simpan Perubahan" : "Tambah"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Daftar anggota */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <Card
              key={member.id}
              className="border border-border hover:border-primary/40 transition duration-300 hover:-translate-y-2"
            >
              <CardHeader>
                <CardTitle>{member.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Role: {member.role}</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingMember(member);
                    setForm({ name: member.name, role: member.role });
                    setOpen(true);
                  }}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(member.id)}
                >
                  Hapus
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
