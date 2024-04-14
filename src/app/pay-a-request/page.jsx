import dynamic from "next/dynamic";
import MyContainer from "../container";

const PayARequestComponent = dynamic(() => import("./component"), {
  ssr: false,
});

export default function PayARequestPage({ searchParams }) {
  return (
    <MyContainer>
      <PayARequestComponent requestId={searchParams.requestId} />
    </MyContainer>
  );
}
