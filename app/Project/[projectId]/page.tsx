"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";

export default function ProjectPage() {
  const router = useRouter();
  const { projectId } = useParams();

  useEffect(() => {
    router.replace(`/Project/${projectId}/board`);
  }, [projectId, router]);

  return <div className="text-white">Loading...</div>;
  
}
