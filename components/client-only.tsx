"use client";

import dynamic from "next/dynamic";

export const ClientOnly = dynamic(
  async () => {
    return function ClientOnly({ children }: { children: React.ReactNode }) {
      return <>{children}</>;
    };
  },
  { ssr: false }
);
