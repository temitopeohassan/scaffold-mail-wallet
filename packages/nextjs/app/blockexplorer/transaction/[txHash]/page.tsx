import TransactionComp from "../_components/TransactionComp";
import { Hash } from "viem";
import { isZeroAddress } from "~~/utils/scaffold-eth/common";

type PageProps = {
  params: Promise<{ txHash?: string }>;
};

export function generateStaticParams() {
  // An workaround to enable static exports in Next.js, generating single dummy page.
  return [{ txHash: "0x0000000000000000000000000000000000000000" }];
}

const TransactionPage = async ({ params }: PageProps) => {
  const { txHash: rawTxHash } = await params;
  const txHash = rawTxHash as Hash;

  if (isZeroAddress(txHash)) return null;

  return <TransactionComp txHash={txHash} />;
};

export default TransactionPage;
