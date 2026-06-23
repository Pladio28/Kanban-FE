// components/header.tsx
"use client";

import Link from "next/link";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl bg-black/40 border-b border-white/10 shadow-lg shadow-black/20 before:absolute before:inset-0 before:bg-gradient-to-r before:from-red-500/10 before:to-transparent before:pointer-events-none">
      <nav className="container flex items-center justify-between py-4">

        {/* LEFT */}
        <ul className="flex items-center gap-8 text-sm font-medium text-gray-300">
          <li className="text-lg font-bold tracking-tight">
            <Link href="/" className="flex items-center gap-1">
              <span className="text-white">Kanban</span>
              <span className="text-red-500">Flow</span>
            </Link>
          </li>
          <li>
            <Link href="/" className="hover:text-red-500 transition">Home</Link>
          </li>
          <SignedIn>
            <li>
              <Link href="/Project" className="hover:text-red-500 transition">Project</Link>
            </li>
          </SignedIn>
          <li>
            <Link href="/about" className="hover:text-red-500 transition">About</Link>
          </li>
        </ul>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          <SignedOut>
            <SignInButton mode="modal">
              <Button size="sm" className="rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/30">
                Sign in
              </Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <div className="scale-90 hover:scale-100 transition duration-200">
              <UserButton />
            </div>
          </SignedIn>
        </div>
      </nav>
    </header>
  );
}