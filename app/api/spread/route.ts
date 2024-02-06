import { getFrameHtmlResponse } from '@coinbase/onchainkit';
import { NextRequest, NextResponse } from 'next/server';
import { NEXT_PUBLIC_URL } from '../../config';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest): Promise<Response> {
  console.log("attempt to spread")
  return new NextResponse(
    getFrameHtmlResponse({
      buttons: [
        {
          label: `Home`,
        },
      ],
      image: `${NEXT_PUBLIC_URL}/api/images/spread`,
      post_url: `${NEXT_PUBLIC_URL}/`
    })
  );
}
