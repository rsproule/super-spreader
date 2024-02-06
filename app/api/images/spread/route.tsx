import satori from "satori";
import sharp from "sharp";
import { join } from "path";
import * as fs from "fs";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const interRegPath = join(process.cwd(), "public/roboto.ttf");
let interReg = fs.readFileSync(interRegPath);

export async function GET() {
  console.log("spread page");
  const svg = await satori(
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
      this is the spread
    </div>,
    {
      width: 600,
      height: 400,
      fonts: [
        {
          name: "Inter",
          data: interReg,
          weight: 400,
          style: "normal",
        },
      ],
    }
  );
  const img = await sharp(Buffer.from(svg))
    .resize(1200)
    .toFormat("png")
    .toBuffer();
  new NextResponse(img, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "max-age=10",
    },
  });
}
