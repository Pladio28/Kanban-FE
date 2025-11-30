"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import clsx from "clsx";

export default function ProjectNav() {
  const { projectId } = useParams();
  const pathname = usePathname();
  const active = pathname.includes("team") ? "team" : "board";

  return (
    <nav className="relative flex w-fit bg-[#1E293B] rounded-2xl p-1 shadow-lg">
      <Link
        href={`/Project/${projectId}/board`}
        className={clsx(
          "px-6 py-2 rounded-xl text-sm font-semibold transition-all relative z-10",
          active === "board" ? "text-white" : "text-gray-300 hover:text-white"
        )}
      >
        Board
      </Link>

      <Link
        href={`/Project/${projectId}/team`}
        className={clsx(
          "px-6 py-2 rounded-xl text-sm font-semibold transition-all relative z-10",
          active === "team" ? "text-white" : "text-gray-300 hover:text-white"
        )}
      >
        Team
      </Link>

      <div
        className={clsx(
          "absolute top-1 bottom-1 w-[50%] rounded-xl bg-blue-600 transition-all duration-300",
          active === "board" ? "left-1" : "left-[50%]"
        )}
      />
    </nav>
  );
}
