"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";

export default function ProjectPage() {
  const router = useRouter();
  const { projectId } = useParams();

  useEffect(() => {
    if (projectId) {
      router.replace(`/Project/${projectId}/board`);
    }
  }, [projectId, router]);

  return (
    <div className="flex items-center justify-center min-h-screen text-gray-400 animate-pulse">
      Loading project...
    </div>
  );
}