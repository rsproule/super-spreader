import { kv } from "@vercel/kv";
import { INFECTION_KEY } from "../../consts";
import { NextResponse } from "next/server";

export async function GET() {
  let cursor = 0;
  let infections = [];
  do {
    const res = await kv.scan(cursor, {
      match: `${INFECTION_KEY}:*`,
      count: 2500,
    });
    console.log(res);

    console.log({ res });
    cursor = res[0];
    infections.push(...res[1]);
  } while (cursor !== 0);

  let infectedTimes = await kv.mget(infections);
  let timeline = infections
    .filter((key) => key.split(":").length >= 3)
    .map((key, i) => {
      const parts = key.split(":");
      return {
        infected_fid: Number(parts[1]),
        infector_fid: Number(parts[2]),
        timestamp: infectedTimes[i],
      } as Infection;
    })
    .sort((a, b) => a.timestamp - b.timestamp);
  console.log(infectedTimes);
  return NextResponse.json({ timeline });
}
export interface Infection {
  infected_fid: number;
  infector_fid: number;
  timestamp: number;
}
