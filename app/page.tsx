"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import { Dumbbell, Loader2 } from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
      <div className="text-center">
        <Dumbbell className="w-16 h-16 text-white mx-auto mb-4 animate-pulse" />
        <Loader2 className="w-8 h-8 text-white mx-auto animate-spin" />
      </div>
    </div>
  );
}
