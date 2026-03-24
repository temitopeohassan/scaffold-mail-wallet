"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { NetworkSwitch } from "@/components/NetworkSwitch";
import { LogOut, User, Wallet } from "lucide-react";

export default function Header() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <nav className="navbar bg-base-100 shadow-lg sticky top-0 z-50">
      <div className="navbar-start">
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold">ScaffoldEth Wallet</span>
        </Link>
      </div>
      <div className="navbar-center flex flex-1 justify-center px-2 min-w-0">
        <NetworkSwitch />
      </div>
      <div className="navbar-end">
        {loading ? (
          <span className="loading loading-spinner loading-sm text-primary"></span>
        ) : user ? (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost gap-2">
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium">My Account</div>
                <div className="text-xs text-base-content/60 max-w-40 truncate">{user.email}</div>
              </div>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-56"
            >
              <li className="menu-title">
                <span className="truncate">{user.email}</span>
              </li>
              <li>
                <Link href="/dashboard">Dashboard</Link>
              </li>
              <li>
                <button type="button" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </li>
            </ul>
          </div>
        ) : (
          <>
            <Link href="/auth/login" className="btn btn-ghost mr-2">
              Sign In
            </Link>
            <Link href="/auth/signup" className="btn btn-primary">
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
