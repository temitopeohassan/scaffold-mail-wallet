"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ArrowLeft, Eye, EyeOff, Wallet } from "lucide-react";
import { toast } from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!auth) {
      toast.error("Authentication is not configured. Please set Firebase env vars.");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Signed in successfully!");
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      let errorMessage = "Failed to sign in";

      if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address";
      } else if (error.code === "auth/user-disabled") {
        errorMessage = "Account has been disabled";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later";
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <div className="mb-6">
          <Link href="/" className="btn btn-ghost btn-sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>

        {/* Login Card */}
        <div className="card bg-base-100 shadow-2xl">
          <div className="card-body">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold">Welcome Back</h1>
              <p className="text-base-content/70">Sign in to your EthWallet account</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="input input-bordered w-full"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="input input-bordered w-full pr-12"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-base-content/50" />
                    ) : (
                      <Eye className="w-5 h-5 text-base-content/50" />
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" className={`btn btn-primary w-full ${loading ? "loading" : ""}`} disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            {/* Links */}
            <div className="divider">OR</div>

            <div className="text-center space-y-2">
              <p className="text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/auth/signup" className="link link-primary font-medium">
                  Sign up here
                </Link>
              </p>
              <p className="text-sm">
                <Link href="/auth/forgot-password" className="link link-secondary">
                  Forgot your password?
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
