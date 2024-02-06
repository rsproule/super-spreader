import { kv } from "@vercel/kv";
import {
  FrameRequest,
  FrameValidationData,
  getFrameMessage,
} from "@coinbase/onchainkit";
import { NextRequest } from "next/server";
import { getInfectionTime } from "../infected/infect";
import { DEATH_TIME } from "../../consts";

export enum Status {
  Infected = "infected",
  Dead = "dead",
  Healthy = "healthy",
}

export async function getStatus(fid: number): Promise<Status> {
  let timestamp = await getInfectionTime(fid);
  if (!timestamp) {
    return Status.Healthy;
  }
  const currentTime = Date.now();
  console.log("Current time", currentTime);
  if (currentTime - Number(timestamp) > DEATH_TIME) {
    return Status.Dead;
  } else {
    return Status.Infected;
  }
}

// async function getInfectionTime(fid: number): Promise<Infection | undefined> {
//   // this one is indexed because we need it in hot path
//   const res: string | null = await kv.get(`${INFECTION_KEY}:${fid}`);
//   return res ? JSON.parse(res) : undefined;
// }

// async function getAllInfections(fid: number): Promise<Infection[]> {
//   let cursor = 0;
//   let infections = [];
//   do {
//     const res = await kv.scan(cursor, {
//       match: `infections:${fid}:*`,
//       count: 2500,
//     });
//     cursor = res[0];
//     infections.push(...res[1].map((k) => JSON.parse(k)));
//   } while (cursor !== 0);
//   return infections;
// }

export async function extractUser(
  req: NextRequest
): Promise<FrameValidationData | undefined> {
  let body: FrameRequest;
  try {
    body = await req.json();
  } catch (e) {
    console.error("Failed to parse body", e);
    return undefined;
  }
  const { isValid, message } = await getFrameMessage(body, {
    neynarApiKey: process.env.NEYNAR_KEY,
  });

  if (!isValid) {
    console.error("Invalid message");
    return undefined;
  }
  return message;
}
