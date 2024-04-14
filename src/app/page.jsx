import MyContainer from "./container";
import dynamic from "next/dynamic";

const MyComponent = dynamic(() => import("./component"), { ssr: false });

export default function Home() {
  return (
    <MyContainer>
      <MyComponent />
    </MyContainer>
  );
}
