"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs"; // 🔹 Import untuk cek login
import { useRouter } from "next/navigation"; // 🔹 Router untuk redirect

export default function AboutPage() {
  const { user, isSignedIn } = useUser();
  const router = useRouter();

  const handleClick = () => {
    if (isSignedIn) {
      // ✅ Jika sudah login → arahkan ke halaman Project
      router.push("/protected/Project");
    } else {
      // ❌ Jika belum login → arahkan ke halaman Sign Up
      router.push("/sign-up");
    }
  };

  return (
    // 🧱 <main> = wadah utama halaman, kasih warna dasar & padding umum
    <main className="min-h-screen bg-background text-foreground">

      {/* 🎯 HERO SECTION */}
      {/* background penuh (bg-blue-50), isi tetap di tengah (max-w-3xl mx-auto) */}
      <section className="bg-white py-16 px-6 md:px-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-primary mb-4">
            Tentang Project Kanban
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Kanban adalah aplikasi manajemen tugas berbasis web yang membantu tim bekerja
            lebih efisien dengan sistem papan Kanban yang sederhana, cepat, dan intuitif.
          </p>
          <Button   onClick={handleClick} className="bg-primary text-primary-foreground hover:bg-secondary transition">
            Coba Sekarang
          </Button>
        </div>
      </section>

      {/* 🌱 VISI & MISI */}
      {/* warna berbeda biar ada pembeda antar section */}
      <section className="bg-second py-16 px-6 md:px-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-white mb-6">Visi & Misi</h2>
          <div className="space-y-4">
            <p>
              <strong>Visi:</strong> Menjadi platform produktivitas yang memudahkan kolaborasi tim di mana saja dan kapan saja.
            </p>
            <p><strong>Misi:</strong></p>
            <ul className="list-disc list-inside ml-4">
              <li>Menyediakan alat manajemen tugas yang mudah digunakan.</li>
              <li>Membantu tim mencapai target dengan alur kerja yang jelas.</li>
              <li>Meningkatkan efisiensi tanpa mengorbankan pengalaman pengguna.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ⚙️ FITUR UNGGULAN */}
      {/* gunakan warna abu muda agar tidak monoton */}
      <section className="bg-gray-50 py-16 px-6 md:px-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-semibold text-primary mb-6 text-center">
            Fitur Unggulan
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "Drag & Drop Task",
              "Mode Gelap & Terang",
              "Real-time Update",
              "Tampilan Minimalis & Responsif",
              "Manajemen Proyek Mudah",
            ].map((fitur, i) => (
              <Card
                key={i}
                className="bg-card border border-border shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-lg hover:border-primary/40"
              >
                <CardContent className="p-6 text-center">
                  <p className="font-medium text-foreground">{fitur}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 👥 TIM PENGEMBANG */}
      {/* warna sedikit transparan dari tema utama */}
      <section className="bg-secondary py-16 px-6 md:px-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="bg-second text-2xl font-semibold text-se mb-8 text-center">
            Tim Pengembang
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: "Pladio.M",
                role: "Frontend Developer",
              },
              {
                name: "Abdlillah",
                role: "Backend Engineer",
              },
            ].map((member, i) => (
              <Card
                key={i}
                className="text-center border border-border shadow-sm bg-card hover:border-primary transition duration-300 hover:-translate-y-2"
              >
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white">{member.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{member.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 💻 TEKNOLOGI */}
      {/* warna abu terang biar tetap netral */}
      <section className="bg-slate-50 py-16 px-6 md:px-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-primary mb-6">
            Teknologi yang Digunakan
          </h2>
          <p className="text-muted-foreground">
            <strong>Frontend:</strong> Next.js<br />
            <strong>Backend:</strong> Express.js<br />
            <strong>Database:</strong> Postgree <br />
            <strong>UI Library:</strong> ShadCN/UI
          </p>
        </div>
      </section>

      {/* 🌟 NILAI & CTA */}
      {/* bagian terakhir, background lembut */}
      <section className="bg-blue-100 py-20 px-6 md:px-20 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-lg text-primary mb-8">
            Kami percaya bahwa kerja tim, inovasi, dan transparansi adalah kunci untuk menciptakan
            solusi digital yang bermanfaat bagi semua orang.
          </p>
        </div>
      </section>
    </main>
  );
}
