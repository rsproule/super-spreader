import { ImageResponse } from "next/og";

export async function GET() {
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
        test
      </div>
    ),
    {
      width: 600,
      height: 400,
    }
  );
}
