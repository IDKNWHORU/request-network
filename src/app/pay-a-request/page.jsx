import dynamic from "next/dynamic";
import MyContainer from "../container";

// const MyComponent = dynamic(() => import("./component"), { ssr: false });

export default function PayARequestPage({ searchParams }) {
  console.log(searchParams.requestId);

  return <MyContainer>hello</MyContainer>;
}
