"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import MyComponent from "./component";
import { config } from "./config";

const queryClient = new QueryClient();

export default function MyContainer() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <MyComponent />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
