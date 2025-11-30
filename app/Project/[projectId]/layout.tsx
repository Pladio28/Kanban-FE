
import ProjectNav from "./components/ProjectNav";

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#0F172A] text-white">
      <div className="border-b border-white/10 bg-[#0F172A]/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <ProjectNav />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {children}
      </div>
    </main>
  );
}
