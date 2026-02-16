'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Wallet, Shield, Zap, Users, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Hero Section */}
      <div className="hero min-h-[80vh]">
        <div className="hero-content text-center">
          <div className="max-w-4xl">
            <div className="mb-8">
              <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <Wallet className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl font-bold text-balance mb-6">
                Your Gateway to the <span className="text-primary">Ethereum</span> Ecosystem
              </h1>
              <p className="text-xl text-base-content/70 max-w-2xl mx-auto text-balance">
                Generate secure Ethereum wallets instantly. Simple, secure, and user-friendly 
                wallet creation with enterprise-grade security.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link href="/auth/signup" className="btn btn-ethereum btn-lg">
                Create Your Wallet
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/auth/login" className="btn btn-outline btn-lg">
                Sign In
              </Link>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8 mt-16">
              <div className="card bg-base-100 shadow-xl card-hover">
                <div className="card-body text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="card-title justify-center">Bank-Grade Security</h3>
                  <p className="text-base-content/70">
                    Your private keys are never stored on our servers. 
                    Generate wallets securely with industry-standard encryption.
                  </p>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl card-hover">
                <div className="card-body text-center">
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-6 h-6 text-secondary" />
                  </div>
                  <h3 className="card-title justify-center">Instant Generation</h3>
                  <p className="text-base-content/70">
                    Create your Ethereum wallet in seconds. 
                    No waiting, no complicated setup process.
                  </p>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl card-hover">
                <div className="card-body text-center">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="card-title justify-center">User Friendly</h3>
                  <p className="text-base-content/70">
                    Designed for both beginners and experts. 
                    Simple interface with powerful functionality.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
