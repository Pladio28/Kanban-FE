import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
 <main>
      {/* Section 1 */}
      <section className="py-24 bg-white">
        <div className="container">
          <h1 className="text-black text-3xl font-bold mb-6">Hallo Selamat Datang di Web Kanban</h1>
          <p className="text-black mb-6">Alat Kanban untuk perencanaan visual</p>
        </div>
      </section>

      {/* Section 2 */}
      <section className="py-24 bg-black">
        <div className="container">
          <h2 className="text-2xl font-semibold mb-4">Alat Kanban untuk perencanaan visual</h2>
          <Button className="bg-blue-600 text-white hover:bg-blue-700">Daftar</Button>
        </div>
      </section>

      {/* Section 3 */}
      <section className="py-24 bg-gray-100">
        <div className="flex flex-col items-center">
          <h1 className="text-black text-3xl font-bold mb-6">Project Bye</h1>

         <div className="flex flex-row gap-12">
              <div className="flex flex-col items-center">
            <img 
              src="/Me.jpg" 
              alt="Foto Team"
              className="w-32 h-32 rounded-full mb-4"
              />
            <p className="text-lg font-medium text-gray-800">Pladio.M</p>
            </div>

            <div className="flex flex-col items-center">
            <img 
              src="/akmal.enc" 
              alt="Foto Team"
              className="w-32 h-32 rounded-full mb-4"
              />
            <p className="text-lg font-medium text-gray-800">Akmal</p>
          </div>
        </div>
      </div>
      </section>
    </main>
  )
}