// app/api/tos3/route.ts
import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import path from "node:path";
import fs from "node:fs";

export const runtime = "nodejs"; // indispensable pour pouvoir utiliser fs

export async function POST() {
  try {
    const region = process.env.AWS_REGION || "us-east-1";
    const bucket = process.env.S3_BUCKET;
    const prefix = (process.env.S3_PREFIX || "").replace(/^\/+|\/+$/g, ""); // optionnel

    if (!bucket) {
      return NextResponse.json({ step: "env", error: "Missing S3_BUCKET" }, { status: 500 });
    }

    // ---- FICHIER LOCAL ----
    const filePath = path.join(process.cwd(), "output.mp4");
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ step: "file", error: "output.mp4 not found at project root" }, { status: 404 });
    }
    const stat = fs.statSync(filePath);
    if (!stat.size) {
      return NextResponse.json({ step: "file", error: "output.mp4 is empty" }, { status: 400 });
    }

    // ---- CLE S3 (Key) ----
    const baseName = "output.mp4"; // ou ajoute un timestamp si tu veux éviter l'écrasement
    const key = prefix ? `${prefix}/${baseName}` : baseName;

    // ---- CLIENT S3 ----
    const s3 = new S3Client({ region }); // les creds viennent de process.env ou de ton profil/role IAM

    // ---- UPLOAD PUBLIC ----
    console.log('⌛️ Envoi de la vidéo au bucket s3 ...')
    const put = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: fs.createReadStream(filePath),
      ContentType: "video/mp4",
      // ACL: "public-read",         
      CacheControl: "no-store",
    });

    const putRes = await s3.send(put);
    // console.log("S3 ETag:", putRes.ETag);

    const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

    return NextResponse.json({
      ok: true,
      bucket,
      key,
      size: stat.size,
      url: publicUrl,              // <-- à passer en video_url à l'API Instagram
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ step: "fatal", error: msg }, { status: 500 });
  }
}
