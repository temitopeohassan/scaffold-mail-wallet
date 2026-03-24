import { fallback, http, type Transport } from "viem";
import scaffoldConfig, { DEFAULT_ALCHEMY_API_KEY } from "~~/scaffold.config";
import { getAlchemyHttpUrl } from "~~/utils/scaffold-eth/networks";

/**
 * HTTP transport for a chain, matching wagmiConfig RPC selection (overrides → Alchemy → default).
 */
export function getScaffoldRpcTransport(chainId: number): Transport {
  const override = scaffoldConfig.rpcOverrides?.[chainId];
  if (override) return http(override);

  const alchemyHttpUrl = getAlchemyHttpUrl(chainId);
  if (alchemyHttpUrl) {
    const isUsingDefaultKey = scaffoldConfig.alchemyApiKey === DEFAULT_ALCHEMY_API_KEY;
    return isUsingDefaultKey ? fallback([http(), http(alchemyHttpUrl)]) : fallback([http(alchemyHttpUrl), http()]);
  }
  return http();
}
