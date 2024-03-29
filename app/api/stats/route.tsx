import { kv } from "@vercel/kv";
import { INFECTION_KEY } from "../../consts";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const fromFid = searchParams.get("fromFid");
  const toFid = searchParams.get("toFid");
  const action = searchParams.get("action");
  let timeline = await getTimeline(action, fromFid, toFid);
  let counts = await getCounts(action, fromFid);
  let infected = await getInfected();
  console.log({ timeline, counts });
  return NextResponse.json({ timeline, counts, infected });
}

async function getCounts(actionType: string | null, fromFid: string | null) {
  let cursor = 0;
  let countKeys = [];
  do {
    const res = await kv.scan(cursor, {
      match: `${actionType ? actionType : "*"}_count:${fromFid ? fromFid : "*"}`,
      count: 2500,
    });
    cursor = res[0];
    countKeys.push(...res[1]);
  } while (cursor !== 0);
  if (countKeys.length === 0) {
    return [];
  }
  let counts = await kv.mget(countKeys);
  return countKeys.map((key, i) => {
    return {
      action: key.split(":")[0],
      fid: key.split(":")[1],
      count: counts[i],
    };
  });
}

async function getInfected() {
  let cursor = 0;
  let infections = [];
  do {
    const res = await kv.scan(cursor, {
      match: `${INFECTION_KEY}:*`,
      count: 2500,
    });
    cursor = res[0];
    infections.push(...res[1]);
  } while (cursor !== 0);

  if (infections.length === 0) {
    return [];
  }
  return infections.filter((infection) => infection.split(":").length < 3);
}

async function getTimeline(
  actionType: string | null,
  fromFid: string | null,
  toFid: string | null
) {
  let cursor = 0;
  let infections = [];
  do {
    const res = await kv.scan(cursor, {
      match: `${actionType ? actionType : "*"}:${fromFid ? fromFid : "*"}:${toFid ? toFid : "*"}`,
      count: 2500,
    });
    cursor = res[0];
    infections.push(...res[1]);
  } while (cursor !== 0);

  if (infections.length === 0) {
    return [];
  }

  let infectedTimes = await kv.mget(infections);
  console.log({ infectedTimes });
  return infections
    .map((key, i) => {
      if (key.split(":").length < 3) return null;
      const parts = key.split(":");
      return {
        from_fid: Number(parts[1]),
        to_fid: Number(parts[2]),
        timestamp: infectedTimes[i],
        action: parts[0],
      } as Interaction;
    })
    .filter((interaction) => interaction !== null)
    .sort((a, b) => b!.timestamp - a!.timestamp);
}

export interface Interaction {
  from_fid: number;
  to_fid: number;
  timestamp: number;
  action: string;
}
