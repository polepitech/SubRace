// app/api/ig/uploadVideo/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const GRAPH = "https://graph.facebook.com/v20.0";
const share = true;

type UploadBody = {
  url?: string;  
  caption?: string;   
  winner?:string;
  second?:string;
  third?:string;

};

function errMsg(e: unknown) {
  return e instanceof Error ? e.message : String(e);
}



export async function POST(req: Request) {
  try {
    const IG_USER_ID = process.env.IG_USER_ID;
    const ACCESS_TOKEN = process.env.IG_LONG_TOKEN ?? process.env.ACCESS_TOKEN ?? "";

    if (!IG_USER_ID || !ACCESS_TOKEN) {
      return NextResponse.json(
        { step: "env", error: "Missing IG_USER_ID and/or IG_LONG_TOKEN" },
        { status: 500 }
      );
    }

    const body: UploadBody = await req.json();
    const videoUrl = body.url;
    const caption = body.caption || '';
    const winner = body.winner || null;
    const second = body.second || null;
    const third = body.third || null;

    const userTags: any[] = [];

    if (winner) {
      userTags.push({ username: winner, x: 0.5, y: 0.2 });
    }
    if (second) {
      userTags.push({ username: second, x: 0.5, y: 0.5 });
    }
    if (third) {
      userTags.push({ username: third, x: 0.5, y: 0.8 });
    }
    
    if (!videoUrl) {
      return NextResponse.json(
        { step: "input", error: "Provide body.video_url or configure S3 env (S3_BUCKET[, S3_PREFIX][, S3_KEY], AWS_REGION)" },
        { status: 400 }
      );
    }

    const params = new URLSearchParams({
      media_type: "REELS",
      video_url: videoUrl,
      share_to_feed: "true",
      caption: caption,
      access_token: ACCESS_TOKEN,
    });

    if (userTags.length > 0) {
      params.append("user_tags", JSON.stringify(userTags));
    }

    const res = await fetch(`${GRAPH}/${IG_USER_ID}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    const text = await res.text();

    let json: Record<string, unknown>;
    try { json = JSON.parse(text); } catch { json = { raw: text }}
    if (!res.ok || !json?.id) {
      return NextResponse.json({ step: "create_container", status: res.status, error: json }, { status: 502 });
    }

    const creation_id = String(json.id);
    return NextResponse.json({ ok: true, creation_id });
  } catch (e: unknown) {
    return NextResponse.json({ step: "fatal", error: errMsg(e) }, { status: 500 });
  }
}

