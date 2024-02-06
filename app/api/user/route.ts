import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest): Promise<Response> {
  const { searchParams } = req.nextUrl;
  const fid = searchParams.get("fid");

  const client = new NeynarAPIClient(process.env.NEYNAR_KEY!);
  const user = await client.lookupUserByFid(Number(fid));

  return new Response(JSON.stringify(user.result), {
    headers: { "Content-Type": "application/json" },
  });
}
