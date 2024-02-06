import { getFrameMetadata } from '@coinbase/onchainkit';
import type { Metadata } from 'next';
import { NEXT_PUBLIC_URL } from './config';

const frameMetadata = getFrameMetadata({
  buttons: [
    {
      label: 'status',
    },
    {
      label: 'infect',
    },
  ],
  image: `${NEXT_PUBLIC_URL}/api/image?text=Super%20Spreader`,
  input: {
    text: 'infect (fids or fnames)',
  },
  post_url: `${NEXT_PUBLIC_URL}/api/spread`,
});

export const metadata: Metadata = {
  title: 'SuperSpreader',
  // metadataBase: new URL(`${NEXT_PUBLIC_URL}`),
  description: 'A virtual virus has broken our on farcaster!',
  openGraph: {
    title: 'SuperSpreader',
    description: 'A virtual virus has broken our on farcaster!',
    images: [`${NEXT_PUBLIC_URL}/api/image?text=SuperSpreader`],
  },
  other: {
    ...frameMetadata,
  },
};

export default function Page() {
  return (
    <>
      <h1>Welcome to SuperSpreader</h1>
    </>
  );
}
