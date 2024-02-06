"use client";
import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { useState, useEffect } from "react";
import { Infection, Interaction } from "../api/stats/route";
import {
  INFECTION_KEY,
  CURSE_KEY,
  HEAL_KEY,
  INFECTION_COUNT_KEY,
  CURSE_COUNT_KEY,
  HEAL_POINT_CLAIMED_KEY,
  HEAL_POINTS_KEY,
} from "../consts";
import { getStatus } from "../api/status/getStatus";

export function SuperSpreader() {
  const [stats, setStats] = useState();
  const [toFid, setToFid] = useState<number | undefined>();
  const [fid, setFid] = useState<number | undefined>();
  const [fromFid, setFromFid] = useState<number | undefined>();
  const [status, setStatus] = useState<string | undefined>();
  useEffect(() => {
    const getInfected = async () => {
      let res = await fetch(
        "/api/stats" +
          (fromFid ? "?fromFid=" + fromFid : "") +
          (toFid ? (fromFid ? "&" : "?") + "toFid=" + toFid : ""),
        {
          next: { revalidate: 1800 },
        }
      );
      const _stats = await res.json();
      setStats(_stats);
    };
    const getStatus = async () => {
      if (fid) {
        let res = await fetch("/api/status?fid=" + fid, {
          next: { revalidate: 1800 },
        });
        const _status = await res.json();
        // console.log({ _status });
        setStatus(_status.status);
      }
    };
    getInfected();
    getStatus();
  }, [fromFid, toFid, fid]);
  return (
    <>
      <h1>Super Spreader</h1>

      <input
        type="number"
        value={fid}
        onChange={(e) => setFid(Number(e.target.value))}
        placeholder="Search FID for status"
      />
      <div>Status: {status}</div>
      <hr/>

      <div>Enter FID to do some filtering of the timeline</div>
      <input
        id="fromFid"
        type="number"
        value={fromFid}
        onChange={(e) => setFromFid(Number(e.target.value))}
        placeholder="Enter From FID"
      />
      <input
        id="toFid"
        type="number"
        value={toFid}
        onChange={(e) => setToFid(Number(e.target.value))}
        placeholder="Enter To FID"
      />
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "300px" }}>
          {stats &&
            stats.timeline &&
            stats.timeline!.map((i: Interaction) => (
              <p>
                {<UserDetails fid={i.to_fid} />} was {getActionString(i.action)}{" "}
                at {new Date(i.timestamp).toLocaleString()} by{" "}
                {<UserDetails fid={i.from_fid} />}
              </p>
            ))}
        </div>
        <div style={{ flex: 1, minWidth: "300px" }}>
          {stats && stats && stats.counts && (
            <>
              {getCountTable(stats.counts, INFECTION_COUNT_KEY)}
              {getCountTable(stats.counts, CURSE_COUNT_KEY)}
              {getCountTable(stats.counts, HEAL_POINTS_KEY)}
              {getCountTable(stats.counts, HEAL_POINT_CLAIMED_KEY)}
            </>
          )}
        </div>
      </div>
    </>
  );
}

function getCountTable(counts: any, countFilter: string) {
  return (
    <>
      <h2>{countFilter}</h2>
      <table style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid black", padding: "5px" }}>User</th>
            <th style={{ border: "1px solid black", padding: "5px" }}>Count</th>
          </tr>
        </thead>
        <tbody>
          {counts
            .filter((count) => count.action === countFilter)
            .map((count) => (
              <tr key={count.fid}>
                <td style={{ border: "1px solid black", padding: "5px" }}>
                  <UserDetails fid={Number(count.fid)} />
                </td>
                <td style={{ border: "1px solid black", padding: "5px" }}>
                  {count.count}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </>
  );
}

function getActionString(action: string) {
  switch (action) {
    case INFECTION_KEY:
      return "Infected";
    case CURSE_KEY:
      return "Cursed";
    case HEAL_KEY:
      return "Healed";
  }
}

function UserDetails({ fid }: { fid: number }) {
  const [user, setUser] = useState();
  useEffect(() => {
    const getUser = async () => {
      let res = await fetch("/api/user?fid=" + fid, {
        next: { revalidate: 1800 },
      });
      const user = await res.json();
      setUser(user.user);
    };

    getUser();
  }, []);

  return user
    ? user.displayName! + "  @" + user.username! + " (FID: " + fid + ")"
    : fid;
}
