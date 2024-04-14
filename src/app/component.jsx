"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  RequestNetwork,
  Types,
  Utils,
} from "@requestnetwork/request-client.js";
import { Web3SignatureProvider } from "@requestnetwork/web3-signature";
import Link from "next/link";
import { useState } from "react";
import { parseUnits, zeroAddress } from "viem";
import { useAccount, useWalletClient } from "wagmi";
import styles from "./page.module.css";

const APP_STATUS = {
  WAITING_INPUT: 0,
  PERSISTING_TO_IPFS: 1,
  PERSISTING_ON_CHAIN: 2,
  REQUEST_CONFIRMED: 3,
  ERROR_OCCURRED: -1,
};

const APP_STAUTS_ARR = [
  "waiting input",
  "persisting to ipfs",
  "persisting on chain",
  "request confirmed",
  "error occurred",
];

export default function MyComponent() {
  const { data: walletClient } = useWalletClient();
  const { address, isConnecting, isDisconnected } = useAccount();
  const [requestData, setRequestData] = useState({});
  const [status, setStatus] = useState(APP_STATUS.WAITING_INPUT);

  const requestParameters = ({
    amount,
    payee,
    paymentRecipient,
    reason,
    dueDate,
  }) => {
    return {
      requestInfo: {
        currency: {
          type: Types.RequestLogic.CURRENCY.ERC20,
          value: "0x370DE27fdb7D1Ff1e1BaA7D11c5820a324Cf623C",
          network: "sepolia",
        },
        expectedAmount: parseUnits(amount, 18).toString(),
        payee: {
          type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
          value: payee,
        },
        timestamp: Utils.getCurrentTimestampInSecond(),
      },
      paymentNetwork: {
        id: Types.Extension.PAYMENT_NETWORK_ID.ERC20_FEE_PROXY_CONTRACT,
        parameters: {
          paymentNetworkName: "sepolia",
          paymentAddress: paymentRecipient || address,
          feeAddress: zeroAddress,
          feeAmount: "0",
        },
      },
      contentData: {
        reason: reason,
        // "🍕",
        dueDate: dueDate,
      },
      signer: {
        type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
        value: address,
      },
    };
  };

  const createRequest = async (formData) => {
    const web3SignatureProvider = new Web3SignatureProvider(walletClient);
    const requestClient = new RequestNetwork({
      nodeConnectionConfig: {
        baseURL: "https://sepolia.gateway.request.network/",
      },
      signatureProvider: web3SignatureProvider,
    });

    const _requestCreateParameters = requestParameters({
      amount: formData.get("amount"),
      payee: address,
      paymentRecipient: formData.get("payment-recipient"),
      reason: formData.get("reason"),
      dueDate: formData.get("due-date"),
    });

    if (formData.get("payer-identity").length > 0) {
      _requestCreateParameters.payer = {
        type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
        value: formData.get("payer-identity"),
      };
    }

    setStatus(APP_STATUS.PERSISTING_TO_IPFS);

    try {
      const request = await requestClient.createRequest(
        _requestCreateParameters
      );
      setStatus(APP_STATUS.PERSISTING_ON_CHAIN);
      setRequestData(request.getData());
      const confirmedRequestData = await request.waitForConfirmation();
      setStatus(APP_STATUS.REQUEST_CONFIRMED);
      setRequestData(confirmedRequestData);
    } catch (error) {
      setStatus(APP_STATUS.ERROR_OCCURRED);
      alert(error);
    }
  };

  const canSubmit = () => {
    return (
      address != null &&
      !isConnecting &&
      !isDisconnected &&
      [
        APP_STATUS.WAITING_INPUT,
        APP_STATUS.REQUEST_CONFIRMED,
        APP_STATUS.ERROR_OCCURRED,
      ].includes(status)
    );
  };

  const alertMessage = () => {
    alert("Create a request first!");
  };

  return (
    <main className={styles.main}>
      <aside className={styles.aside}>
        {requestData.requestId !== undefined ? (
          <h3>
            <Link href={`/pay-a-request?requestId=${requestData.requestId}`}>
              Pay a request
            </Link>
          </h3>
        ) : (
          <button className={styles.alert} type="button" onClick={alertMessage}>
            Pay a request
          </button>
        )}
      </aside>
      <form className={styles.form} action={createRequest}>
        <label htmlFor="payee-identity">Payee Identity</label>
        <ConnectButton />
        <h3>Request Form</h3>
        <label htmlFor="amount">Amount*</label>
        <input
          className={styles.input}
          type="number"
          name="amount"
          id="amount"
          placeholder="0"
        />
        <label htmlFor="payment-recipient">Payment Recipient</label>
        <input
          className={styles.input}
          type="text"
          name="payment-recipient"
          placeholder={address ?? ""}
          id="payment-recipient"
        />
        <label htmlFor="payer-identity">Payer Identity</label>
        <input
          className={styles.input}
          type="text"
          name="payer-identity"
          placeholder="0x..."
          id="payer-identity"
        />
        <label htmlFor="due-date">Due Date</label>
        <input
          className={styles.input}
          type="date"
          name="due-date"
          id="due-date"
        />
        <label htmlFor="reason">Reason</label>
        <input className={styles.input} type="text" name="reason" id="reason" />
        <button className={styles.button} type="submit" disabled={!canSubmit()}>
          Create a request
        </button>
      </form>
      <h4>STATUS: {APP_STAUTS_ARR.at(status)}</h4>
      <p className={styles.code}>{JSON.stringify(requestData ?? {})}</p>
    </main>
  );
}
