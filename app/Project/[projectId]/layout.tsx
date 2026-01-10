
import { lazy } from "react";
import ProjectNav from "./components/ProjectNav";
import { serializeUseCacheCacheStore } from "next/dist/server/resume-data-cache/cache-store";

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-white text-black">
      <div className="border-b border-slate-200 bg-white sticky top-0 z-50">
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