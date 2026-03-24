"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SendEthCard } from "@/components/SendEthCard";
import { useAuth } from "@/contexts/AuthContext";
import { type UserProfile, api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Clock, Copy, ExternalLink, RefreshCw, Settings, Shield, TrendingUp, Wallet } from "lucide-react";
import { toast } from "react-hot-toast";
import { formatEther } from "viem";
import { usePublicClient } from "wagmi";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { useWatchBalance } from "~~/hooks/scaffold-eth/useWatchBalance";
import { useGlobalState } from "~~/services/store/store";
import { getBlockExplorerAddressLink } from "~~/utils/scaffold-eth";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { targetNetwork } = useTargetNetwork();
  const nativeCurrencyPrice = useGlobalState(s => s.nativeCurrency.price);
  const isPriceFetching = useGlobalState(s => s.nativeCurrency.isFetching);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [copying, setCopying] = useState(false);

  const walletAddress = profile?.walletAddress;

  const {
    data: balanceData,
    isLoading: balanceLoading,
    refetch: refetchBalance,
  } = useWatchBalance({
    address: walletAddress as `0x${string}` | undefined,
    chainId: targetNetwork.id,
    query: { enabled: Boolean(walletAddress) },
  });

  const publicClient = usePublicClient({ chainId: targetNetwork.id });

  const { data: txNonce } = useQuery({
    queryKey: ["dashboard-tx-count", walletAddress, targetNetwork.id],
    queryFn: () => publicClient!.getTransactionCount({ address: walletAddress as `0x${string}` }),
    enabled: Boolean(publicClient && walletAddress),
  });

  const ethBalance = balanceData?.value;
  const ethFormatted = useMemo(() => {
    if (ethBalance === undefined) return null;
    return parseFloat(formatEther(ethBalance));
  }, [ethBalance]);

  const usdEstimate = ethFormatted !== null && nativeCurrencyPrice > 0 ? ethFormatted * nativeCurrencyPrice : null;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (authLoading || !user) return;

    let cancelled = false;
    setProfileLoading(true);
    setProfileError(null);

    api
      .getProfile()
      .then(res => {
        if (cancelled) return;
        if (res.success && res.data) {
          setProfile(res.data);
          if (!res.data.walletAddress) {
            router.replace("/wallet/create");
          }
        } else {
          setProfileError(res.error || "Could not load profile");
        }
      })
      .catch(() => {
        if (!cancelled) setProfileError("Could not load profile");
      })
      .finally(() => {
        if (!cancelled) setProfileLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user, authLoading, router]);

  const explorerHref = walletAddress ? getBlockExplorerAddressLink(targetNetwork, walletAddress) : "";
  const explorerIsInternal = explorerHref.startsWith("/");

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

  const displayName = user?.email?.split("@")[0] ?? user?.email ?? "there";

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (profileError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-base-content/80">{profileError}</p>
        <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  if (!walletAddress) {
    return null;
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome back, {displayName}! </h1>
            <p className="text-base-content/70">Manage your Ethereum wallet and track your assets</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="stat bg-base-100 rounded-lg shadow">
              <div className="stat-figure text-primary">
                <Wallet className="w-8 h-8" />
              </div>
              <div className="stat-title">Wallet Balance</div>
              <div className="stat-value text-primary text-sm">
                {balanceLoading ? (
                  <span className="loading loading-dots loading-md" />
                ) : (
                  `${ethFormatted !== null ? ethFormatted.toFixed(4) : "0"} ${targetNetwork.nativeCurrency.symbol}`
                )}
              </div>
              <div className="stat-desc">
                {usdEstimate !== null
                  ? `≈ $${usdEstimate.toFixed(2)} USD`
                  : isPriceFetching
                    ? "Fetching USD price…"
                    : "USD estimate unavailable"}
              </div>
            </div>

            <div className="stat bg-base-100 rounded-lg shadow">
              <div className="stat-figure text-secondary">
                <TrendingUp className="w-8 h-8" />
              </div>
              <div className="stat-title">Portfolio (native)</div>
              <div className="stat-value text-secondary text-sm">
                {usdEstimate !== null ? `$${usdEstimate.toFixed(2)}` : "—"}
              </div>
              <div className="stat-desc">Based on {targetNetwork.name}</div>
            </div>

            <div className="stat bg-base-100 rounded-lg shadow">
              <div className="stat-figure text-accent">
                <RefreshCw className="w-8 h-8" />
              </div>
              <div className="stat-title">Outgoing txs</div>
              <div className="stat-value text-accent">{txNonce ?? "—"}</div>
              <div className="stat-desc">On {targetNetwork.name}</div>
            </div>

            <div className="stat bg-base-100 rounded-lg shadow">
              <div className="stat-figure text-info">
                <Shield className="w-8 h-8" />
              </div>
              <div className="stat-title">Account</div>
              <div className="stat-value text-info text-sm"> {profile?.activated ? "Activated" : "Pending"} </div>
              <div className="stat-desc">{user.emailVerified ? "Email verified" : "Email not verified"}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <SendEthCard ethWalletAddress={walletAddress} onSent={() => void refetchBalance()} />

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
                        value={walletAddress}
                        readOnly
                      />
                      <button
                        className={`btn btn-square btn-outline ${copying ? "loading" : ""}`}
                        onClick={copyAddress}
                        disabled={copying}
                        type="button"
                      >
                        {!copying && <Copy className="w-4 h-4" />}
                      </button>
                      {explorerIsInternal ? (
                        <Link href={explorerHref} className="btn btn-square btn-outline">
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      ) : (
                        <a
                          href={explorerHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-square btn-outline"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                    <p className="text-sm text-base-content/60 mt-2">Share this address to receive ETH and tokens</p>
                  </div>

                  <div className="divider"></div>

                  <div className="flex flex-wrap gap-2">
                    {user.emailVerified ? (
                      <div className="badge badge-success">Email verified</div>
                    ) : (
                      <div className="badge badge-warning">Email pending</div>
                    )}
                    <div className="badge badge-info">{targetNetwork.name}</div>
                    {profile?.activated ? (
                      <div className="badge badge-success">Activated</div>
                    ) : (
                      <div className="badge badge-ghost">Not activated</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title">Quick Actions</h2>

                <div className="grid grid-cols-2 gap-4">
                  <button type="button" className="btn btn-primary btn-outline" onClick={() => void refetchBalance()}>
                    <RefreshCw className="w-4 h-4" />
                    Refresh Balance
                  </button>

                  {explorerIsInternal ? (
                    <Link href={explorerHref} className="btn btn-secondary btn-outline">
                      <ExternalLink className="w-4 h-4" />
                      View on Explorer
                    </Link>
                  ) : (
                    <a
                      href={explorerHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-outline"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View on Explorer
                    </a>
                  )}

                  <Link href="/help" className="btn btn-accent btn-outline">
                    <Settings className="w-4 h-4" />
                    Help
                  </Link>

                  <Link href="/support" className="btn btn-info btn-outline">
                    <Shield className="w-4 h-4" />
                    Support
                  </Link>
                </div>

                <div className="divider"></div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Getting Started</h3>
                  <ul className="text-sm space-y-1 text-base-content/70">
                    <li>• Add funds to your wallet to get started</li>
                    <li>
                      • Use Send: connect a wallet to transfer ETH (import your EthWallet private key into MetaMask to
                      use the same address)
                    </li>
                    <li>• Explore DeFi applications and NFT marketplaces</li>
                    <li>• Keep your private key secure and backed up</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-lg lg:col-span-2">
              <div className="card-body">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="card-title">
                    <Clock className="w-5 h-5" />
                    Recent Activity
                  </h2>
                  <button className="btn btn-ghost btn-sm" type="button" onClick={() => void refetchBalance()}>
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-base-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-base-content/30" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No transaction list yet</h3>
                  <p className="text-base-content/60 mb-4">
                    Full history appears on the block explorer for your network. Outgoing transactions on this network:{" "}
                    <strong>{txNonce ?? 0}</strong>.
                  </p>
                  {explorerIsInternal ? (
                    <Link href={explorerHref} className="btn btn-primary btn-sm">
                      Open in explorer
                    </Link>
                  ) : (
                    <a href={explorerHref} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                      Open in explorer
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

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
