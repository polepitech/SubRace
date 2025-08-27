import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

export async function POST(req) {
  try {

    console.log('⌛️ export de la video');

    //////// V2 ////////
    const form = await req.formData();

    // Récupère les fichiers envoyés sous le champ "frames"
    const files = form.getAll('frames')
    if (!files.length) {
      throw new Error('Aucune frame reçue');
    }

    // Applique le même découpage qu’avant
    const frames = files.slice(30, -1);

    // Dossier de sortie (comme ta V1)
    const framesDir = path.join(process.cwd(), 'frames');
    if (!fs.existsSync(framesDir)) fs.mkdirSync(framesDir);

    // Sauvegarde des frames en séquence (zero-pad pour ffmpeg: %06d)
    await Promise.all(
      frames.map(async (file, i) => {
        const buf = Buffer.from(await file.arrayBuffer());
        const filename = `frame_${i}.png`;
        await fs.promises.writeFile(path.join(framesDir, filename), buf);
      })
    );
    console.log('chemin : ',framesDir);




    ////////V1///////
    // let frames = await req.json(); // tableau de dataURL
    // frames = frames.slice(30, -1);

    // const framesDir = path.join(process.cwd(), 'frames');
    // if (!fs.existsSync(framesDir)) fs.mkdirSync(framesDir);

    // // Sauvegarde des frames
    // frames.forEach((dataURL, i) => {
    //   const base64Data = dataURL.replace(/^data:image\/\w+;base64,/, '');
    //   const buffer = Buffer.from(base64Data, 'base64');
    //   fs.writeFileSync(path.join(framesDir, `frame_${i}.png`), buffer);
    // });

    console.log(`✅ ${frames.length} frames exportées`);

    // --- Déclenche FFmpeg automatiquement ---
    const outputVideo = path.join(process.cwd(), 'output.mp4');
    const audioMP3 = path.join(process.cwd(), 'audio.mp3');
    const ffmpegCmd = `ffmpeg -y -framerate 30 -i ${framesDir}/frame_%d.png -i ${audioMP3} -c:v libx264 -pix_fmt yuv420p -c:a aac -shortest ${outputVideo}`;

    await new Promise((resolve, reject) => {
      exec(ffmpegCmd, (error, stdout, stderr) => {
        if (error) return reject(error);
        console.log(stdout);
        console.error(stderr);
        resolve();
      });
    });
    console.log('✅ Vidéo exportée en output.mp4');

    // Supprime les frames après la vidéo
    fs.readdirSync(framesDir).forEach(file => fs.unlinkSync(path.join(framesDir, file)));
    fs.rmdirSync(framesDir);

    console.log('✅ frames supprimées');
    return new Response(JSON.stringify({ success: true, video: '/output.mp4' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
