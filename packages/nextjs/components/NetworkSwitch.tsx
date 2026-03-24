"use client";

import { useCallback } from "react";
import { ChevronDown } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAccount, useSwitchChain } from "wagmi";
import { useGlobalState } from "~~/services/store/store";
import type { ChainWithAttributes } from "~~/utils/scaffold-eth";
import { getTargetNetworks } from "~~/utils/scaffold-eth";

const networkLabel: Record<number, string> = {
  1: "Ethereum",
  11155111: "Sepolia",
  10: "Optimism",
  8453: "Base",
  42161: "Arbitrum",
};

export function NetworkSwitch() {
  const targetNetwork = useGlobalState(s => s.targetNetwork);
  const setTargetNetwork = useGlobalState(s => s.setTargetNetwork);
  const { isConnected } = useAccount();
  const { switchChainAsync, isPending } = useSwitchChain();

  const networks = getTargetNetworks();

  const handleSelect = useCallback(
    async (chain: ChainWithAttributes) => {
      setTargetNetwork(chain);

      if (!isConnected || !switchChainAsync) return;

      try {
        await switchChainAsync({ chainId: chain.id });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Could not switch network";
        toast.error(message);
      }
    },
    [isConnected, setTargetNetwork, switchChainAsync],
  );

  const currentLabel = networkLabel[targetNetwork.id] ?? targetNetwork.name;

  return (
    <div className="dropdown dropdown-end">
      <div
        tabIndex={0}
        role="button"
        className={`btn btn-sm btn-outline gap-1 min-w-[9rem] justify-between ${isPending ? "loading" : ""}`}
        aria-label="Select network"
      >
        <span className="truncate text-left">{currentLabel}</span>
        <ChevronDown className="w-4 h-4 shrink-0 opacity-70" />
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content menu bg-base-100 rounded-box z-[60] w-52 p-2 shadow-lg border border-base-300 mt-1"
      >
        {networks.map(chain => {
          const label = networkLabel[chain.id] ?? chain.name;
          const selected = chain.id === targetNetwork.id;
          return (
            <li key={chain.id}>
              <button
                type="button"
                className={selected ? "active" : ""}
                onClick={() => void handleSelect(chain)}
                disabled={isPending}
              >
                {label}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
