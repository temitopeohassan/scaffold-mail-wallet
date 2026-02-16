'use client';

import React from 'react';
import { Wallet } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer footer-center p-10 bg-base-200 text-base-content">
      <aside>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
            <Wallet className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg">EthWallet</span>
        </div>
        <p className="text-base-content/70">
          Secure Ethereum wallet generation for everyone
        </p>
        <p className="text-sm text-base-content/50">
          © 2025 SE2. All rights reserved.
        </p>
      </aside>
    </footer>
  );
}
