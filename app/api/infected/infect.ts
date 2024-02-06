import { kv } from "@vercel/kv";
import {
  CURSE_COUNT_KEY,
  CURSE_KEY,
  HEAL_POINTS_KEY,
  INFECTION_KEY,
  MAX_INFECTIONS,
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
    let infectedCount = await kv.get(`infect_count:${from}`);
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
    // how many people have they infected
    await kv.incr(`${HEAL_POINTS_KEY}:${from}`);

    let totalHeals = await kv.get(`${HEAL_POINTS_KEY}`);
    if (totalHeals && Number(totalHeals) < 0) {
      break;
    }

    // decrement the global heal count
    await kv.decr(`${HEAL_POINTS_KEY}`);

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
    if (!targetInfected) {
      console.log("Already healthy", targetInfected);
      continue;
    }
    // how many people have they infected
    await kv.incr(`${CURSE_COUNT_KEY}:${from}`);

    let totalHeals = await kv.get(`heal_count`);
    if (totalHeals && Number(totalHeals) < 0) {
      break;
    }

    // decrement the global heal count
    await kv.decr(`heal_count`);

    // when was the person infected
    await kv.del(`${INFECTION_KEY}:${target}`);

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