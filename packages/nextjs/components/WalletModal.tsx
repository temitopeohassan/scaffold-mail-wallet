"use client";

import React, { useEffect, useState } from "react";
import { WalletData } from "@/lib/api";
import { AlertTriangle, CheckCircle2, Copy, Eye, EyeOff, Shield } from "lucide-react";
import { toast } from "react-hot-toast";

interface WalletModalProps {
  isOpen: boolean;
  walletData: WalletData;
  onClose: () => void;
  onComplete: () => void;
}

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, walletData, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [copied, setCopied] = useState<"address" | "key" | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setShowPrivateKey(false);
      setCopied(null);
      setAcknowledged(false);
    }
  }, [isOpen]);

  const copyToClipboard = async (text: string, type: "address" | "key") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      toast.success(`${type === "address" ? "Address" : "Private key"} copied to clipboard`);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleComplete = () => {
    if (acknowledged) {
      onComplete();
      onClose();
    } else {
      toast.error("Please acknowledge that you have saved your private key");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-2xl">
        {/* Progress Steps */}
        <div className="steps steps-horizontal w-full mb-8">
          <div className={`step ${currentStep >= 1 ? "step-primary" : ""}`}>Your Wallet</div>
          <div className={`step ${currentStep >= 2 ? "step-primary" : ""}`}>Private Key</div>
          <div className={`step ${currentStep >= 3 ? "step-primary" : ""}`}>Security</div>
        </div>

        {/* Step 1: Wallet Address */}
        {currentStep === 1 && (
          <div className="animate-fade-in">
            <div className="text-center mb-6">
              <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
              <h3 className="text-2xl font-bold">Wallet Created Successfully!</h3>
              <p className="text-base-content/70">Your Ethereum wallet has been generated</p>
            </div>

            <div className="bg-base-200 rounded-lg p-6 mb-6">
              <label className="label">
                <span className="label-text font-semibold">Wallet Address</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  className="input input-bordered flex-1 font-mono text-sm"
                  value={walletData.walletAddress}
                  readOnly
                />
                <button
                  className={`btn btn-outline ${copied === "address" ? "btn-success" : ""}`}
                  onClick={() => copyToClipboard(walletData.walletAddress, "address")}
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-base-content/60 mt-2">
                This is your public wallet address. You can share this with others to receive ETH.
              </p>
            </div>

            <div className="flex justify-end">
              <button className="btn btn-primary" onClick={handleNextStep}>
                Next: View Private Key
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Private Key */}
        {currentStep === 2 && (
          <div className="animate-fade-in">
            <div className="text-center mb-6">
              <Shield className="w-16 h-16 text-warning mx-auto mb-4" />
              <h3 className="text-2xl font-bold">Your Private Key</h3>
              <p className="text-base-content/70">Keep this safe and never share it with anyone</p>
            </div>

            <div className="alert alert-warning mb-6">
              <AlertTriangle className="w-5 h-5" />
              <div>
                <h4 className="font-semibold">Important Security Notice</h4>
                <p className="text-sm">
                  This private key will only be shown ONCE. Make sure to save it securely. Anyone with access to this
                  key can control your wallet.
                </p>
              </div>
            </div>

            <div className="bg-base-200 rounded-lg p-6 mb-6">
              <label className="label">
                <span className="label-text font-semibold">Private Key</span>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowPrivateKey(!showPrivateKey)}>
                  {showPrivateKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type={showPrivateKey ? "text" : "password"}
                  className="input input-bordered flex-1 font-mono text-sm"
                  value={walletData.privateKey}
                  readOnly
                />
                <button
                  className={`btn btn-outline ${copied === "key" ? "btn-success" : ""}`}
                  onClick={() => copyToClipboard(walletData.privateKey, "key")}
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-base-content/60 mt-2">
                Use this private key to import your wallet into MetaMask or other wallet applications.
              </p>
            </div>

            <div className="flex justify-between">
              <button className="btn btn-ghost" onClick={() => setCurrentStep(1)}>
                Back
              </button>
              <button className="btn btn-primary" onClick={handleNextStep}>
                Next: Final Steps
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Security Confirmation */}
        {currentStep === 3 && (
          <div className="animate-fade-in">
            <div className="text-center mb-6">
              <Shield className="w-16 h-16 text-success mx-auto mb-4" />
              <h3 className="text-2xl font-bold">Secure Your Wallet</h3>
              <p className="text-base-content/70">Final security reminders</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="alert">
                <div>
                  <h4 className="font-semibold">✅ What you should do:</h4>
                  <ul className="text-sm mt-2 space-y-1">
                    <li>• Save your private key in a secure location (password manager, hardware wallet, etc.)</li>
                    <li>• Never share your private key with anyone</li>
                    <li>• Use strong passwords and 2FA on your accounts</li>
                    <li>• Keep your private key offline when possible</li>
                  </ul>
                </div>
              </div>

              <div className="alert alert-error">
                <div>
                  <h4 className="font-semibold">❌ What you should NOT do:</h4>
                  <ul className="text-sm mt-2 space-y-1">
                    <li>• Don&apos;t store your private key in emails, cloud drives, or text messages</li>
                    <li>• Don&apos;t share your private key on social media or messaging apps</li>
                    <li>• Don&apos;t enter your private key on suspicious websites</li>
                    <li>• Don&apos;t screenshot your private key on devices that sync to cloud</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="form-control mb-6">
              <label className="label cursor-pointer">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={acknowledged}
                  onChange={e => setAcknowledged(e.target.checked)}
                />
                <span className="label-text ml-3">
                  I understand that I am solely responsible for the security of my private key, and I have saved it in a
                  secure location.
                </span>
              </label>
            </div>

            <div className="flex justify-between">
              <button className="btn btn-ghost" onClick={() => setCurrentStep(2)}>
                Back
              </button>
              <button
                className={`btn btn-success ${!acknowledged ? "btn-disabled" : ""}`}
                onClick={handleComplete}
                disabled={!acknowledged}
              >
                Complete Setup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletModal;
