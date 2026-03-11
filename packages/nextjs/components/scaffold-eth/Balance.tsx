"use client";

import { type Address as AddressType } from "viem";
import { formatEther } from "viem";
import { useWatchBalance } from "~~/hooks/scaffold-eth/useWatchBalance";

type BalanceProps = {
  address?: AddressType | string;
  className?: string;
};

export const Balance = ({ address, className = "" }: BalanceProps) => {
  const {
    data: balance,
    isError,
    isLoading,
  } = useWatchBalance({
    address: address as AddressType | undefined,
  });

  if (!address) {
    return <span className={className}>0 ETH</span>;
  }

  if (isLoading) {
    return <span className={className}>...</span>;
  }

  if (isError || !balance) {
    return <span className={className}>0 ETH</span>;
  }

  const formatted = formatEther(balance.value);
  const display = Number(formatted) === 0 ? "0" : Number(formatted).toFixed(4);

  return <span className={className}>{display} ETH</span>;
};
