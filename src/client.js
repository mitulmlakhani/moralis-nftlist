import { createClient, configureChains } from "wagmi";

import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";

export const chains = [
  {
    id: 56, 
    name: "Binance Smart Chain",
    network: "bsc",
    rpcUrls: {
      default: "https://bsc-dataseed1.binance.org",
    },
    blockExplorers: {
      default: { name: "BscScan", url: "https://bscscan.com" },
      etherscan: { name: "BscScan", url: "https://bscscan.com" },
    },
    nativeCurrency: {
      name: "Binance Chain Native Token",
      symbol: "BNB",
      decimals: 18,
    }
  },
];

const { provider, webSocketProvider } = configureChains(chains, [
  jsonRpcProvider({
    rpc: (chain) => {
      if (chain.id !== chains[0].id) return null;
      return { http: chain.rpcUrls.default };
    },
    priority: 0
  }),
]);

export const connectors = [
  new MetaMaskConnector({
    chains,
  }),
  new WalletConnectConnector({
    chains,
    options: {
      qrcode: true,
      rpc: { [chains[0].id]:  chains[0].rpcUrls.default}
    },
  }),
];

const client = createClient({
  autoConnect: true,
  connectors: connectors,
  provider,
  webSocketProvider,
});

export default client;