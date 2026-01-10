"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function AboutPage() {
  const { user, isSignedIn } = useUser();
  const router = useRouter();

  const handleClick = () => {
    if (isSignedIn) {
      router.push("/protected/Project");
    } else {
      router.push("/sign-up");
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* 🎯 HERO */}
      <section className="bg-white py-20 px-6 md:px-20 border-b">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Tentang <span className="text-blue-600">Project Kanban</span>
          </h1>

          <p className="text-lg text-gray-600 leading-relaxed mb-8">
            Project Kanban adalah aplikasi manajemen tugas modern yang dirancang 
            untuk meningkatkan produktivitas dan kolaborasi tim Anda.
            Cepat, intuitif, dan sepenuhnya fleksibel.
          </p>

        <Link href="/sign-up">
          <Button
            onClick={handleClick}
            className="bg-blue-600 px-8 py-6 text-lg text-white hover:bg-blue-700 rounded-xl shadow"
          >
            Coba Sekarang
          </Button>
          </Link>
        </div>
      </section>

      {/* 🌱 VISI MISI */}
      <section className="bg-slate-50 py-20 px-6 md:px-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-semibold text-gray-900 mb-8 text-center">
            Visi & Misi
          </h2>

          <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
            <p className="text-lg text-gray-700 mb-4">
              <strong>Visi:</strong> Menjadi platform produktivitas modern yang mempercepat
              kolaborasi lintas tim dan organisasi.
            </p>

            <p className="text-lg text-gray-700 mb-3">
              <strong>Misi:</strong>
            </p>

            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-3">
              <li>Menyediakan alat manajemen tugas yang mudah dipahami.</li>
              <li>Membantu tim bekerja lebih cepat dan terorganisir.</li>
              <li>Membuat pengalaman pengguna yang sederhana namun powerful.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ⚙️ FITUR */}
      <section className="bg-white py-20 px-6 md:px-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-semibold text-gray-900 text-center mb-12">
            Fitur Unggulan
          </h2>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "Drag & Drop Task",
              "Mode Gelap & Terang",
              "Real-time Sync",
              "Tampilan Minimalis",
              "Custom Workflow",
              "Collaborative Planning",
            ].map((fitur, i) => (
              <Card
                key={i}
                className="border border-slate-200 bg-white rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-2 transition duration-300"
              >
                <CardContent className="p-6 text-center">
                  <p className="font-medium text-gray-800 text-lg">{fitur}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 👥 TIM */}
      <section className="bg-slate-100 py-20 px-6 md:px-20">
        <div className="max-w-5xl mx-auto">

          <h2 className="text-3xl font-semibold text-gray-900 text-center mb-12">
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
                className="border border-slate-200 bg-white rounded-xl text-center shadow-sm hover:shadow-xl hover:-translate-y-2 transition duration-300"
              >
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-gray-500">{member.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 💻 TEKNOLOGI */}
      <section className="bg-slate-50 py-20 px-6 md:px-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-semibold text-gray-900 mb-6">
            Teknologi yang Digunakan
          </h2>

          <p className="text-gray-600 text-lg leading-relaxed">
            <strong>Frontend:</strong> Next.js <br />
            <strong>Backend:</strong> Express.js <br />
            <strong>Database:</strong> PostgreSQL <br />
            <strong>UI Library:</strong> ShadCN/UI
          </p>
        </div>
      </section>

      {/* 🌟 CTA AKHIR */}
      <section className="bg-blue-50 py-20 px-6 md:px-20 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-xl text-gray-700 leading-relaxed mb-8">
            Kami percaya pada kesederhanaan, kolaborasi, dan kualitas.
            Bergabunglah dan jadikan pekerjaan tim Anda lebih produktif.
          </p>

          <Button
            onClick={handleClick}
            className="bg-blue-600 px-10 py-6 text-lg text-white hover:bg-blue-700 rounded-xl shadow"
          >
            Mulai Sekarang
          </Button>
        </div>
      </section>
    </main>
  );
}
