"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import WalletModal from "@/components/WalletModal";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/contexts/WalletContext";
import { CheckCircle2, Shield, Wallet, Zap } from "lucide-react";
import { toast } from "react-hot-toast";

export default function CreateWalletPage() {
  const { user, loading: authLoading } = useAuth();
  const { generateWallet, walletData, loading: walletLoading, activateUser, clearWallet } = useWallet();
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!authLoading && user && !user.emailVerified) {
      toast.error("Please verify your email address first");
      router.push("/auth/login");
    }
  }, [user, authLoading, router]);

  const handleCreateWallet = async () => {
    if (!user) {
      toast.error("Please sign in first");
      return;
    }

    const wallet = await generateWallet(user.uid);
    if (wallet) {
      setShowModal(true);
    }
  };

  const handleWalletComplete = async () => {
    if (!walletData) return;

    const activated = await activateUser(walletData.walletAddress);
    if (activated) {
      clearWallet(); // Clear wallet data from memory for security
      router.push("/dashboard");
    }
  };

  if (authLoading) {
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
    <div className="min-h-screen gradient-bg">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <Wallet className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Create Your Ethereum Wallet</h1>
            <p className="text-xl text-base-content/70 max-w-2xl mx-auto">
              Welcome {user.email}! Let&apos;s create your secure Ethereum wallet in just a few clicks.
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="card-title justify-center text-lg">Secure Generation</h3>
                <p className="text-sm text-base-content/70">
                  Your wallet is generated using cryptographically secure random number generation
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-lg">
              <div className="card-body text-center">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="card-title justify-center text-lg">Instant Access</h3>
                <p className="text-sm text-base-content/70">
                  Your wallet will be ready immediately and can be used with any Ethereum service
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-lg">
              <div className="card-body text-center">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-6 h-6 text-accent" />
                </div>
                <h3 className="card-title justify-center text-lg">Full Control</h3>
                <p className="text-sm text-base-content/70">
                  You own your private keys and have complete control over your funds
                </p>
              </div>
            </div>
          </div>

          {/* Create Wallet Section */}
          <div className="card bg-base-100 shadow-2xl max-w-2xl mx-auto">
            <div className="card-body text-center">
              <h2 className="card-title justify-center text-2xl mb-6">Ready to Create Your Wallet?</h2>

              <div className="space-y-4 mb-8">
                <div className="alert alert-info">
                  <div className="text-left">
                    <h4 className="font-semibold mb-2">What happens next:</h4>
                    <ol className="text-sm space-y-1">
                      <li>1. We&apos;ll generate a unique Ethereum wallet for you</li>
                      <li>2. You&apos;ll see your wallet address and private key</li>
                      <li>3. You&apos;ll need to securely save your private key</li>
                      <li>4. Your account will be activated for use</li>
                    </ol>
                  </div>
                </div>

                <div className="alert alert-warning">
                  <div className="text-left">
                    <h4 className="font-semibold mb-2">Important Security Note:</h4>
                    <p className="text-sm">
                      Your private key will be shown only ONCE. Make sure to save it in a secure location. We never
                      store your private keys on our servers.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCreateWallet}
                disabled={walletLoading}
                className={`btn btn-ethereum btn-lg w-full max-w-sm ${walletLoading ? "loading" : ""}`}
              >
                {walletLoading ? "Generating Wallet..." : "Generate My Wallet"}
              </button>

              <p className="text-sm text-base-content/60 mt-4">
                This process is completely free and takes just a few seconds
              </p>
            </div>
          </div>

          {/* Steps */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-center mb-8">How It Works</h3>
            <div className="steps steps-vertical lg:steps-horizontal w-full">
              <div className="step step-primary">
                <div className="text-left ml-4">
                  <h4 className="font-semibold">Generate</h4>
                  <p className="text-sm text-base-content/70">Create your unique wallet</p>
                </div>
              </div>
              <div className="step step-primary">
                <div className="text-left ml-4">
                  <h4 className="font-semibold">Secure</h4>
                  <p className="text-sm text-base-content/70">Save your private key safely</p>
                </div>
              </div>
              <div className="step step-primary">
                <div className="text-left ml-4">
                  <h4 className="font-semibold">Activate</h4>
                  <p className="text-sm text-base-content/70">Confirm and activate your account</p>
                </div>
              </div>
              <div className="step">
                <div className="text-left ml-4">
                  <h4 className="font-semibold">Use</h4>
                  <p className="text-sm text-base-content/70">Start using your wallet</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Modal */}
      {walletData && (
        <WalletModal
          isOpen={showModal}
          walletData={walletData}
          onClose={() => setShowModal(false)}
          onComplete={handleWalletComplete}
        />
      )}
    </div>
  );
}
