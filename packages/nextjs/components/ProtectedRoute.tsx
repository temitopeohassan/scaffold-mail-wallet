"use client";

import React from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireEmailVerification?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireEmailVerification = false }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/auth/login");
        return;
      }

      if (requireEmailVerification && !user.emailVerified) {
        router.push("/auth/login");
        return;
      }
    }
  }, [user, loading, router, requireEmailVerification]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requireEmailVerification && !user.emailVerified) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
