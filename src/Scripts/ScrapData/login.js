import fs from 'fs-extra';

export async function loginInstagram(page) {
    console.log("⌛️ connexion en cours...")

    // Chargement des cookies
    let cookies = null;
    if (fs.existsSync("cookies.json")) {
        const data = fs.readFileSync("cookies.json", "utf8");
        cookies = JSON.parse(data);
        await page.setCookie(...cookies);   
    } else {
        console.log("⚠️ Le fichier cookies.json est introuvable.");
    }
    await page.goto('https://www.instagram.com/', { waitUntil: 'networkidle2' });

    // Consentement
    try {
        await page.waitForSelector('button', { timeout: 3000 });
        const allButtons = await page.$$('button');
        for (const btn of allButtons) {
            const text = await page.evaluate(el => el.innerText, btn);
            if (text.includes('autoriser') || text.includes('Autoriser')) {
                await btn.click();
                console.log('✅ Bouton de consentement cliqué');
                break;
            }
        }
    } catch (e) {
        console.log('⚠️ Bouton "Se connecter" non trouvé');

    }

    // Login
    if (await page.$('input[name="username"]')) {
        console.log('⌛️ Tentative de connexion...');
        await page.type('input[name="username"]', process.env.IG_EMAIL);
        await page.type('input[name="password"]', process.env.IG_PASSWORD);
        await new Promise(r => setTimeout(r, 1000));
        await page.waitForSelector('button');
        const buttons = await page.$$('button');
        for (const btn of buttons) {
            const text = await page.evaluate(el => el.innerText, btn);
            if (text.includes('Se connecter')) {
                await btn.click();
                await page.waitForNavigation({ waitUntil: 'networkidle2' });
                break;
            }
        }
    }
    // Vérification de la connexion
    if (await page.$('input[name="username"]')) {
        console.log('❌ Échec de la connexion');
    } else {
        console.log('✅ Connexion réussie');
    }
    // Tu peux retourner les cookies ici si besoin
    return await page.cookies();
}