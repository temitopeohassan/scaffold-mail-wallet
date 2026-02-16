'use client';

import React from 'react';
import Link from 'next/link';
import { Wallet } from 'lucide-react';

export default function Header() {
  return (
    <nav className="navbar bg-base-100 shadow-lg sticky top-0 z-50">
      <div className="navbar-start">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold">EthWallet</span>
        </div>
      </div>
      <div className="navbar-end">
        <Link href="/auth/login" className="btn btn-ghost mr-2">
          Sign In
        </Link>
        <Link href="/auth/signup" className="btn btn-primary">
          Get Started
        </Link>
      </div>
    </nav>
  );
}
