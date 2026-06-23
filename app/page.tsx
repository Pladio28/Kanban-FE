import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="pt-24 text-white">

      {/* HERO */}
      <section className="py-24">
        <div className="container mx-auto flex flex-col-reverse md:flex-row items-center justify-between gap-16 px-6">

          {/* KIRI */}
          <div className="max-w-2xl">
            <span className="inline-flex items-center rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1 text-sm font-medium text-red-300 backdrop-blur-md mb-6">
              🚀 Alternatif Kanban #1
            </span>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Lihat mengapa tim memilih{" "}
              <span className="text-red-500">Kanban kami</span>{" "}
              daripada yang lain.
            </h1>

            <p className="text-lg text-gray-300 leading-8 mb-8 max-w-xl">
              Kanban board kami fleksibel, user-friendly, dan sangat mudah
              disesuaikan. Cocok untuk tim yang membutuhkan visual planning
              dengan kontrol penuh.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/sign-in/sign-up">
                <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 rounded-xl text-lg shadow-lg shadow-red-600/30 transition hover:scale-105">
                  MULAI
                </Button>
              </Link>

              <Button
                variant="outline"
                className="border-white/20 bg-white/5 text-white hover:bg-white/10 rounded-xl px-8 py-6"
              >
                Pelajari Lebih Lanjut
              </Button>
            </div>

            <p className="text-sm text-gray-400 mt-5">
              Gratis selamanya. Tanpa kartu kredit.
            </p>
          </div>

          {/* KANAN */}
          <div className="w-full md:w-1/2 relative">
            <div className="absolute -inset-4 bg-red-600/20 blur-3xl rounded-full"></div>

            <img
              src="/Kanban.png"
              alt="Preview Kanban"
              className="relative rounded-3xl border border-white/10 shadow-2xl shadow-red-900/30"
            />
          </div>
        </div>
      </section>

      {/* SECTION 2 */}
      <section className="py-24">
        <div className="container mx-auto text-center max-w-3xl px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Buat papan Kanban dengan cepat
          </h2>

          <p className="text-gray-300 text-lg leading-8 mb-14">
            Papan Kanban gratis dari kami fleksibel, mudah disesuaikan, dan
            membantu tim Anda menyelesaikan project dengan lebih cepat dan rapi.
          </p>
        </div>

        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl px-6">
          {[
            {
              title: "Mudah digunakan",
              text: "Antarmuka clean dan cepat dipahami untuk semua anggota tim.",
              icon: "⚡",
            },
            {
              title: "Kolaborasi Real-time",
              text: "Update otomatis tanpa refresh. Semua perubahan sinkron.",
              icon: "👥",
            },
            {
              title: "Fleksibel & Customizable",
              text: "Atur workflow sesuai gaya kerja tim Anda.",
              icon: "🎨",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="group rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-8 transition duration-300 hover:-translate-y-2 hover:border-red-500/30 hover:bg-white/10"
            >
              <div className="mb-5 text-5xl">{item.icon}</div>
          
              <h3 className="text-xl font-semibold mb-3 text-white">
                {item.title}
              </h3>
          
              <p className="text-gray-300 leading-7">
                {item.text}
              </p>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-14">
          <Link href="/sign-in/sign-up">
            <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 rounded-xl text-lg shadow-lg shadow-red-600/30 hover:scale-105 transition">
              Daftar Gratis
            </Button>
          </Link>
        </div>
      </section>
        
      {/* SECTION 3 */}
      <section className="py-24">
        <div className="container mx-auto text-center px-6">
        
          <h2 className="text-3xl md:text-4xl font-bold mb-14">
            Tim di balik <span className="text-red-500">Project Bye</span>
          </h2>
        
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-3xl mx-auto">
            {[
              { name: "Pladio.M", image: "/Me.jpg" },
              { name: "Akmal", image: "/akmal.enc" },
            ].map((member, i) => (
              <div
                key={i}
                className="group rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-8 transition duration-300 hover:-translate-y-2 hover:border-red-500/30"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="mx-auto mb-5 h-32 w-32 rounded-full object-cover border-4 border-red-500/20 shadow-lg shadow-red-900/20"
                />

                <h3 className="text-xl font-semibold text-white">
                  {member.name}
                </h3>
            
                <p className="mt-2 text-sm text-gray-400">
                  Developer
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}