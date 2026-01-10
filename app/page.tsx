import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
 <main>
   {/* Section 1 – Hero seperti ClickUp */}
      <section className="py-24 bg-white">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-12">

          {/* KIRI – TEKS */}
          <div className="max-w-xl">
            <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
              Alternatif Kanban #1
            </span>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
              Lihat mengapa tim memilih <span className="text-blue-600">Kanban kami</span> daripada yang lain.
            </h1>

            <p className="text-gray-600 text-lg mb-8">
              Kanban board kami fleksibel, user-friendly, dan sangat mudah disesuaikan.
              Cocok untuk tim yang membutuhkan visual planning dengan kontrol penuh.
            </p>

            <Link href="/sign-up">
              <Button className="bg-blue-600 text-white px-8 py-6 text-lg hover:bg-blue-700">
                MULAI
              </Button>
            </Link>

            <p className="text-sm text-gray-500 mt-4">
              Gratis selamanya. Tanpa kartu kredit.
            </p>
          </div>

          {/* KANAN – GAMBAR */}
          <div className="w-full md:w-1/2">
            <img
              src="/Kanban.png"
              alt="Preview Kanban"
              className="rounded-xl shadow-lg"
            />
          </div>
        </div>
      </section>

           {/* Section 2 */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Buat papan Kanban dengan cepat
          </h2>
          <p className="text-gray-600 text-lg mb-12">
            Papan Kanban gratis dari kami fleksibel, mudah disesuaikan, dan membantu tim Anda menyelesaikan project dengan lebih cepat dan rapi.
          </p>
        </div>

        {/* 3 Fitur */}
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
              className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition border border-slate-200"
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.text}</p>
            </div>
          ))}
        </div>
        
        {/* CTA */}
        <div className="text-center mt-12">
          <Link href="/sign-up">
            <Button className="bg-blue-600 text-white px-8 py-6 text-lg hover:bg-blue-700 rounded-xl">
              Daftar Gratis
            </Button>
          </Link>
        </div>
      </section>
        
      {/* Section 3 */}
      <section className="py-24 bg-white">
        <div className="container mx-auto text-center">
              
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">
            Tim di balik <span className="text-blue-600">Project Bye</span>
          </h1>
              
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-2xl mx-auto">
            {[ 
              { name: "Pladio.M", image: "/Me.jpg" },
              { name: "Akmal", image: "/akmal.enc" }
            ].map((member, i) => (
              <div 
                key={i}
                className="flex flex-col items-center bg-white border border-slate-200 p-8 rounded-2xl shadow-md hover:shadow-xl transition"
              >
                <img 
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 rounded-full object-cover mb-4 shadow"
                />
                <p className="text-lg font-semibold text-gray-800">{member.name}</p>
                <p className="text-gray-500 text-sm mt-1">Developer</p>
              </div>
            ))}
          </div>
          
        </div>
      </section>
          
    </main>
  )
}