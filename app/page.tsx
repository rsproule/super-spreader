import { getFrameMetadata } from "@coinbase/onchainkit";
import type { Metadata } from "next";
import { NEXT_PUBLIC_URL } from "./config";
import { SuperSpreader } from "./components/SuperSpreader";

const frameMetadata = getFrameMetadata({
  buttons: [
    {
      label: "Get My Status",
    },
    { label: "Stats", action: "post_redirect" },
  ],
  image: `${NEXT_PUBLIC_URL}/main.png`,
  post_url: `${NEXT_PUBLIC_URL}/api/status`,
});

export const metadata: Metadata = {
  title: "SuperSpreader",
  description: "A virtual virus has broken out on farcaster!",
  openGraph: {
    title: "SuperSpreader",
    description: "A virtual virus has broken out on farcaster!",
    images: [`${NEXT_PUBLIC_URL}/api/image?text=SuperSpreader`],
  },
  other: {
    ...frameMetadata,
  },
};

export default function Page() {
  return (
    <SuperSpreader/>
  );
}
