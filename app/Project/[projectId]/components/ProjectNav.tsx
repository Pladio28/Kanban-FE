"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import clsx from "clsx";

export default function ProjectNav() {
  const { projectId } = useParams();
  const pathname = usePathname();
  const active = pathname.includes("team") ? "team" : "board";

  return (
    <nav className="flex gap-6 border-b border-white/10 pb-1">

      <Link
        href={`/Project/${projectId}/board`}
        className={clsx(
          "relative text-sm font-medium pb-2 transition",
          active === "board"
            ? "text-white"
            : "text-gray-400 hover:text-white"
        )}
      >
        Board
        {active === "board" && (
          <span className="absolute left-0 bottom-0 w-full h-[2px] bg-red-500 rounded-full shadow-[0_0_10px_rgba(255,0,0,0.7)]" />
        )}
      </Link>

      <Link
        href={`/Project/${projectId}/team`}
        className={clsx(
          "relative text-sm font-medium pb-2 transition",
          active === "team"
            ? "text-white"
            : "text-gray-400 hover:text-white"
        )}
      >
        Team
        {active === "team" && (
          <span className="absolute left-0 bottom-0 w-full h-[2px] bg-red-500 rounded-full shadow-[0_0_10px_rgba(255,0,0,0.7)]" />
        )}
      </Link>

    </nav>
  );
}