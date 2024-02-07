import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { NextRequest } from "next/server";
import { getFidsFromInput, getHealthyFollowerForUser } from "../../utils";

export async function GET(req: NextRequest): Promise<Response> {
  const client = new NeynarAPIClient(process.env.NEYNAR_KEY!);

  // const healthyFollowers = await getHealthyFollowerForUser(client, 1115, 50);
  const getFidForFname = await getFidsFromInput(client, "@rfs,anay,ster.eth", 1);

  return new Response(JSON.stringify(getFidForFname), {
    headers: { "Content-Type": "application/json" },
  });
}
