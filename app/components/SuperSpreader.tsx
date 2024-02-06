"use client";
import { useState, useEffect } from "react";
import { Interaction } from "../api/stats/route";
import {
  INFECTION_KEY,
  CURSE_KEY,
  HEAL_KEY,
  INFECTION_COUNT_KEY,
  CURSE_COUNT_KEY,
  HEAL_POINT_CLAIMED_KEY,
  HEAL_COUNT_KEY,
} from "../consts";

export function SuperSpreader() {
  const [stats, setStats] = useState<any>();
  const [toFid, setToFid] = useState<number | undefined>();
  const [fid, setFid] = useState<number | undefined>();
  const [fromFid, setFromFid] = useState<number | undefined>();
  const [status, setStatus] = useState<string | undefined>();
      const [showRules, setShowRules] = useState(false);
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
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <h1>Super Spreader</h1>
      <p>
        Built by <a href="https://warpcast.com/rfs">@rfs</a>. Check out the code
        on <a href="https://github.com/rsproule/super-spreader">GitHub</a>.
      </p>


        <>
          <button onClick={() => setShowRules(!showRules)}>
            {showRules ? "Hide Rules" : "Show Rules"}
          </button>

          {showRules && (
            <div
              style={{ borderTop: "1px solid black", width: "60%", margin: "10px" }}
            >
              <h1>Super Spreader</h1>
              <p>
                A super spreader virtual virus has broken out on Farcaster! Will the
                community be able to band together to survive or will the virus win!
              </p>
              <p>
                Super spreader uses the farcaster frame feature to allow users to
                interact with the game without ever leaving the comfort of their
                farcaster client.
              </p>
              <h2>How to Play</h2>
              <h3>There are 3 states</h3>
              <ul>
                <li>healthy</li>
                <li>infected</li>
                <li>dead</li>
              </ul>
              <h3>There are a few actions you can take from each</h3>
              <h4>healthy</h4>
              <ul>
                <li>
                  claim hp: claim a health point that you can use to rescue the
                  infected
                </li>
                <li>
                  cure: cure an infected from their disease (costs 1 hp, must be
                  following, liked and recasted)
                </li>
              </ul>
              <h4>infected</h4>
              <ul>
                <li>infect: infect another farcaster user: limit 50</li>
              </ul>
              <h4>dead</h4>
              <ul>
                <li>
                  curse: curse another player: (limit 10) makes the other player
                  inert, no cure or infect
                </li>
              </ul>
            </div>
          )}
        </>
      <input
        type="number"
        value={fid}
        onChange={(e) => setFid(Number(e.target.value))}
        placeholder="Search FID for status"
      />
      <div>Status: {status}</div>
      <hr />

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
        <div
          style={{
            flex: 1,
            minWidth: "400px",
            border: "1px solid black",
            padding: "10px",
            margin: "10px",
          }}
        >
          <h3>Timeline</h3>
          {stats &&
            stats.timeline &&
            stats.timeline!.map((i: Interaction, index: number) => (
              <div
                key={index}
                style={{
                  border: "1px solid black",
                  padding: "2px",
                  margin: "2px",
                }}
              >
                <p>
                  {new Date(i.timestamp).toLocaleString()}:{" "}
                  {<UserDetails fid={i.from_fid} />}{" "}
                  <em>
                    <strong>{getActionString(i.action)}</strong>
                  </em>{" "}
                  {<UserDetails fid={i.to_fid} />}
                </p>
              </div>
            ))}
        </div>
        <div
          style={{
            flex: 1,
            minWidth: "400px",
            border: "1px solid black",
            padding: "10px",
            margin: "10px",
          }}
        >
          <h3>Stats</h3>
          {stats && stats && stats.counts && (
            <>
              {getCountTable(stats.counts, INFECTION_COUNT_KEY)}
              {getCountTable(stats.counts, CURSE_COUNT_KEY)}
              {getCountTable(stats.counts, HEAL_COUNT_KEY)}
              {getCountTable(stats.counts, HEAL_POINT_CLAIMED_KEY)}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function getCountTable(counts: any, countFilter: string) {
  return (
    <>
      <h4>{countFilter}</h4>
      <table style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid black", padding: "5px" }}>User</th>
            <th style={{ border: "1px solid black", padding: "5px" }}>Count</th>
          </tr>
        </thead>
        <tbody>
          {counts
            .filter((count: any) => count.action === countFilter)
            .map((count: any) => (
              <tr key={count.fid}>
                <td style={{ border: "1px solid black", padding: "5px" }}>
                  <UserDetails fid={Number(count.fid)} />
                </td>
                <td style={{ border: "1px solid black", padding: "5px" }}>
                  {Math.abs(count.count)}
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
  const [user, setUser] = useState<any>();
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

  return user ? (
    <a href={`https://warpcast.com/${user.username}`}>
      {user.displayName!}-(#{fid})
    </a>
  ) : (
    fid
  );
}
