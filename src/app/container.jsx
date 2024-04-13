"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { config } from "./config";
import dynamic from "next/dynamic";

const queryClient = new QueryClient();
const MyComponent = dynamic(() => import("./component"), { ssr: false });

export default function MyContainer() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <MyComponent />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
