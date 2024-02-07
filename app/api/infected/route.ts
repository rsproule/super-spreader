import {
  FrameValidationData,
  getFrameHtmlResponse,
} from "@coinbase/onchainkit";
import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { NextRequest, NextResponse } from "next/server";
import { NEXT_PUBLIC_URL } from "../../config";
import { MAX_INFECTIONS } from "../../consts";
import { infect } from "../../db";
import { getFidsFromInput, getHealthyFollowerForUser } from "../../utils";
import { Status, extractUser, getStatus } from "../status/getStatus";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<Response> {
  const client = new NeynarAPIClient(process.env.NEYNAR_KEY!);
  // authenticate the user
  let message = await extractUser(req);
  let { image, infected } = await getResultImage(client, message);

  // at the end we might want to go to a new page or just stay here
  let frame = getFrameHtmlResponse({
    buttons: [
      {
        label: `Get Status`,
      },
      { label: "View Stats", action: "post_redirect" },
      { label: "Notify those infected!" },
    ],
    image: `${NEXT_PUBLIC_URL}/${image}.png`,
    post_url:
      infected && infected.length > 0
        ? `${NEXT_PUBLIC_URL}/api/status?fids=${infected.join(",")}`
        : `${NEXT_PUBLIC_URL}/api/status`,
  });

  return new NextResponse(frame, {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
}
export const GET = POST;

type InfectFrameResponse = "infect" | "infect-failed";

interface ResultResponse {
  image: InfectFrameResponse;
  infected: number[];
}

async function getResultImage(
  client: NeynarAPIClient,
  message: FrameValidationData | undefined
): Promise<ResultResponse> {
  if (!message || !message.valid) {
    console.log("Unauthorized", { status: 401 });
    return { image: "infect-failed", infected: [] };
  }

  let status = await getStatus(message.interactor.fid);
  if (status !== Status.Infected) {
    console.log("Invalid request, not infected can't infect", {
      status: 400,
    });
    return { image: "infect-failed", infected: [] };
  }

  let targets: number[] = [];
  if (message.button === 1) {
    targets = await getFidsFromInput(client, message.input, MAX_INFECTIONS);
  }

  if (message.button === 2) {
    targets = await getHealthyFollowerForUser(
      client,
      message.interactor.fid,
      MAX_INFECTIONS
    );
  }
  let notSelfTargets = targets.filter((fid) => fid !== message!.interactor.fid);
  let infected = await infect(message.interactor.fid, notSelfTargets);

  if (infected.length > 0) {
    return { image: "infect", infected: infected };
  }

  return { image: "infect-failed", infected: [] };
}
