// app/api/output/route.ts
import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export async function GET() {
  const filePath = path.join(process.cwd(), "output.mp4");
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "output.mp4 not found" }, { status: 404 });
  }

  const stat = fs.statSync(filePath);
  const stream = fs.createReadStream(filePath); // ← STREAM (lecture par chunks)

  return new NextResponse(stream, {
    status: 200,
    headers: {
      "Content-Type": "video/mp4",
      "Content-Length": String(stat.size),
      "Cache-Control": "no-store",
    },
  });
}
