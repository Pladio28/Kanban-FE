"use client";

import Link from "next/link";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { ClientOnly } from "./client-only"; // wrapper
import { ThemeToggle }from "@/components/theme-toggle";

export default function Header() {
  return (
    <header className="py-4">
      <nav className="container flex items-center justify-between">
        <ul className="flex gap-10 text-sm font-medium">
          <li>
            <Link href="/">Home</Link>
          </li>

          <SignedIn>
            <li>
              <Link href="/Project">Project</Link>
            </li>
          </SignedIn>

          <li>
            <Link href="/about">About</Link>
          </li>
        </ul>

        <div className="flex items-center justify-between gap-6">
          {/* Bungkus ThemeToggle supaya tidak menyebabkan hydration error */}
          <ClientOnly>
            <ThemeToggle />
          </ClientOnly>

          <SignedOut>
            <SignInButton mode="modal">
              <Button size="sm">Sign in</Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </nav>
    </header>
  );
}
