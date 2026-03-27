"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  isConnected,
  requestAccess,
  getAddress,
  getNetwork,
} from "@stellar/freighter-api";

const STORAGE_KEY = "bc_wallet_address";

interface WalletContextValue {
  publicKey: string | null;
  network: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextValue>({
  publicKey: null,
  network: null,
  isConnected: false,
  isConnecting: false,
  connect: async () => {},
  disconnect: () => {},
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Restore persisted connection on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    // Verify Freighter still has the address (extension may have been removed)
    isConnected()
      .then(async (res) => {
        if (!res.isConnected) {
          localStorage.removeItem(STORAGE_KEY);
          return;
        }
        const { address } = await getAddress();
        const { network: net } = await getNetwork();
        if (address === stored) {
          setPublicKey(address);
          setNetwork(net);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      })
      .catch(() => localStorage.removeItem(STORAGE_KEY));
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      const connected = await isConnected();
      if (!connected.isConnected) {
        window.open("https://www.freighter.app", "_blank");
        return;
      }
      await requestAccess();
      const { address } = await getAddress();
      const { network: net } = await getNetwork();
      setPublicKey(address);
      setNetwork(net);
      localStorage.setItem(STORAGE_KEY, address);
    } catch (err) {
      console.error("[WalletContext] connect error:", err);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setPublicKey(null);
    setNetwork(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <WalletContext.Provider
      value={{
        publicKey,
        network,
        isConnected: !!publicKey,
        isConnecting,
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext);
