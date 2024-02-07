import {
  FrameValidationData,
  getFrameHtmlResponse,
} from "@coinbase/onchainkit";
import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { NextRequest, NextResponse } from "next/server";
import { NEXT_PUBLIC_URL } from "../../config";
import { farmHealPoint, heal } from "../../db";
import { getFidsFromInput } from "../../utils";
import { Status, extractUser, getStatus } from "../status/getStatus";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<Response> {
  // authenticate the user
  const client = new NeynarAPIClient(process.env.NEYNAR_KEY!);
  let message = await extractUser(req);
  let imageFile = await getResultImage(client, message);

  // at the end we might want to go to a new page or just stay here
  let frame = getFrameHtmlResponse({
    buttons: [
      {
        label: `Get Status`,
      },
    ],
    image: `${NEXT_PUBLIC_URL}/${imageFile}.png`,
    post_url: `${NEXT_PUBLIC_URL}/api/status`,
  });

  return new NextResponse(frame, {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
}
export const GET = POST;

type HealFrameResponse = "heal" | "heal-failed" | "hp-farm" | "hp-farm-failed";

async function getResultImage(
  client: NeynarAPIClient,
  message: FrameValidationData | undefined
): Promise<HealFrameResponse> {
  if (!message || !message.valid) {
    console.log("Unauthorized", { status: 401 });
    return "heal-failed";
  }

  let status = await getStatus(message.interactor.fid);
  if (status !== Status.Healthy) {
    console.log("Invalid request, not healthy", { status: 400 });
    return "heal-failed";
  }

  if (message.button === 1) {
    // try to farm a heal point
    if (
      (message.liked && message.following && message.recasted) ||
      message.interactor.fid === message.raw.action.cast.author.fid
    ) {
      let healPoints = await farmHealPoint(message.interactor.fid);
      return healPoints > 0 ? "hp-farm" : "hp-farm-failed";
    }
  } else {
    let targets = await getFidsFromInput(client, message.input, 100);
    let notSelf = targets.filter((fid) => fid !== message!.interactor.fid);
    let healed = await heal(message.interactor.fid, notSelf);
    return healed.length > 0 ? "heal" : "heal-failed";
  }

  return "heal-failed";
}
