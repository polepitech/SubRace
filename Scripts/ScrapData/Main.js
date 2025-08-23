import puppeteer from 'puppeteer';
import fs from 'fs-extra';
import { loginInstagram } from './login.js';
import { GetFollowersData } from './getSubData.js';
import 'dotenv/config';
import { StoreUserData } from './StoreData.js';


(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    const cookies = await loginInstagram(page);
    fs.writeFileSync('cookies.json', JSON.stringify(cookies));

    const followers = await GetFollowersData(page);
    
    if (!followers || followers.length === 0) {
        console.log('❌ No followers data retrieved.');
        await browser.close();
        return;
    }

    const result = await StoreUserData(followers);
    console.log(result);

    await browser.close();
    return;
    
    

})();