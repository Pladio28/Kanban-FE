"use client";

import { useRef } from "react";
import axios, { AxiosInstance, AxiosRequestHeaders } from "axios";
import { useAuth } from "@clerk/nextjs";

export const useApi = (): AxiosInstance => {
  const { getToken, userId } = useAuth();
  const apiRef = useRef<AxiosInstance | null>(null);

  if (!apiRef.current) {
    const instance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL + "/api",
      headers: { "Content-Type": "application/json" },
    });

    instance.interceptors.request.use(async (config) => {
      if (typeof window !== "undefined") {
        const token = await getToken();
        const headers = config.headers as AxiosRequestHeaders;

        if (token) headers.Authorization = `Bearer ${token}`;
        if (userId) headers["X-Clerk-User-Id"] = userId;

        config.headers = headers;
      }
      return config;
    });

    apiRef.current = instance;
  }

  return apiRef.current;
};
