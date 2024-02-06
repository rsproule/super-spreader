import { getFrameHtmlResponse } from "@coinbase/onchainkit";
import { NextRequest, NextResponse } from "next/server";
import { NEXT_PUBLIC_URL } from "../../config";
import {
  FrameButtonMetadata,
  FrameInputMetadata,
} from "@coinbase/onchainkit/dist/types/core/types";
import { Status } from "./getStatus";
export const dynamic = "force-dynamic";

function getButtons(
  status: Status
): [FrameButtonMetadata, ...FrameButtonMetadata[]] | undefined {
  switch (status) {
    case Status.Infected:
      return [{ label: "Infect!" }];
    case Status.Dead:
      return [{ label: "Divine Power!" }];
    case Status.Healthy:
      return [{ label: "Help the Cure! (must follow, like)" }];
    default:
      return undefined;
  }
}

function getInputString(status: Status): FrameInputMetadata | undefined {
  switch (status) {
    case Status.Infected:
      return { text: "fid(s) to infect" };
    case Status.Healthy:
      return { text: "fid(s) to rescue" };
    default:
      return undefined;
  }
}
export async function POST(req: NextRequest): Promise<Response> {
  let status: Status = Status.Infected;

  let frame = getFrameHtmlResponse({
    buttons: getButtons(status),
    input: getInputString(status),
    image: `${NEXT_PUBLIC_URL}/${status}.png`,
    post_url: `${NEXT_PUBLIC_URL}/api/${status}`,
  });

  console.log(frame);
  return new NextResponse(frame, {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
}
export const GET = POST;
