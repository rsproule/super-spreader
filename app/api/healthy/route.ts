import { getFrameHtmlResponse } from "@coinbase/onchainkit";
import { NextRequest, NextResponse } from "next/server";
import { NEXT_PUBLIC_URL } from "../../config";
import { Status, extractUser, getStatus } from "../status/getStatus";
import { farmHealPoint, heal } from "../infected/infect";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<Response> {
  // authenticate the user
  let message = await extractUser(req);
  let healed: number[] = [];
  let healPoints: number = 0;
  let isHealth: boolean = false;

  if (!message || !message.valid) {
    console.log("Unauthorized", { status: 401 });
  } else {
    let status = await getStatus(message.interactor.fid);
    if (status !== Status.Healthy) {
      console.log("Invalid request, not healthy", { status: 400 });
    } else {
      if (message.button === 1) {
        // try to farm a heal point
        if (
          (message.liked && message.following && message.recasted) ||
          message.interactor.fid === message.raw.action.cast.author.fid
        ) {
          healPoints = await farmHealPoint(message.interactor.fid);
        }
      } else {
        isHealth = true;
        let targets = message.input
          .split(",")
          .map((input) => {
            let fid = parseInt(input.trim());
            // TODO: try to parse if they provide fname
            return fid;
          })
          .filter((fid) => !isNaN(fid) && fid !== message!.interactor.fid)
          .slice(0, 100);
        healed = await heal(message.interactor.fid, targets);
      }
    }
  }
  let imageFile = isHealth
    ? healed.length > 0
      ? "heal"
      : "heal-failed"
    : healPoints > 0
      ? "hp-farm"
      : "hp-farm-failed";
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
