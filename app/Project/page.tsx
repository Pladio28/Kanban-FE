// app/Project/page.tsx
"use client"; // Menandai bahwa halaman ini berjalan di Client-side (butuh state UI, toast, modal, & event handler)

import { useEffect, useState } from "react";
import { useProjectsApi } from "@/lib/api/projects"; // Hook API untuk operasi CRUD project
import { Project } from "@/types/project"; // Interface/tipe data Project
import ProjectCard from "./components/ProjectCard"; // Komponen kartu tampilan per project
import ProjectModal from "./components/ProjectModal"; // Modal form (Buat baru / Edit project)
import { Button } from "@/components/ui/button"; // Komponen tombol dari Shadcn UI
import { toast } from "sonner"; // Library notification toast

export default function DashboardPage() {
  // Extract metode CRUD dari hook API project
  const { getProjects, addProject, updateProject, deleteProject } = useProjectsApi();

  // --- STATES ---
  const [projects, setProjects] = useState<Project[]>([]); // Menyimpan seluruh daftar project dari API
  const [loading, setLoading] = useState(true); // Indikator proses fetching data awal
  const [modalOpen, setModalOpen] = useState(false); // Kontrol buka/tutup modal project
  const [modalPayload, setModalPayload] = useState<Project | null>(null); // Menyimpan data project yang sedang diedit (null jika buat baru)
  const [search, setSearch] = useState(""); // Input keyword pencarian project

  // --- EFFECT: FETCH DAFTAR PROJECT ---
  useEffect(() => {
    async function fetchProjects() {
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
        toast.error("Gagal memuat daftar project");
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  // --- HANDLERS FOR MODAL ---
  // Membuka modal: jika dikirim objek project -> mode Edit, jika tanpa parameter -> mode Create
  const openModal = (project?: Project) => {
    setModalPayload(project ?? null);
    setModalOpen(true);
  };

  // Menutup modal & reset payload
  const closeModal = () => {
    setModalOpen(false);
    setModalPayload(null);
  };

  // --- HANDLER: SAVE PROJECT (CREATE / EDIT) ---
  const handleSave = async (project: Project) => {
    // Cek apakah aksi ini Edit (punya ID & terdaftar di state) atau Create Baru
    const isEdit = !!(project.id && projects.find((p) => p.id === project.id));

    try {
      if (isEdit) {
        // Mode UPDATE: panggil API update lalu perbarui state lokal
        const updated = await updateProject(project.id, {
          name: project.name,
          description: project.description,
          deadline: project.deadline ?? null,
        });
        setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        toast.success("Project berhasil diperbarui");
      } else {
        // Mode CREATE: panggil API add lalu tambahkan ke state lokal
        const added = await addProject({
          name: project.name,
          description: project.description,
          deadline: project.deadline ?? null,
        });
        setProjects((prev) => [...prev, added]);
        toast.success("Project berhasil dibuat");
      }
    } catch (err) {
      console.error("Failed to save project:", err);
      toast.error(isEdit ? "Gagal memperbarui project" : "Gagal membuat project");
    }

    closeModal(); // Tutup modal setelah proses selesai
  };

  // --- HANDLER: DELETE PROJECT ---
  const handleDelete = async (id: string) => {
    try {
      await deleteProject(id);
      // Hapus project dari state lokal secara instan (Optimistic filter)
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast.success("Project berhasil dihapus");
    } catch (err) {
      console.error("Failed to delete project:", err);
      toast.error("Gagal menghapus project");
    }
  };

  // --- FILTERING PROJECT (CLIENT-SIDE SEARCH) ---
  // Menyaring list project berdasarkan kata kunci di Nama atau Deskripsi
  const filteredProjects = projects.filter((project) => {
    const keyword = search.toLowerCase();
    return (
      project.name.toLowerCase().includes(keyword) ||
      project.description.toLowerCase().includes(keyword)
    );
  });

  return (
    <main className="p-8 pt-28 text-white">

      {/* HEADER PAGE: Judul, Input Pencarian, & Tombol "+ New Project" */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <h1 className="text-3xl md:text-4xl font-bold">
          Daftar <span className="text-red-500">Project</span>
        </h1>

        <div className="flex gap-3 w-full md:w-auto">
          {/* Input Search Project */}
          <input
            type="text"
            placeholder="Cari project..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-64 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50"
          />

          {/* Tombol Buka Modal Buat Project Baru */}
          <Button
            onClick={() => openModal()}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl shadow-lg shadow-red-600/30 hover:scale-105 transition whitespace-nowrap"
          >
            + New Project
          </Button>
        </div>
      </div>

      {/* SECTION KONTEN: Grid Tampilan List Project */}
      {loading ? (
        // State Loading awal
        <p className="text-gray-400 animate-pulse">Loading...</p>
      ) : filteredProjects.length === 0 ? (
        // State jika data kosong / tidak ditemukan saat di-search
        <p className="text-gray-400">Project tidak ditemukan.</p>
      ) : (
        // Render Grid Card Project (Responsive 1-3 Kolom)
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={() => openModal(project)}
              onDelete={() => handleDelete(project.id)}
            />
          ))}
        </div>
      )}

      {/* MODAL CREATION / EDITING */}
      {modalOpen && (
        <ProjectModal
          open={modalOpen}
          payload={modalPayload}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}
    </main>
  );
}