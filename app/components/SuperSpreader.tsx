"use client";
import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { useState, useEffect } from "react";

export function SuperSpreader() {
  const [infected, setInfected] = useState();
  useEffect(() => {
    const getInfected = async () => {
      let res = await fetch("/api/stats", { next: { revalidate: 1800 } });
      const _stats = await res.json();
      console.log(_stats);
      setInfected(_stats);
    };

    getInfected();
  }, []);
  return (
    <>
      <h1>Super Spreader</h1>
      {infected &&
        infected.timeline!.map((i: any) => (
          <p>
            {<UserDetails fid={i[0]} />} was infected at{" "}
            {new Date(i[1]).toLocaleString()}
          </p>
        ))}
    </>
  );
}

function UserDetails({ fid }: { fid: number }) {
  const [user, setUser] = useState();
  useEffect(() => {
    const getUser = async () => {
      let res = await fetch("/api/user?fid=" + fid, {
        next: { revalidate: 1800 },
      });
      const user = await res.json();
      console.log(user);
      setUser(user.user);
    };

    getUser();
  }, []);

  return user ? user.displayName! + "  @" + user.username! : fid;
}
