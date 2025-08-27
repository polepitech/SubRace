import puppeteer from "puppeteer";
import 'dotenv/config';

async function StartARace() {

    console.log("🚀 Lancement de Puppeteer...");
    const browser = await puppeteer.launch({
        headless: false, 
        defaultViewport: { width: 1280, height: 720 },
    });

    const page = await browser.newPage();
    const TOKEN = process.env.SECURE_PAGE;

    await page.goto("http://localhost:3000/?TOKEN="+TOKEN, { waitUntil: "domcontentloaded" });
    console.log("✅ Site chargé !");

    const intervalId = setInterval(async() => {
        const etat = await page.evaluate(() => window.etat);
        process.stdout.write(`Progression de la course: ${Math.floor(etat)}%\r`);
    }, 1000);


    await page.waitForFunction(() => window.gameFinished === true,{timeout: 0} );
    clearInterval(intervalId);
    console.log("\n🎉 La course est terminée !");
    await browser.close()
    return;

}

StartARace().catch(err => console.error(err));