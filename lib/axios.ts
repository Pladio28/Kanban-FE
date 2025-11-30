"use client";

import axios, { AxiosRequestConfig, AxiosRequestHeaders } from "axios";
import { useAuth } from "@clerk/nextjs";
import { useRef, useEffect } from "react";

export const useApi = () => {
  const { getToken, userId } = useAuth();
  const apiRef = useRef<any>(null);

  // Create axios instance sekali saja
  if (!apiRef.current) {
    apiRef.current = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL + "/api",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  useEffect(() => {
    const instance = apiRef.current;

    const requestInterceptor = async (config: AxiosRequestConfig) => {
      const token = await getToken(); // ambil token terbaru
      const headers = (config.headers || {}) as AxiosRequestHeaders;

      if (token) headers.Authorization = `Bearer ${token}`;
      if (userId) headers["X-Clerk-User-Id"] = userId;

      config.headers = headers;
      return config;
    };

    const interceptorId = instance.interceptors.request.use(requestInterceptor);

    return () => {
      instance.interceptors.request.eject(interceptorId);
    };
  }, [getToken, userId]);

  return apiRef.current;
};
