"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Clock, Copy, ExternalLink, LogOut, RefreshCw, Settings, Shield, TrendingUp, User, Wallet } from "lucide-react";
import { toast } from "react-hot-toast";

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  // Mock wallet address - in a real app, this would come from your backend
  useEffect(() => {
    if (user) {
      // This would typically be fetched from your backend
      setWalletAddress("0x742d35Cc6C6C6C8B8C8B8C8B8C8B8C8B8C8B8C8B");
    }
  }, [user]);

  const copyAddress = async () => {
    if (!walletAddress) return;

    setCopying(true);
    try {
      await navigator.clipboard.writeText(walletAddress);
      toast.success("Wallet address copied to clipboard!");
    } catch {
      toast.error("Failed to copy address");
    } finally {
      setCopying(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-base-200">
      {/* Navigation */}
      <div className="navbar bg-base-100 shadow-lg">
        <div className="navbar-start">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">EthWallet</span>
          </div>
        </div>

        <div className="navbar-end">
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li className="menu-title">
                <span className="text-xs truncate">{user.email}</span>
              </li>
              <li>
                <a>
                  <Settings className="w-4 h-4" /> Settings
                </a>
              </li>
              <li>
                <a onClick={handleSignOut}>
                  <LogOut className="w-4 h-4" /> Sign Out
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
            <p className="text-base-content/70">Manage your Ethereum wallet and track your assets</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="stat bg-base-100 rounded-lg shadow">
              <div className="stat-figure text-primary">
                <Wallet className="w-8 h-8" />
              </div>
              <div className="stat-title">Wallet Balance</div>
              <div className="stat-value text-primary">0 ETH</div>
              <div className="stat-desc">≈ $0.00 USD</div>
            </div>

            <div className="stat bg-base-100 rounded-lg shadow">
              <div className="stat-figure text-secondary">
                <TrendingUp className="w-8 h-8" />
              </div>
              <div className="stat-title">Portfolio Value</div>
              <div className="stat-value text-secondary">$0.00</div>
              <div className="stat-desc">+0% from yesterday</div>
            </div>

            <div className="stat bg-base-100 rounded-lg shadow">
              <div className="stat-figure text-accent">
                <RefreshCw className="w-8 h-8" />
              </div>
              <div className="stat-title">Total Transactions</div>
              <div className="stat-value text-accent">0</div>
              <div className="stat-desc">All time</div>
            </div>

            <div className="stat bg-base-100 rounded-lg shadow">
              <div className="stat-figure text-info">
                <Shield className="w-8 h-8" />
              </div>
              <div className="stat-title">Account Status</div>
              <div className="stat-value text-info text-sm">Active</div>
              <div className="stat-desc">Verified & Secure</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Wallet Info */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title">
                  <Wallet className="w-5 h-5" />
                  Your Wallet
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="label">
                      <span className="label-text font-medium">Wallet Address</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        className="input input-bordered flex-1 font-mono text-sm"
                        value={walletAddress || ""}
                        readOnly
                      />
                      <button
                        className={`btn btn-square btn-outline ${copying ? "loading" : ""}`}
                        onClick={copyAddress}
                        disabled={copying || !walletAddress}
                      >
                        {!copying && <Copy className="w-4 h-4" />}
                      </button>
                      <a
                        href={`https://etherscan.io/address/${walletAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-square btn-outline"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                    <p className="text-sm text-base-content/60 mt-2">Share this address to receive ETH and tokens</p>
                  </div>

                  <div className="divider"></div>

                  <div className="flex flex-wrap gap-2">
                    <div className="badge badge-success">Verified</div>
                    <div className="badge badge-info">Mainnet</div>
                    <div className="badge badge-ghost">HD Wallet</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title">Quick Actions</h2>

                <div className="grid grid-cols-2 gap-4">
                  <button className="btn btn-primary btn-outline">
                    <RefreshCw className="w-4 h-4" />
                    Refresh Balance
                  </button>

                  <button className="btn btn-secondary btn-outline">
                    <ExternalLink className="w-4 h-4" />
                    View on Explorer
                  </button>

                  <button className="btn btn-accent btn-outline">
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>

                  <button className="btn btn-info btn-outline">
                    <Shield className="w-4 h-4" />
                    Security
                  </button>
                </div>

                <div className="divider"></div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Getting Started</h3>
                  <ul className="text-sm space-y-1 text-base-content/70">
                    <li>• Add funds to your wallet to get started</li>
                    <li>• Import your wallet into MetaMask or other apps</li>
                    <li>• Explore DeFi applications and NFT marketplaces</li>
                    <li>• Keep your private key secure and backed up</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card bg-base-100 shadow-lg lg:col-span-2">
              <div className="card-body">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="card-title">
                    <Clock className="w-5 h-5" />
                    Recent Activity
                  </h2>
                  <button className="btn btn-ghost btn-sm">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-base-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-base-content/30" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No transactions yet</h3>
                  <p className="text-base-content/60 mb-4">
                    Your transaction history will appear here once you start using your wallet.
                  </p>
                  <button className="btn btn-primary btn-sm">Add funds to get started</button>
                </div>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="card bg-gradient-to-r from-primary/10 to-secondary/10 shadow-lg mt-8">
            <div className="card-body">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">Need Help?</h3>
                  <p className="text-base-content/70">
                    Learn how to use your wallet safely, import it into other apps, and explore the Ethereum ecosystem.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href="/help" className="btn btn-primary btn-sm">
                    View Guide
                  </Link>
                  <Link href="/support" className="btn btn-outline btn-sm">
                    Contact Support
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
