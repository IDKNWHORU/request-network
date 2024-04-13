"use client";

import {
  hasSufficientFunds,
  approveErc20,
  hasErc20Approval,
  payRequest,
} from "@requestnetwork/payment-processor";
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
import { getPaymentNetworkExtension } from "@requestnetwork/payment-detection";

export default function MyComponent() {
  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();
  const [requestData, setRequestData] = useState({});
  const [payARequestData, setPayARequestData] = useState({});
  const provider = useEthersV5Provider();
  const signer = useEthersV5Signer();

  const createRequest = async () => {
    const web3SignatureProvider = new Web3SignatureProvider(walletClient);
    const requestClient = new RequestNetwork({
      nodeConnectionConfig: {
        baseURL: "https://sepolia.gateway.request.network/",
      },
      signatureProvider: web3SignatureProvider,
    });

    const payeeIdentity = address;
    const payerIdentity = "0xE9Ca5e8243D25F4b7228844D2d80002e8F88B0aA";
    const paymentRecipient = payeeIdentity;
    const feeRecipient = "0x0000000000000000000000000000000000000000";

    const requestCreateParameters = {
      requestInfo: {
        // The currency in which the request is denominated
        currency: {
          type: Types.RequestLogic.CURRENCY.ERC20,
          value: "0x370DE27fdb7D1Ff1e1BaA7D11c5820a324Cf623C",
          network: "sepolia",
        },

        // The expected amount as a string, in parsed units, respecting `decimals`
        // Consider using `parseUnits()` from ethers or viem
        expectedAmount: "100000000000000000",

        // The payee identity. Not necessarily the same as the payment recipient.
        payee: {
          type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
          value: payeeIdentity,
        },

        // The payer identity. If omitted, any identity can pay the request.
        payer: {
          type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
          value: payerIdentity,
        },

        // The request creation timestamp.
        timestamp: Utils.getCurrentTimestampInSecond(),
      },

      // The paymentNetwork is the method of payment and related details.
      paymentNetwork: {
        id: Types.Extension.PAYMENT_NETWORK_ID.ERC20_FEE_PROXY_CONTRACT,
        parameters: {
          paymentNetworkName: "sepolia",
          paymentAddress: paymentRecipient,
          feeAddress: feeRecipient,
          feeAmount: "0",
        },
      },

      // The contentData can contain anything.
      // Consider using rnf_invoice format from @requestnetwork/data-format
      contentData: {
        reason: "🍕",
        dueDate: "2024.04.12",
      },

      // The identity that signs the request, either payee or payer identity.
      signer: {
        type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
        value: payeeIdentity,
      },
    };

    const request = await requestClient.createRequest(requestCreateParameters);

    setRequestData(request.getData());
    const confirmedRequestData = await request.waitForConfirmation();
    setRequestData(confirmedRequestData);
  };

  const payARequest = async () => {
    const payerAddress = "0xE9Ca5e8243D25F4b7228844D2d80002e8F88B0aA";
    const requestClient = new RequestNetwork({
      nodeConnectionConfig: {
        baseURL: "https://sepolia.gateway.request.network/",
      },
    });

    const _request = await requestClient.fromRequestId(
      "016843a7356ab92ce7e3cc6b27931e129feb8267f41cfde36d9597af4903a8c2f4"
    );
    let _requestData = _request.getData();

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

    const paymentTx = await payRequest(_requestData, signer);
    await paymentTx.wait(2);

    while (_requestData.balance?.balance < _requestData.expectedAmount) {
      _requestData = await _request.refresh();
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    setPayARequestData(_requestData);
  };

  const approve = async () => {
    const requestClient = new RequestNetwork({
      nodeConnectionConfig: {
        baseURL: "https://sepolia.gateway.request.network/",
      },
    });

    const _request = await requestClient.fromRequestId(requestData?.requestId);
    const _requestData = _request.getData();

    console.log(_requestData);

    const _hasSufficientFunds = await hasSufficientFunds({
      request: _requestData,
      address,
      providerOptions: { provider: provider },
    });
    alert(`_hasSufficientFunds = ${_hasSufficientFunds}`);
    if (!_hasSufficientFunds) {
      // setStatus(APP_STATUS.REQUEST_CONFIRMED);
      return;
    }
    if (
      getPaymentNetworkExtension(_requestData)?.id ===
      Types.Extension.PAYMENT_NETWORK_ID.ERC20_FEE_PROXY_CONTRACT
    ) {
      alert(`ERC20 Request detected. Checking approval...`);
      const _hasErc20Approval = await hasErc20Approval(
        _requestData,
        address,
        provider
      );
      alert(`_hasErc20Approval = ${_hasErc20Approval}`);
      if (!_hasErc20Approval) {
        const approvalTx = await approveErc20(_requestData, signer);
        await approvalTx.wait(2);
      }
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <button onClick={createRequest}>Create a request</button>
        <h3>Create Request Data</h3>
        <code>{JSON.stringify(requestData ?? {})}</code>
        <button onClick={approve}>approve</button>
        <button onClick={payARequest}>Pay a request</button>
        <h3>Pay A Request Data</h3>
        <code>{JSON.stringify(payARequestData ?? {})}</code>
      </div>
    </main>
  );
}
