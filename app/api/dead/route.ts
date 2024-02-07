import { getFrameHtmlResponse } from "@coinbase/onchainkit";
import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { NextRequest, NextResponse } from "next/server";
import { NEXT_PUBLIC_URL } from "../../config";
import { MAX_CURSES } from "../../consts";
import { curse } from "../../db";
import { getFidsFromInput } from "../../utils";
import { Status, extractUser, getStatus } from "../status/getStatus";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<Response> {
  const client = new NeynarAPIClient(process.env.NEYNAR_KEY!);
  // authenticate the user
  let message = await extractUser(req);
  let cursed: number[] = [];
  if (!message || !message.valid) {
    console.log("Unauthorized", { status: 401 });
  } else {
    let status = await getStatus(message.interactor.fid);
    if (status !== Status.Dead) {
      console.log("Invalid request, not dead can't curse", { status: 400 });
    } else {
      let targets = await getFidsFromInput(client, message.input, MAX_CURSES);
      let notSelf = targets.filter((fid) => fid !== message!.interactor.fid);
      cursed = await curse(message.interactor.fid, notSelf);
    }
  }
  console.log("cursed", cursed);

  // at the end we might want to go to a new page or just stay here
  let frame = getFrameHtmlResponse({
    buttons: [
      {
        label: `Get Status`,
      },
    ],
    image: `${NEXT_PUBLIC_URL}/${cursed.length > 0 ? "curse" : "curse-failed"}.png`,
    post_url: `${NEXT_PUBLIC_URL}/api/status`,
  });

  return new NextResponse(frame, {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
}
export const GET = POST;
