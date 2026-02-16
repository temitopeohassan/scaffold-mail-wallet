'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { api, WalletData } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface WalletContextType {
  walletData: WalletData | null;
  loading: boolean;
  generateWallet: (userId: string) => Promise<WalletData | null>;
  clearWallet: () => void;
  activateUser: (walletAddress: string) => Promise<boolean>;
}

const WalletContext = createContext<WalletContextType>({
  walletData: null,
  loading: false,
  generateWallet: async () => null,
  clearWallet: () => {},
  activateUser: async () => false,
});

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(false);

  const generateWallet = useCallback(async (userId: string): Promise<WalletData | null> => {
    setLoading(true);
    try {
      const response = await api.generateWallet(userId);
      if (response.success && response.data) {
        setWalletData(response.data);
        toast.success('Wallet generated successfully!');
        return response.data;
      } else {
        toast.error(response.error || 'Failed to generate wallet');
        return null;
      }
    } catch (error) {
      console.error('Wallet generation error:', error);
      toast.error('Failed to generate wallet');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearWallet = useCallback(() => {
    setWalletData(null);
  }, []);

  const activateUser = useCallback(async (walletAddress: string): Promise<boolean> => {
    try {
      const response = await api.activateUser(walletAddress);
      if (response.success) {
        toast.success('Account activated successfully!');
        return true;
      } else {
        toast.error(response.error || 'Failed to activate account');
        return false;
      }
    } catch (error) {
      console.error('Account activation error:', error);
      toast.error('Failed to activate account');
      return false;
    }
  }, []);

  const value = {
    walletData,
    loading,
    generateWallet,
    clearWallet,
    activateUser,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};