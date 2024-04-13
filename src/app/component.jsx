"use client";

import { getPaymentNetworkExtension } from "@requestnetwork/payment-detection";
import {
  approveErc20,
  hasErc20Approval,
  hasSufficientFunds,
  payRequest,
} from "@requestnetwork/payment-processor";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  RequestNetwork,
  Types,
  Utils,
} from "@requestnetwork/request-client.js";
import { Web3SignatureProvider } from "@requestnetwork/web3-signature";
import { useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import styles from "./page.module.css";
import { useEthersV5Provider } from "./use-ethers-v5-provider";
import { useEthersV5Signer } from "./use-ethers-v5-signer";
import Link from "next/link";
import { parseUnits, zeroAddress } from "viem";

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
  const { address } = useAccount();
  const [requestData, setRequestData] = useState({});
  const [payARequestData, setPayARequestData] = useState({});
  const [status, setStatus] = useState(APP_STATUS.WAITING_INPUT);
  const provider = useEthersV5Provider();
  const signer = useEthersV5Signer();

  const requestParameters = ({
    amount,
    payee,
    paymentRecipient,
    payeeIdentity,
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
          paymentAddress: paymentRecipient,
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
        value: payeeIdentity,
      },
    };
  };

  const createRequest = async (formData) => {
    console.log("hello");
    const web3SignatureProvider = new Web3SignatureProvider(walletClient);
    console.log("world");
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
      payeeIdentity: address,
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

  // const payARequest = async () => {
  //   const payerAddress = "0xE9Ca5e8243D25F4b7228844D2d80002e8F88B0aA";
  //   const requestClient = new RequestNetwork({
  //     nodeConnectionConfig: {
  //       baseURL: "https://sepolia.gateway.request.network/",
  //     },
  //   });

  //   const _request = await requestClient.fromRequestId(
  //     "016843a7356ab92ce7e3cc6b27931e129feb8267f41cfde36d9597af4903a8c2f4"
  //   );
  //   let _requestData = _request.getData();

  // const _hasSufficientFunds = await hasSufficientFunds(
  //   requestData,
  //   payerAddress,
  //   {
  //     provider: provider,
  //   }
  // );

  // const _hasErc20Approval = await hasErc20Approval(
  //   requestData,
  //   payerAddress,
  //   provider
  // );

  // if (!_hasErc20Approval) {
  //   const approvalTx = await approveErc20(requestData, signer);
  //   await approvalTx.wait(2);
  // }

  //   const paymentTx = await payRequest(_requestData, signer);
  //   await paymentTx.wait(2);

  //   while (_requestData.balance?.balance < _requestData.expectedAmount) {
  //     _requestData = await _request.refresh();
  //     await new Promise((resolve) => setTimeout(resolve, 1000));
  //   }
  //   setPayARequestData(_requestData);
  // };

  // const approve = async () => {
  //   const requestClient = new RequestNetwork({
  //     nodeConnectionConfig: {
  //       baseURL: "https://sepolia.gateway.request.network/",
  //     },
  //   });

  //   const _request = await requestClient.fromRequestId(requestData?.requestId);
  //   const _requestData = _request.getData();

  //   console.log(_requestData);

  //   const _hasSufficientFunds = await hasSufficientFunds({
  //     request: _requestData,
  //     address,
  //     providerOptions: { provider: provider },
  //   });
  //   alert(`_hasSufficientFunds = ${_hasSufficientFunds}`);
  //   if (!_hasSufficientFunds) {
  //     // setStatus(APP_STATUS.REQUEST_CONFIRMED);
  //     return;
  //   }
  //   if (
  //     getPaymentNetworkExtension(_requestData)?.id ===
  //     Types.Extension.PAYMENT_NETWORK_ID.ERC20_FEE_PROXY_CONTRACT
  //   ) {
  //     alert(`ERC20 Request detected. Checking approval...`);
  //     const _hasErc20Approval = await hasErc20Approval(
  //       _requestData,
  //       address,
  //       provider
  //     );
  //     alert(`_hasErc20Approval = ${_hasErc20Approval}`);
  //     if (!_hasErc20Approval) {
  //       const approvalTx = await approveErc20(_requestData, signer);
  //       await approvalTx.wait(2);
  //     }
  //   }
  // };

  return (
    <main className={styles.main}>
      <aside className={styles.aside}>
        <h3>
          <Link href={"/"}>Create a request</Link>
        </h3>
        {requestData.requestId !== undefined ? (
          <h3>
            <Link href={`/pay-a-request/${requestData.requestId}`}>
              Pay a request
            </Link>
          </h3>
        ) : null}
      </aside>
      <form className={styles.form} action={createRequest}>
        <h3>Request Form</h3>
        <label htmlFor="payee-identity">Payee Identity</label>
        <ConnectButton />
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
        <button className={styles.button} type="submit">
          Create a request
        </button>
      </form>
      <h4>STATUS: {APP_STAUTS_ARR[status]}</h4>
      <p className={styles.code}>{JSON.stringify(requestData ?? {})}</p>
    </main>
  );
}
