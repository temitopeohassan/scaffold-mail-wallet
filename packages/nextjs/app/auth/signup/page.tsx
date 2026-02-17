"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { ArrowLeft, Eye, EyeOff, Mail, Wallet } from "lucide-react";
import { toast } from "react-hot-toast";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.emailVerified) {
      router.push("/wallet/create");
    }
  }, [user, router]);

  const validateForm = () => {
    if (!email || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return false;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!auth) {
      toast.error("Authentication is not configured. Please set Firebase env vars.");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      setEmailSent(true);
      toast.success("Account created! Please check your email for verification.");
    } catch (error: any) {
      console.error("Signup error:", error);
      let errorMessage = "Failed to create account";

      if (error.code === "auth/email-already-in-use") {
        errorMessage = "An account with this email already exists";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak";
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="card bg-base-100 shadow-2xl">
            <div className="card-body text-center">
              <div className="w-16 h-16 bg-success rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold mb-4">Check Your Email</h1>
              <p className="text-base-content/70 mb-6">
                We&apos;ve sent a verification link to <strong>{email}</strong>. Please click the link in the email to
                verify your account.
              </p>

              <div className="space-y-4">
                <Link href="/auth/login" className="btn btn-primary w-full">
                  Continue to Sign In
                </Link>
                <button onClick={() => setEmailSent(false)} className="btn btn-ghost w-full">
                  Change Email Address
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

        {/* Signup Card */}
        <div className="card bg-base-100 shadow-2xl">
          <div className="card-body">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold">Create Account</h1>
              <p className="text-base-content/70">Get started with your Ethereum wallet</p>
            </div>

            {/* Signup Form */}
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
                    placeholder="Create a password"
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
                <label className="label">
                  <span className="label-text-alt">Minimum 6 characters</span>
                </label>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Confirm Password</span>
                </label>
                <input
                  type="password"
                  placeholder="Confirm your password"
                  className="input input-bordered w-full"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              <button type="submit" className={`btn btn-primary w-full ${loading ? "loading" : ""}`} disabled={loading}>
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            {/* Terms */}
            <p className="text-xs text-base-content/60 text-center mt-4">
              By creating an account, you agree to our{" "}
              <Link href="/terms" className="link link-primary">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="link link-primary">
                Privacy Policy
              </Link>
            </p>

            {/* Login Link */}
            <div className="divider">Already have an account?</div>

            <div className="text-center">
              <Link href="/auth/login" className="link link-primary font-medium">
                Sign in here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
