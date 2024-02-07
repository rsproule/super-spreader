import { getFrameHtmlResponse } from "@coinbase/onchainkit";
import {
  FrameButtonMetadata,
  FrameInputMetadata,
} from "@coinbase/onchainkit/dist/types/core/types";
import { NextRequest, NextResponse } from "next/server";
import { NEXT_PUBLIC_URL } from "../../config";
import { Status, extractUser, getStatus } from "./getStatus";
import { getTweetFromFidsString } from "../../utils";
import { NeynarAPIClient } from "@neynar/nodejs-sdk";
export const dynamic = "force-dynamic";

function getButtons(
  status: Status
): [FrameButtonMetadata, ...FrameButtonMetadata[]] | undefined {
  switch (status) {
    case Status.Infected:
      return [
        { label: "Infect these users ⬆️" },
        { label: "Infect 10 followers" },
      ];
    case Status.Dead:
      return [{ label: "Curse!" }];
    case Status.Healthy:
      return [
        { label: "Claim HP! (follow, like, recast) 1/day" },
        { label: "Rescue!" },
      ];
    default:
      return undefined;
  }
}

function getInputString(status: Status): FrameInputMetadata | undefined {
  switch (status) {
    case Status.Infected:
      return { text: "fid(s) or usernames to infect" };
    case Status.Healthy:
      return { text: "fid(s) or usernames to rescue" };
    case Status.Dead:
      return { text: "fid(s) or usernames to curse" };
    default:
      return undefined;
  }
}
export async function POST(req: NextRequest): Promise<Response> {
  const client = new NeynarAPIClient(process.env.NEYNAR_KEY!);
  const { searchParams } = req.nextUrl;
  const fids = searchParams.get("fids");
  let message = await extractUser(req);
  if (!message || !message.valid) {
    return new NextResponse("Bad Request", { status: 400 });
  }
  if (message.button === 2) {
    return NextResponse.redirect(`${NEXT_PUBLIC_URL}`, {
      status: 302,
    });
  }
  if (message.button === 3) {
    console.log("redirect to cast");
    let tweet = await getTweetFromFidsString(client, fids!, "infected");
    return NextResponse.redirect(
      `https://warpcast.com/~/compose?text=${encodeURIComponent(tweet)}&embeds[]=${NEXT_PUBLIC_URL}`,
      {
        status: 302,
      }
    );
  }
  let status: Status = await getStatus(message.interactor.fid);

  let frame = getFrameHtmlResponse({
    buttons: getButtons(status),
    input: getInputString(status),
    image: `${NEXT_PUBLIC_URL}/${status}.png`,
    post_url: `${NEXT_PUBLIC_URL}/api/${status}`,
  });
  return new NextResponse(frame, {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
}

export async function GET(req: NextRequest): Promise<Response> {
  console.log("GET status");
  const { searchParams } = req.nextUrl;
  const fid = searchParams.get("fid");

  const status = await getStatus(parseInt(fid!));
  return NextResponse.json({ status: status }, { status: 200 });
}
