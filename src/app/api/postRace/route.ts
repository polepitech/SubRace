// app/api/ig/post/route.ts
import { NextResponse } from "next/server";
const GRAPH = "https://graph.facebook.com/v20.0";

const IG_USER_ID = process.env.IG_USER_ID!;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN!;
const BASE_URL = 'http://localhost:3000'

interface RacePayload {
  day: number;
  followers_number: number;
  winner: string;
  second: string;
  third: string;
}


export async function POST(req:Request) {
  if (!IG_USER_ID || !ACCESS_TOKEN || !BASE_URL) {
    return NextResponse.json({ error: "Missing IG_USER_ID / IG_LONG_TOKEN / BASE_URL" }, { status: 500 });
  }

  const body: RacePayload = await req.json();  
  const { day, followers_number, winner, second, third } = body;
  const CAPTION = generateCaption(body) || '';


  
  try{
    // 1) Upload sur le bucket S3
    const tos3 = await fetch('http://localhost:3000/api/tos3', {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }).then(r => r.json());

    if (!tos3.ok) return NextResponse.json({ step: "s3", error: tos3 }, { status: 500 });
    
    // 2) Upload vers Instagram
    const toIgMedia = await fetch("http://localhost:3000/api/uploadVideo", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: JSON.stringify({ url: tos3.url, caption:CAPTION }),
    }).then(r => r.json());

    if (!toIgMedia.ok) return NextResponse.json({ step: "Insta_Media", error: toIgMedia }, { status: 500 });
    const creationId = toIgMedia.creation_id;

    console.log('✅ Media publié, ',creationId);
    console.log('⌛️ on patiente 20s avant le post');
    await sleep(20000);

    // 3) Publier
    let published_id: string | null = null;
    let lastError: any = null;
    const maxTries = 5;
    let delay = 0;


    for (let attempt = 1; attempt <= maxTries; attempt++) {
      console.log('on essaye de publich, attemp: ',attempt)

      const res = await fetch(`${GRAPH}/${IG_USER_ID}/media_publish`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          creation_id: creationId,
          access_token: ACCESS_TOKEN,
        }),
      });
      const json = (await res.json()) as Record<string, any>;


      if (res.ok && json?.id) {
        published_id = String(json.id);
        break; 
      }

      const code = json?.error?.code ?? json?.code;
      if (code === 9007 && attempt < maxTries) {
        await sleep(5000+delay);
        delay += 5000;      
        lastError = json;
        continue;
      }
        lastError = { status: res.status, ...json };
        break;

    }
    if (!published_id) {
      return NextResponse.json({ step: "publish", error: lastError }, { status: 502 });
    }



    // Étape 4: Appeler ta route DB
    const raceData = {
      day: day,
      followers_number: followers_number,
      winner: winner,
      second: second,
      third: third,
      postId: published_id, 
      mediaId: creationId,
    };

    const dbRes = await fetch('http://localhost:3000/api/races', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(raceData),
    }).then((r) => r.json());

    return NextResponse.json({
      ok: true
    });

  } catch (e: Error | unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.log('❌ erreur lors du post',msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }

}

function generateCaption(data: RacePayload): string {
  return `🏁 Daily Race #${data.day} !!
  🔥 ${data.followers_number.toLocaleString()} followers fought today!

  🥇 1st: @${data.winner}
  🥈 2nd: @${data.second}
  🥉 3rd: @${data.third}

  ➡️ Follow me for tomorrow's race! 🚀`;
}

async function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

