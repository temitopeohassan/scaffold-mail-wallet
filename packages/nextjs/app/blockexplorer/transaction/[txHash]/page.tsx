import TransactionComp from "../_components/TransactionComp";
import { Hash } from "viem";
import { isZeroAddress } from "~~/utils/scaffold-eth/common";

type PageProps = {
  params: Promise<{ txHash?: string }>;
};

export const dynamic = "force-dynamic";

const TransactionPage = async ({ params }: PageProps) => {
  const { txHash: rawTxHash } = await params;
  const txHash = rawTxHash as Hash;

  if (isZeroAddress(txHash)) return null;

  return <TransactionComp txHash={txHash} />;
};

export default TransactionPage;
