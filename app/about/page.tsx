"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function AboutPage() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  const handleClick = () => {
    if (isSignedIn) {
      router.push("/protected/Project");
    } else {
      router.push("/sign-in/sign-up");
    }
  };

  return (
    <main className="min-h-screen text-white pt-24">

      {/* HERO */}
      <section className="py-24 px-6 md:px-20 text-center">
        <div className="max-w-3xl mx-auto">

          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Tentang <span className="text-red-500">Project Kanban</span>
          </h1>

          <p className="text-lg text-gray-300 leading-relaxed mb-10">
            Project Kanban adalah aplikasi manajemen tugas modern yang dirancang 
            untuk meningkatkan produktivitas dan kolaborasi tim Anda.
            Cepat, intuitif, dan sepenuhnya fleksibel.
          </p>

          <Button
            onClick={handleClick}
            className="bg-red-600 px-8 py-6 text-lg text-white hover:bg-red-700 rounded-xl shadow-lg shadow-red-600/30 hover:scale-105 transition"
          >
            Coba Sekarang
          </Button>

        </div>
      </section>

      {/* VISI MISI */}
      <section className="py-24 px-6 md:px-20">
        <div className="max-w-4xl mx-auto">

          <h2 className="text-3xl font-semibold text-center mb-10">
            Visi & Misi
          </h2>

          <div className="bg-white/5 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-lg">

            <p className="text-gray-300 mb-4 text-lg">
              <strong>Visi:</strong> Menjadi platform produktivitas modern yang mempercepat
              kolaborasi lintas tim dan organisasi.
            </p>

            <p className="text-gray-300 mb-3 text-lg">
              <strong>Misi:</strong>
            </p>

            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Menyediakan alat manajemen tugas yang mudah dipahami.</li>
              <li>Membantu tim bekerja lebih cepat dan terorganisir.</li>
              <li>Membuat pengalaman pengguna yang sederhana namun powerful.</li>
            </ul>

          </div>
        </div>
      </section>

      {/* FITUR */}
      <section className="py-24 px-6 md:px-20">
        <div className="max-w-5xl mx-auto">

          <h2 className="text-3xl font-semibold text-center mb-12">
            Fitur Unggulan
          </h2>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "Drag & Drop Task",
              "Real-time Sync",
              "Tampilan Minimalis",
              "Custom Workflow",
              "Collaborative Planning",
            ].map((fitur, i) => (
              <Card
                key={i}
                className="group border border-white/10 bg-white/5 backdrop-blur-md rounded-2xl transition duration-300 hover:-translate-y-2 hover:border-red-500/30 hover:bg-white/10"
              >
                <CardContent className="p-6 text-center">
                  <p className="font-medium text-white text-lg">{fitur}</p>
                </CardContent>
              </Card>
            ))}
          </div>

        </div>
      </section>

      {/* TIM */}
      <section className="py-24 px-6 md:px-20">
        <div className="max-w-5xl mx-auto">

          <h2 className="text-3xl font-semibold text-center mb-12">
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
                className="group border border-white/10 bg-white/5 backdrop-blur-md rounded-2xl text-center transition duration-300 hover:-translate-y-2 hover:border-red-500/30"
              >
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-1">
                    {member.name}
                  </h3>
                  <p className="text-gray-400">{member.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>

        </div>
      </section>

      {/* TEKNOLOGI */}
      <section className="py-24 px-6 md:px-20 text-center">
        <div className="max-w-4xl mx-auto">

          <h2 className="text-3xl font-semibold mb-6">
            Teknologi yang Digunakan
          </h2>

          <p className="text-gray-300 text-lg leading-relaxed">
            <strong>Frontend:</strong> Next.js <br />
            <strong>Backend:</strong> Express.js <br />
            <strong>Database:</strong> PostgreSQL <br />
            <strong>UI Library:</strong> ShadCN/UI
          </p>

        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 md:px-20 text-center">
        <div className="max-w-3xl mx-auto">

          <p className="text-xl text-gray-300 leading-relaxed mb-10">
            Kami percaya pada kesederhanaan, kolaborasi, dan kualitas.
            Bergabunglah dan jadikan pekerjaan tim Anda lebih produktif.
          </p>

          <Button
            onClick={handleClick}
            className="bg-red-600 px-10 py-6 text-lg text-white hover:bg-red-700 rounded-xl shadow-lg shadow-red-600/30 hover:scale-105 transition"
          >
            Mulai Sekarang
          </Button>

        </div>
      </section>

    </main>
  );
}