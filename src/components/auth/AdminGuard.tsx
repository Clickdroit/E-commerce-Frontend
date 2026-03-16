"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isInitialized } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized && (!user || user.role !== "admin")) {
      router.replace("/");
    }
  }, [user, isInitialized, router]);

  if (!isInitialized) return <LoadingSpinner />;
  if (!user || user.role !== "admin") return <LoadingSpinner />;

  return <>{children}</>;
}
