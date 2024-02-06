import { kv } from "@vercel/kv";
import {
  CURSE_COUNT_KEY,
  CURSE_KEY,
  HEAL_KEY,
  HEAL_POINTS_KEY,
  HEAL_POINT_CLAIMED_KEY,
  HEAL_POINT_TIME,
  INFECTION_COUNT_KEY,
  INFECTION_KEY,
  MAX_CURSES,
  MAX_INFECTIONS,
  DEATH_TIME,
} from "../../consts";

export async function infect(from: number, to: number[]): Promise<number[]> {
  let infected: number[] = [];
  let cursed = await kv.get(`${CURSE_KEY}:${from}`);
  if (cursed) {
    console.log("Cursed can't infect", cursed);
    return infected;
  }
  for (let target of to) {
    let targetInfected = await kv.get(`${INFECTION_KEY}:${target}`);
    if (targetInfected) {
      console.log("Already infected", targetInfected);
      continue;
    }
    // how many people have they infected
    let infectedCount = await kv.get(`${INFECTION_COUNT_KEY}:${from}`);
    await kv.incr(`infect_count:${from}`);
    if (infectedCount && Number(infectedCount) > MAX_INFECTIONS) {
      break;
    }

    // when was the person infected
    await kv.set(`${INFECTION_KEY}:${target}`, Date.now().toString());
    // who infected them
    await kv.set(`${INFECTION_KEY}:${from}:${target}`, Date.now().toString());
    infected.push(target);
  }

  return infected;
}

export async function heal(from: number, to: number[]): Promise<number[]> {
  let healed: number[] = [];
  let cursed = await kv.get(`${CURSE_KEY}:${from}`);
  if (cursed) {
    console.log("Cursed can't heal", cursed);
    return healed;
  }
  for (let target of to) {
    let targetInfected = await kv.get(`${INFECTION_KEY}:${target}`);
    if (!targetInfected) {
      console.log("Already healthy", targetInfected);
      continue;
    }
    if (
      targetInfected &&
      Date.now() - Number(targetInfected) > DEATH_TIME
    ) {
      console.log("Already dead", targetInfected);
      continue;
    }

    let totalHeals = await kv.get(`${HEAL_POINTS_KEY}`);
    if (totalHeals && Number(totalHeals) < 0) {
      console.log("No HPs to heal", targetInfected);
      break;
    }

    // decrement the heal count
    await kv.decr(`${HEAL_POINTS_KEY}:${from}`);

    // increment th heal claim
    await kv.set(`${HEAL_KEY}:${from}`, Date.now().toString());

    await kv.set(`${HEAL_KEY}:${from}:${target}`, Date.now().toString());

    // heal the person
    await kv.del(`${INFECTION_KEY}:${target}`);

    healed.push(target);
  }

  return healed;
}

export async function curse(from: number, to: number[]): Promise<number[]> {
  let cursed: number[] = [];
  for (let target of to) {
    let targetInfected = await kv.get(`${CURSE_KEY}:${target}`);
    if (targetInfected) {
      console.log("Already cursed", targetInfected);
      continue;
    }
    // how many people have they cursed
    let curse_count = await kv.get(`${CURSE_COUNT_KEY}:${from}`);
    if (curse_count && Number(curse_count) > MAX_CURSES) {
      break;
    }
    await kv.incr(`${CURSE_COUNT_KEY}:${from}`);

    // set the target cursed
    await kv.set(`${CURSE_KEY}:${target}`, Date.now().toString());

    // set cursed by from
    await kv.set(`${CURSE_KEY}:${from}:${target}`, Date.now().toString());

    cursed.push(target);
  }

  //   return healed;
  return cursed;
}

export async function getInfectionTime(
  fid: number
): Promise<number | undefined> {
  // this one is indexed because we need it in hot path
  const res: string | null = await kv.get(`${INFECTION_KEY}:${fid}`);
  return res ? Number(res) : undefined;
}

export async function farmHealPoint(fid: number): Promise<number> {
  let lastClaimed = await kv.get(`${HEAL_POINT_CLAIMED_KEY}:${fid}`);
  if (lastClaimed) {
    let lastClaimedTime = Number(lastClaimed);
    if (Date.now() - lastClaimedTime < HEAL_POINT_TIME) {
      console.log("Can't claim yet", lastClaimedTime);
      return -1;
    }
  }
  return await kv.incr(`${HEAL_POINTS_KEY}:${fid}`);
}
