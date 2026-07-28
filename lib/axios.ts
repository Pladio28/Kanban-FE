"use client"; // Menandai bahwa hook ini berjalan di Client-side (karena butuh hook useAuth & useRef)

import { useRef } from "react";
import axios, { AxiosInstance, AxiosRequestHeaders } from "axios";
import { useAuth } from "@clerk/nextjs"; // Import hook authentication dari Clerk

// Custom Hook untuk membuat instance Axios yang terintegrasi dengan Clerk Auth
export const useApi = (): AxiosInstance => {
  // Mengambil method getToken & data userId dari Clerk
  const { getToken, userId } = useAuth();
  
  // Ref untuk menyimpan instance Axios agar TIDAK di-recreate/buat ulang setiap kali komponen re-render
  const apiRef = useRef<AxiosInstance | null>(null);

  // Cek apakah instance Axios sudah pernah dibuat atau belum (Lazy Initialization)
  if (!apiRef.current) {
    // 1. Buat konfigurasi dasar Axios (Base URL & Content-Type default)
    const instance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL + "/api", // Mengambil URL API backend dari environment variables
      headers: { 
        "Content-Type": "application/json",
      },
    });

    // 2. Pasang Interceptor Request: Dijalankan OTOMATIS setiap kali ada request keluar dari app
    instance.interceptors.request.use(async (config) => {
      // Saringan keamanan ekstra: Pastikan kode berjalan hanya di lingkungan browser (Client-side)
      if (typeof window !== "undefined") {
        // Ambil JWT session token yang paling segar/baru dari Clerk secara async
        const token = await getToken();
        
        // Assert tipe data headers Axios agar aman dari error TypeScript
        const headers = config.headers as AxiosRequestHeaders;

        // Jika token ada, selipkan ke header 'Authorization' sebagai Bearer Token
        if (token) headers.Authorization = `Bearer ${token}`;
        
        // Jika userId ada, selipkan ke custom header 'X-Clerk-User-Id'
        if (userId) headers["X-Clerk-User-Id"] = userId;

        // Kembalikan objek headers yang sudah disisipi token & userId ke config
        config.headers = headers;
      }
      
      // Kembalikan konfigurasi request yang sudah siap dikirim ke Backend
      return config;
    });

    // 3. Simpan instance Axios yang sudah dipasangi interceptor ke dalam ref
    apiRef.current = instance;
  }

  // Kembalikan instance Axios yang tersimpan di ref
  return apiRef.current;
};