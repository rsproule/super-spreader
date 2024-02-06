import { getFrameHtmlResponse } from "@coinbase/onchainkit";
import { NextRequest, NextResponse } from "next/server";
import { NEXT_PUBLIC_URL } from "../../config";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<Response> {
  console.log("attempt to spread");
  let imageUrl = `${NEXT_PUBLIC_URL}/api/image?text=spread`;
  // let postUrl= `${NEXT_PUBLIC_URL}/api/images/spread`;

  let frame = getFrameHtmlResponse({
    buttons: [
      {
        label: `Home`,
      },
    ],
    image: `${NEXT_PUBLIC_URL}/api/images/spread`,
    // image: `${NEXT_PUBLIC_URL}/api/image?text=spread`,
    post_url: `${NEXT_PUBLIC_URL}/`,
  });


  console.log(frame);
  return new NextResponse(frame, {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
}
export const GET = POST;
