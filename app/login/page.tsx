"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import supabaseBrowser from "@/lib/supabaseBrowser";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function LoginPage() {
  const supabase = supabaseBrowser; // ✅ FIX: harus dipanggil sebagai function
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (loginError) {
      setError(loginError.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* LEFT SIDE IMAGE */}
      <div className="hidden md:flex relative bg-gray-900 items-center justify-center">
        <Image
          src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1172"
          alt="Login Illustration"
          fill
          className="object-cover opacity-70"
          priority
        />
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <div className="text-center text-white px-6">
            <h2 className="text-3xl font-bold mb-2">Hi, Partner!</h2>
            <p className="text-gray-300">
              Manage your bugs and projects efficiently
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE FORM */}
      <div className="flex items-center justify-center bg-white p-4 sm:p-6">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <img
              src="https://static.thenounproject.com/png/2409459-200.png"
              alt="Logo"
              className="w-10 h-10 sm:w-12 sm:h-12"
            />
          </div>

          {/* Mobile Greeting */}
          <div className="md:hidden text-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-1">
              Hi, Partner! 👋
            </h2>
            <p className="text-sm text-gray-600">
              Manage your bugs efficiently
            </p>
          </div>

          <h1 className="text-xl sm:text-2xl font-semibold text-center mb-6">
            Sign in to your account
          </h1>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* ERROR MESSAGE */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* EMAIL */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2.5 sm:py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none text-base sm:text-sm"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2.5 sm:py-2 pr-10 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none text-base sm:text-sm"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />

                {/* TOGGLE PASSWORD */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white py-3 sm:py-2 rounded-md text-base sm:text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          {/* FOOTER */}
          <p className="text-center text-sm text-gray-600 mt-6 px-4">
            Bukan member?{" "}
            <a
              href="https://wa.me/6287851810174?text=Halo,%20saya%20mau%20jadi%20member"
              target="_blank"
              className="text-blue-600 hover:underline font-medium"
            >
              japri admin ya!
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
