import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const text = searchParams.get("text");

  console.log({ req })
  return new ImageResponse(
    (
      <div
        style={{
          justifyContent: "center",
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          backgroundColor: "white",
          padding: 50,
          lineHeight: 1.2,
          fontSize: 24,
          color: "black",
        }}
      >
        <p>{text}</p>
      </div>
    ),
    {
      width: 600,
      height: 400,
    }
  );
}
