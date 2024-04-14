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
import { APP_STATUS, APP_STAUTS_ARR } from "@/enums/status";

export default function PayARequestComponent({ requestId }) {
  const provider = useEthersV5Provider();
  const signer = useEthersV5Signer();
  const [appLog, setAppLog] = useState([]);
  const { address, isConnecting, isDisconnected } = useAccount();
  const [status, setStatus] = useState(APP_STATUS.REQUEST_CONFIRMED);
  const [requestData, setRequestData] = useState({});

  const canApprove = () => {
    return (
      address != null &&
      !isConnecting &&
      !isDisconnected &&
      [APP_STATUS.REQUEST_CONFIRMED, APP_STATUS.ERROR_OCCURRED].includes(status)
    );
  };

  const canPay = () => {
    return (
      address != null &&
      !isConnecting &&
      !isDisconnected &&
      APP_STATUS.APPROVED === status
    );
  };

  const approve = async () => {
    setStatus(APP_STATUS.APPROVING);
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

      setAppLog([...appLog, , ...log]);

      if (!_hasSufficientFunds) {
        setStatus(APP_STATUS.REQUEST_CONFIRMED);
        return;
      }

      if (
        getPaymentNetworkExtension(requestData)?.id ===
        Types.Extension.PAYMENT_NETWORK_ID.ERC20_FEE_PROXY_CONTRACT
      ) {
        log.push(`ERC20 Request detected. Checking approval...`);
        setAppLog([...appLog, ...log]);
        const _hasErc20Approval = await hasErc20Approval(
          requestData,
          address,
          provider
        );

        log.push(`_hasErc20Approval = ${_hasErc20Approval}`);
        setAppLog([...appLog, ...log]);
        if (!_hasErc20Approval) {
          const approvalTx = await approveErc20(requestData, signer);
          await approvalTx.wait(2);
        }
      }
      setStatus(APP_STATUS.APPROVED);
    } catch (error) {
      setStatus(APP_STATUS.ERROR_OCCURRED);
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

      const log = [];
      while (requestData.balance?.balance < requestData.expectedAmount) {
        log.push(`balance = ${requestData.balance?.balance}`);
        setAppLog([...appLog, ...log]);
        requestData = await request.refresh();
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      log.push("payment detected!");
      setAppLog([...appLog, ...log]);
      setRequestData(requestData);
      setStatus(APP_STATUS.REQUEST_PAID);
    } catch (error) {
      setStatus(APP_STATUS.ERROR_OCCURRED);
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
        <h3>
          <Link href="/retrieve-a-users-requests">
            Retrieve a user's requests
          </Link>
        </h3>
        <h3 className={styles.link}>
          <Link
            href="https://sepolia.etherscan.io/address/0x370DE27fdb7D1Ff1e1BaA7D11c5820a324Cf623C#writeContract#F4"
            target="_blank"
          >
            Mint FAU Token
          </Link>
        </h3>
      </aside>
      <div className={styles.wallet}>
        <label htmlFor="payee-identity">Payee Identity</label>
        <ConnectButton />
      </div>
      <h3 className={styles.status}>App Status: {APP_STAUTS_ARR.at(status)}</h3>
      <div className={styles.flex}>
        <div className={styles.approve}>
          <button
            className={styles.button}
            type="button"
            onClick={approve}
            disabled={!canApprove()}
          >
            Approve
          </button>
          <h4>approve log</h4>
          <article className={styles.log}>
            {appLog.map((log) => (
              <p key={crypto.randomUUID()}>{log}</p>
            ))}
          </article>
        </div>
        <div className={styles["pay-a-request"]}>
          <button
            className={styles.button}
            type="button"
            onClick={payARequest}
            disabled={!canPay()}
          >
            Pay a request
          </button>
          <code className={styles.code}>{JSON.stringify(requestData)}</code>
        </div>
      </div>
    </main>
  );
}
