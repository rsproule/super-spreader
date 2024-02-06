import { getFrameHtmlResponse } from "@coinbase/onchainkit";
import { NextRequest, NextResponse } from "next/server";
import { NEXT_PUBLIC_URL } from "../../config";
import { Status, extractUser, getStatus } from "../status/getStatus";
import { curse } from "../infected/infect";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<Response> {
  // authenticate the user
  let message = await extractUser(req);
  console.log("message", message);
  let infected: number[] = [];
  if (!message || !message.valid) {
    console.log("Unauthorized", { status: 401 });
  } else {
    let status = await getStatus(message.interactor.fid);
    if (status !== Status.Dead) {
      console.log("Invalid request, not dead can't curse", { status: 400 });
    } else {
      let targets = message.input
        .split(",")
        .map((input) => {
          let fid = parseInt(input.trim());
          // TODO: try to parse if they provide fname
          // if (isNaN(fid)) {
          //   // if input is not a number, try to parse it as fname
          //   fid = parseFnameToId(input);
          // }
          return fid;
        })
        .filter((fid) => !isNaN(fid) && fid !== message!.interactor.fid)
        .slice(0, 5);
      infected = await curse(message.interactor.fid, targets);
    }
  }
  console.log("infected", infected);

  // at the end we might want to go to a new page or just stay here
  let frame = getFrameHtmlResponse({
    buttons: [
      {
        label: `Get Status`,
      },
    ],
    image: `${NEXT_PUBLIC_URL}/${infected.length > 0 ? "infect" : "infect-failed"}.png`,
    post_url: `${NEXT_PUBLIC_URL}/api/status`,
  });

  return new NextResponse(frame, {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
}
export const GET = POST;
