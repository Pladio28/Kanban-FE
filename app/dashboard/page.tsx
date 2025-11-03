"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useUser, useAuth } from "@clerk/nextjs";

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [status, setStatus] = useState("🔄 Menyambungkan ke server...");

  useEffect(() => {
    const syncUser = async () => {
      try {
        // Pastikan Clerk sudah siap
        if (!isLoaded || !user) {
          console.log("⏳ Clerk belum siap...");
          return;
        }

        // Ambil token sesi aktif dari Clerk
        const token = await getToken();
        if (!token) {
          console.warn("❌ Token belum siap, tunggu Clerk load dulu.");
          return;
        }

        // Ambil URL backend dari environment variable
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        if (!API_URL) {
          console.error("❌ NEXT_PUBLIC_API_URL belum diatur di Vercel frontend.");
          return;
        }

        // Kirim Clerk ID ke backend
        const res = await axios.post(
          `${API_URL}/api/projects`,
          { clerkId: user.id },
          {
            headers: {
              Authorization: `Bearer ${token}`, // Kirim token Clerk
              "Content-Type": "application/json",
            },
          }
        );

        console.log("✅ Response backend:", res.data);
        setStatus(`✅ ${res.data.message}`);
      } catch (error: any) {
        console.error("❌ Error sinkronisasi:", error.response?.data || error.message);
        setStatus("❌ Gagal sinkronisasi user dengan backend.");
      }
    };

    syncUser();
  }, [user, isLoaded, getToken]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-2">Cek Clerk User</h1>
      <p>Clerk ID: {user?.id || "Belum login"}</p>
      <p className="mt-2">{status}</p>
    </div>
  );
}