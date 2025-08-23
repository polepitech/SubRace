import puppeteer from "puppeteer";
// import fetch from "node-fetch"; // si tu veux appeler ta route API ensuite

async function StartARace() {

    console.log("🚀 Lancement de Puppeteer...");
    const browser = await puppeteer.launch({
        headless: true, // passe à false si tu veux voir le navigateur
        defaultViewport: { width: 1280, height: 720 },
    });

    const page = await browser.newPage();

    await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });
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