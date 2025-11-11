"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import supabaseBrowser from "@/lib/supabaseBrowser";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function LoginPage() {
  const supabase = supabaseBrowser;
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      alert(error.message);
      return;
    }
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* LEFT SIDE (image) */}
      <div className="hidden md:flex relative bg-gray-900 items-center justify-center">
        <Image
          src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1172"
          alt="Login Illustration"
          fill
          className="object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <div className="text-center text-white px-6">
            <h2 className="text-3xl font-bold mb-2">Hi, Partner!</h2>
            <p className="text-gray-300">Manage your bugs and projects efficiently</p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE (form) */}
      <div className="flex items-center justify-center bg-white">
        <div className="w-full max-w-md px-8 py-10">
          {/* Logo */}
          {/* Logo */}
<div className="flex justify-center mb-8">
  <img
    src="https://static.thenounproject.com/png/2409459-200.png"
    alt="Synchron Testing Logo"
    className="w-10 h-10"
  />
</div>


          <h1 className="text-2xl font-semibold text-center mb-6">Sign in to your account</h1>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
              <div className="text-right mt-1">
                <a href="#" className="text-sm text-blue-600 hover:underline">
                  Forgot password?
                </a>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md"
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Bukan member?{" "}
            <a href="https://wa.me/6281217018775" className="text-blue-600 hover:underline">
              japri admin ya!
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
