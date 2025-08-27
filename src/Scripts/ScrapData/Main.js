import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

import fs from 'fs-extra';
import { loginInstagram } from './login.js';
import { GetFollowersData } from './getSubData.js';
import { StoreUserData } from './StoreData.js';
import 'dotenv/config';

puppeteer.use(StealthPlugin());

(async () => {


    const browser = await puppeteer.launch({ 
        headless: 'new' ,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--window-size=1280,800'
        ]
    });

    const page = await browser.newPage();

    // UA “non-headless”
    const ua = (await browser.userAgent()).replace('Headless', '');
    await page.setUserAgent(ua);

    await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
        'AppleWebKit/537.36 (KHTML, like Gecko) ' +
        'Chrome/120.0.0.0 Safari/537.36'
    );
    await page.setExtraHTTPHeaders({
        'Accept-Language': 'fr-FR,fr;q=0.9'
    });


    // /////TEST WHOAMI////////
    // await page.goto('https://www.whatismybrowser.com/', {
    //     waitUntil: 'domcontentloaded'
    // });
    // await page.screenshot({ path: 'test.png' });
    // await browser.close();
    // return;
    // /////TEST WHOAMI////////


    const cookies = await loginInstagram(page);
    fs.writeFileSync('cookies.json', JSON.stringify(cookies));

    const followers = await GetFollowersData(page);
    
    if (!followers || followers.length === 0) {
        console.log('❌ No followers data retrieved.');
        await StopScript(browser);

    }

    const result = await StoreUserData(followers);
    console.log(result);

    await StopScript(browser);
    
    

})();

async function StopScript(browser){
    await browser.close();
    return;
}