"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useUser, useAuth } from "@clerk/nextjs";

export default function DashboardPage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [status, setStatus] = useState("Menyambungkan...");

  useEffect(() => {
    const syncUser = async () => {
      try {
        if (!user) return;

        const token = await getToken();

        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/projects`,
          { clerkId: user.id },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Response backend:", res.data);
        setStatus(`${res.data.message}`);
      } catch (error: any) {
        console.error("Error:", error);
        setStatus("Gagal sinkronisasi user.");
      }
    };

    syncUser();
  }, [user]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-2">Cek clerk id</h1>
      <p>Clerk ID: {user?.id}</p>
      <p>{status}</p>
    </div>
  );
}
