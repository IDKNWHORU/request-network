"use client";

import { RequestNetwork, Types } from "@requestnetwork/request-client.js";
import { Fragment, useEffect, useState } from "react";
import { formatUnits } from "viem";

export default function RequestContent({ user }) {
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    const requestClient = new RequestNetwork({
      nodeConnectionConfig: {
        baseURL: "https://sepolia.gateway.request.network/",
      },
    });

    try {
      const requests = await requestClient.fromIdentity({
        type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
        value: user,
      });

      setRequests(requests.map((request) => request.getData()));
    } catch (error) {
      console.error("Failed to fetch requests:", error);
      alert("Failed to fetch requests:", error);
    }
  };

  const calculateStatus = (state, expectedAmount, balance) => {
    if (balance >= expectedAmount) {
      return "Paid";
    }
    if (state === Types.RequestLogic.STATE.ACCEPTED) {
      return "Accepted";
    } else if (state === Types.RequestLogic.STATE.CANCELED) {
      return "Canceled";
    } else if (state === Types.RequestLogic.STATE.CREATED) {
      return "Created";
    } else if (state === Types.RequestLogic.STATE.PENDING) {
      return "Pending";
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <>
      {requests.map((request) => (
        <Fragment key={crypto.randomUUID()}>
          <tr>
            <td>{request?.timestamp}</td>
            <td>
              {request?.requestId.slice(0, 4)}
              ...
              {request?.requestId.slice(62, 66)}
            </td>
            <td>
              {request?.payer?.value.slice(0, 5)}...
              {request?.payer?.value.slice(39, 42)}
            </td>
            <td>FAU</td>
            <td>{formatUnits(BigInt(request?.expectedAmount), 18)}</td>
            <td>{request?.contentData.reason}</td>
            <td>{request?.contentData.dueDate}</td>
            <td>
              {calculateStatus(
                request?.state,
                BigInt(request?.expectedAmount),
                BigInt(request?.balance?.balance || 0)
              )}
            </td>
            <td>{formatUnits(BigInt(request?.balance?.balance || 0), 18)}</td>
          </tr>
        </Fragment>
      ))}
    </>
  );
}
