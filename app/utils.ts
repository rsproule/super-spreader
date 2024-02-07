// i know i hate utils files but lets be real this is a one day hack project, get off my back

import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { Status, getStatus } from "./api/status/getStatus";

export async function getFidsFromInput(
  client: NeynarAPIClient,
  input: string,
  limit: number
): Promise<number[]> {
  // input can be a comma separated list of fids, or fnames or a single fname
  let inputs = input.split(",");
  let fids: number[] = [];
  let fnames: string[] = [];

  inputs.slice(0, limit).forEach((input: string) => {
    let fid = parseInt(input.trim());
    if (!isNaN(fid)) {
      fids.push(fid);
    } else {
      fnames.push(input.trim());
    }
  });
  let resolvedFids = await resolveFnames(client, fnames);
  return fids.concat(resolvedFids);
}

export async function resolveFnames(
  client: NeynarAPIClient,
  fnames: string[]
): Promise<number[]> {
  const users = await Promise.all(
    fnames.map((fname) =>
      client
        .lookupUserByUsername(fname)
        .catch((e) =>
          fname.startsWith("@")
            ? client.lookupUserByUsername(fname.slice(1))
            : null
        )
        .catch((e) => {
          console.error("Failed to resolve fname", e);
          return null;
        })
    )
  );
  return users
    .filter((user) => user !== null)
    .map((user) => user!.result.user.fid);
}

export async function getHealthyFollowerForUser(
  client: NeynarAPIClient,
  fid: number,
  limit: number
): Promise<number[]> {
  // "relevant" is followers that overlap with the second id
  const followersRes = await client.fetchUserFollowers(fid, { limit });

  let fids = followersRes.result.users.map((user) => user.fid);
  fids = fids.filter(async (fid) => {
    const status = await getStatus(fid);
    return status !== Status.Healthy;
  });

  let cursor = followersRes.result.next.cursor;
  while (cursor && fids.length < limit) {
    const nextRes = await client.fetchUserFollowers(fid, {
      limit,
      cursor,
    });
    fids = fids.concat(nextRes.result.users.map((user) => user.fid));
    fids = fids.filter(async (fid) => {
      const status = await getStatus(fid);
      return status !== Status.Healthy;
    });
    cursor = nextRes.result.next.cursor;
  }

  return fids;
}

export async function getTweetFromFidsString(
  client: NeynarAPIClient,
  fidsString: string,
  action: string
) {
  let res = await client.fetchBulkUsers(
    fidsString.split(",").map((fid) => parseInt(fid)),
    {}
  );
  let usernames = res.users.map((user) => "@" + user.username);

  return `I just ${action} ${usernames.join(" ")}!`;
}
