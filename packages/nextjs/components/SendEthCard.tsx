"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Send } from "lucide-react";
import { toast } from "react-hot-toast";
import type { Address } from "viem";
import { createWalletClient, formatEther, isAddress, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { useBalance } from "wagmi";
import { AddressInput, EtherInput } from "~~/components/scaffold-eth";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { getScaffoldRpcTransport } from "~~/utils/scaffold-eth";

const sessionStorageKey = (address: string) => `ew-unlock-pk:${address.toLowerCase()}`;

function normalizePrivateKey(input: string): `0x${string}` | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const hex = trimmed.startsWith("0x") ? trimmed : `0x${trimmed}`;
  if (!/^0x[0-9a-fA-F]{64}$/.test(hex)) return null;
  return hex as `0x${string}`;
}

type SendEthCardProps = {
  ethWalletAddress: string;
  onSent?: () => void;
};

export function SendEthCard({ ethWalletAddress, onSent }: SendEthCardProps) {
  const { targetNetwork } = useTargetNetwork();
  const [privateKeyInput, setPrivateKeyInput] = useState("");
  const [unlockedKey, setUnlockedKey] = useState<`0x${string}` | null>(null);

  const ethWalletClient = useMemo(() => {
    if (!unlockedKey) return undefined;
    let account;
    try {
      account = privateKeyToAccount(unlockedKey);
    } catch {
      return undefined;
    }
    if (account.address.toLowerCase() !== ethWalletAddress.toLowerCase()) return undefined;

    return createWalletClient({
      account,
      chain: targetNetwork,
      transport: getScaffoldRpcTransport(targetNetwork.id),
    });
  }, [unlockedKey, ethWalletAddress, targetNetwork]);

  const tx = useTransactor(ethWalletClient);

  useEffect(() => {
    setUnlockedKey(null);
    if (typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem(sessionStorageKey(ethWalletAddress));
      if (!raw) return;
      const normalized = normalizePrivateKey(raw);
      if (!normalized) {
        sessionStorage.removeItem(sessionStorageKey(ethWalletAddress));
        return;
      }
      const account = privateKeyToAccount(normalized);
      if (account.address.toLowerCase() !== ethWalletAddress.toLowerCase()) {
        sessionStorage.removeItem(sessionStorageKey(ethWalletAddress));
        return;
      }
      setUnlockedKey(normalized);
    } catch {
      // ignore
    }
  }, [ethWalletAddress]);

  const [recipient, setRecipient] = useState<Address | string>("");
  const [amount, setAmount] = useState("");
  const [sending, setSending] = useState(false);

  const { data: ethBalance, refetch: refetchEthBalance } = useBalance({
    address: ethWalletAddress as Address,
    chainId: targetNetwork.id,
    query: { enabled: Boolean(ethWalletAddress) },
  });

  const persistSessionKey = useCallback(
    (key: `0x${string}`) => {
      try {
        sessionStorage.setItem(sessionStorageKey(ethWalletAddress), key);
      } catch {
        // ignore quota / private mode
      }
    },
    [ethWalletAddress],
  );

  const clearSessionKey = useCallback(() => {
    try {
      sessionStorage.removeItem(sessionStorageKey(ethWalletAddress));
    } catch {
      // ignore
    }
  }, [ethWalletAddress]);

  const handleUnlock = () => {
    const normalized = normalizePrivateKey(privateKeyInput);
    if (!normalized) {
      toast.error("Enter a valid 64-character hex private key (with or without 0x)");
      return;
    }
    let account;
    try {
      account = privateKeyToAccount(normalized);
    } catch {
      toast.error("Invalid private key");
      return;
    }
    if (account.address.toLowerCase() !== ethWalletAddress.toLowerCase()) {
      toast.error("This private key does not match your EthWallet address on this account");
      return;
    }
    setUnlockedKey(normalized);
    persistSessionKey(normalized);
    setPrivateKeyInput("");
    toast.success("EthWallet ready — sends will use this address");
  };

  const handleLock = () => {
    setUnlockedKey(null);
    clearSessionKey();
    toast.success("Signing key cleared from this tab");
  };

  const handleSend = async () => {
    if (!ethWalletClient) {
      toast.error("Unlock your EthWallet with its private key first");
      return;
    }
    const from = ethWalletClient.account.address;
    const to = typeof recipient === "string" ? recipient.trim() : recipient;
    if (!to || !isAddress(to)) {
      toast.error("Enter a valid recipient address");
      return;
    }
    if (to.toLowerCase() === from.toLowerCase()) {
      toast.error("Recipient cannot be your own address");
      return;
    }
    const parsed = parseFloat(amount);
    if (Number.isNaN(parsed) || parsed <= 0) {
      toast.error("Enter a valid amount greater than zero");
      return;
    }

    setSending(true);
    try {
      await tx({
        to: to as Address,
        value: parseEther(amount),
      });
      setRecipient("");
      setAmount("");
      await refetchEthBalance();
      onSent?.();
    } catch {
      // useTransactor shows errors
    } finally {
      setSending(false);
    }
  };

  const balanceLabel =
    ethBalance?.value !== undefined
      ? `${parseFloat(formatEther(ethBalance.value)).toFixed(6)} ${targetNetwork.nativeCurrency.symbol}`
      : "—";

  const isUnlocked = Boolean(ethWalletClient);

  return (
    <div className="card bg-base-100 shadow-lg lg:col-span-2">
      <div className="card-body">
        <h2 className="card-title">
          <Send className="w-5 h-5" />
          Send {targetNetwork.nativeCurrency.symbol}
        </h2>
        <p className="text-sm text-base-content/70 mb-2">
          Sends are signed locally with your EthWallet private key and broadcast from{" "}
          <span className="font-mono break-all">{ethWalletAddress}</span>. Your key is not sent to our servers. It was
          shown once when you created your wallet — paste it here to authorize sends. If you choose to unlock, it can be
          remembered only for this browser tab (session storage).
        </p>

        <div className="space-y-4">
          {!isUnlocked ? (
            <div className="space-y-3">
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text">EthWallet private key</span>
                </label>
                <input
                  type="password"
                  autoComplete="off"
                  spellCheck={false}
                  className="input input-bordered w-full font-mono text-sm"
                  placeholder="0x… or 64 hex characters"
                  value={privateKeyInput}
                  onChange={e => setPrivateKeyInput(e.target.value)}
                />
              </div>
              <button type="button" className="btn btn-primary" onClick={handleUnlock}>
                Unlock to send from EthWallet
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <span className="badge badge-success badge-outline">Unlocked for this tab</span>
              <button type="button" className="btn btn-ghost btn-sm" onClick={handleLock}>
                Clear key from this tab
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 text-sm">
            <span className="text-base-content/70">Sending from</span>
            <span className="font-mono break-all">{ethWalletAddress}</span>
          </div>
          <div className="text-sm">
            <span className="text-base-content/70">Available on {targetNetwork.name}: </span>
            <span className="font-medium">{balanceLabel}</span>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text">Recipient address</span>
              </label>
              <AddressInput
                placeholder="0x… or ENS"
                value={recipient ?? ""}
                onChange={value => setRecipient(value as Address | string)}
                disabled={sending || !isUnlocked}
              />
            </div>
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text">Amount</span>
              </label>
              <EtherInput placeholder="0.0" value={amount} onChange={setAmount} disabled={sending || !isUnlocked} />
            </div>
          </div>

          <button
            type="button"
            className={`btn btn-primary ${sending ? "loading" : ""}`}
            onClick={() => void handleSend()}
            disabled={sending || !isUnlocked || !recipient || !amount}
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
