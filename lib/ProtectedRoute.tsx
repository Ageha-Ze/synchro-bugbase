"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabaseBrowser from "@/lib/supabaseBrowser";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const supabase = supabaseBrowser;
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setIsLoggedIn(true);
      }
      setLoading(false);
    };
    checkSession();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!isLoggedIn) return null;

  return <>{children}</>;
}
