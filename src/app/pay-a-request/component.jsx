"use client";

import { useEthersV5Provider } from "@/hooks/use-ethers-v5-provider";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { getPaymentNetworkExtension } from "@requestnetwork/payment-detection";
import {
  approveErc20,
  hasErc20Approval,
  hasSufficientFunds,
  payRequest,
} from "@requestnetwork/payment-processor";
import { RequestNetwork, Types } from "@requestnetwork/request-client.js";
import Link from "next/link";
import { useState } from "react";
import { useAccount } from "wagmi";
import styles from "./page.module.css";
import { useEthersV5Signer } from "@/hooks/use-ethers-v5-signer";

const APP_STATUS = {
  WAITING_INPUT: 0,
  PERSISTING_TO_IPFS: 1,
  PERSISTING_ON_CHAIN: 2,
  REQUEST_CONFIRMED: 3,
  APPROVING: 4,
  APPROVED: 5,
  ERROR_OCCURRED: -1,
};

const APP_STAUTS_ARR = [
  "waiting input",
  "persisting to ipfs",
  "persisting on chain",
  "request confirmed",
  "approving",
  "approved",
  "error occurred",
];

export default function PayARequestComponent({ requestId }) {
  const provider = useEthersV5Provider();
  const signer = useEthersV5Signer();
  const [approveLog, setApproveLog] = useState([]);
  const { address, isConnecting, isDisconnected } = useAccount();
  const [approveStatus, setApproveStatus] = useState(
    APP_STATUS.REQUEST_CONFIRMED
  );
  const [requestData, setRequestData] = useState({});

  const approve = async () => {
    setApproveStatus(APP_STATUS.APPROVING);
    const requestClient = new RequestNetwork({
      nodeConnectionConfig: {
        baseURL: "https://sepolia.gateway.request.network/",
      },
    });

    try {
      const request = await requestClient.fromRequestId(requestId);
      const requestData = request.getData();

      const _hasSufficientFunds = await hasSufficientFunds({
        request: requestData,
        address,
        providerOptions: { provider: provider },
      });

      const log = [];

      log.push(`_hasSufficientFunds = ${_hasSufficientFunds}`);

      setApproveLog([...approveLog, , ...log]);

      if (!_hasSufficientFunds) {
        setApproveStatus(APP_STATUS.REQUEST_CONFIRMED);
        return;
      }

      if (
        getPaymentNetworkExtension(requestData)?.id ===
        Types.Extension.PAYMENT_NETWORK_ID.ERC20_FEE_PROXY_CONTRACT
      ) {
        log.push(`ERC20 Request detected. Checking approval...`);
        setApproveLog([...approveLog, ...log]);
        const _hasErc20Approval = await hasErc20Approval(
          requestData,
          address,
          provider
        );

        log.push(`_hasErc20Approval = ${_hasErc20Approval}`);
        setApproveLog([...approveLog, ...log]);
        if (!_hasErc20Approval) {
          const approvalTx = await approveErc20(requestData, signer);
          await approvalTx.wait(2);
        }
      }
      setApproveStatus(APP_STATUS.APPROVED);
    } catch (error) {
      setApproveStatus(APP_STATUS.ERROR_OCCURRED);
      alert(error);
    }
  };

  const payARequest = async () => {
    const requestClient = new RequestNetwork({
      nodeConnectionConfig: {
        baseURL: "https://sepolia.gateway.request.network/",
      },
    });

    try {
      const request = await requestClient.fromRequestId(requestId);
      let requestData = request.getData();

      const paymentTx = await payRequest(requestData, signer);
      await paymentTx.wait(2);

      while (requestData.balance?.balance < requestData.expectedAmount) {
        requestData = await request.refresh();
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      setRequestData(requestData);
    } catch (error) {
      console.error(error);
      alert(error);
    }
  };

  return (
    <main>
      <aside className={styles.gnb}>
        <h3>
          <Link href="/">Create a request</Link>
        </h3>
      </aside>
      <div className={styles.wallet}>
        <label htmlFor="payee-identity">Payee Identity</label>
        <ConnectButton />
      </div>
      <h2 className={styles.status}>
        App Status: {APP_STAUTS_ARR.at(approveStatus)}
      </h2>
      <div className={styles.flex}>
        <div>
          <button type="button" onClick={approve}>
            Approve
          </button>
          <h3>approve log</h3>
          {approveLog.map((log) => (
            <p key={crypto.randomUUID()}>{log}</p>
          ))}
        </div>
        <div>
          <button type="button" onClick={payARequest}>
            Pay a request
          </button>
          <p>{JSON.stringify(requestData)}</p>
        </div>
      </div>
    </main>
  );
}
