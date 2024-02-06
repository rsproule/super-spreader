import { kv } from "@vercel/kv";
import {
  FrameRequest,
  FrameValidationData,
  getFrameMessage,
} from "@coinbase/onchainkit";
import { NextRequest } from "next/server";
import { INFECTION_KEY, oneDayInMilliseconds } from "../../consts";
import { getInfectionTime } from "../infected/infect";

export enum Status {
  Infected = "infected",
  Dead = "dead",
  Healthy = "healthy",
}

export type Infection = {
  infected_fid: number;
  infector_fid: number;
  timestamp: number;
};

export async function getStatus(fid: number): Promise<Status> {
  let timestamp = await getInfectionTime(fid);
  if (!timestamp) {
    return Status.Healthy;
  }
  const currentTime = Date.now();
  console.log("Current time", currentTime);
  if (currentTime - Number(timestamp) > oneDayInMilliseconds) {
    return Status.Dead;
  } else {
    return Status.Infected;
  }
}


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
