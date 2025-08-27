import { TestEdge } from "./testEdge.js";

export async function GetFollowersData (page) {
    await page.goto('https://www.instagram.com/SubRace_/', { waitUntil: 'networkidle2' });

    const isMonCompte = 'new';
    const targetHref = '/subrace_/followers/';
    const targetLink = await page.$(`a[href="${targetHref}"]`);

    if (targetLink) {
      const tracker = await TestEdge(page);      // <- brancher l'écouteur AVANT de scroller

      await targetLink.click();
      await new Promise(r => setTimeout(r, 2000));
      // await page.screenshot({ path: 'debug.png', fullPage: true });
        let modal = await page.$('div[role="dialog"]');
        if (modal) {
          console.log('✅ Modal ouverte');

            let scrollDiv = null;
            while (scrollDiv === null) {
                await new Promise(r => setTimeout(r, 2000));
                modal = await page.$('div[role="dialog"]');
                scrollDiv = await findScrollableDiv(modal);
                console.log('⚠️ Aucune donnée trouvée, rafraîchissement...');
            }
            if (!scrollDiv) {
                console.log('⚠️ Div scrollable introuvable (overflow-y: scroll)');
            } else {
              await scrollElementToEnd(scrollDiv, { pause: 2000, maxIdle: 3 });

              const users = tracker.getUsers();          // tous les users récupérés pendant le scroll
              const cursor = tracker.getCursor();        // dernier cursor vu (si tu veux continuer côté code)
              console.log('Total users collectés (REST):', users.length);
            }



            let ln = [];
            while (ln.length === 0) {
                await new Promise(r => setTimeout(r, 1000)); // pause 1s
                ln = await modal.evaluate(modalEl => modalEl.innerText.split('\n'));
                if (ln.length === 0) {
                    console.log('⚠️ Aucune donnée trouvée, rafraîchissement...');
                }
            }


            
            //clean la liste
            // console.log('🚧 Données récupérées :', ln);
            for (let i = ln.length - 1; i >= 0; i--) {
                if (ln[i] == "·" || ln[i] == "." || ln[i] == "Suggestions") {
                    ln.splice(i, 1);
                }
                if(isMonCompte && ln[i] == 'Suivre'){
                    ln.splice(i, 1);
                }
            }
            // console.log('🚧 list cleaned:', ln);

            const followers = [];
            let pickNext = false;

            for (const line of ln) {
              if (pickNext) {
                followers.push([line]);
                pickNext = false; // reset après avoir pris la ligne suivante
              }
              if (isMonCompte && line == 'Supprimer' || !isMonCompte && line == 'Suivre' || line === 'Rechercher' ) {
                pickNext = true;
              }
            }
            // console.log('🚧 Followers:', followers);

            const firstSixImages = await modal.evaluate((modalEl, count) => {
                const imgs = Array.from(modalEl.querySelectorAll('img'));
                const firstSix = imgs.slice(0, count);
                return firstSix.map(img => img.src);
            }, followers.length);

            for (let i = 0; i < firstSixImages.length; i++) {
                const img = firstSixImages[i];
                followers[i].push(img);
            }

            return followers;

        } else {
            console.log('Modal non trouvée');
        }

    }else{
      console.log('❌ Aucun lien vers les abonnés trouvé');
    }
}








// --- trouve la vraie div qui scrolle dans la modal (overflow-y: scroll) ---
async function findScrollableDiv(modal) {
  const divs = await modal.$$('div');
  console.log(divs.length, 'divs trouvées dans la modal');
  let best = null;
  let bestHeight = 0;

  // priorité stricte: overflow-y === 'scroll'
  for (const d of divs) {
    const data = await d.evaluate(el => {
      const style = getComputedStyle(el);
      const text = el.innerText;
      console.log('---', text, '---');
      return {
        oy: style.overflowY,
        sh: el.scrollHeight,
        ch: el.clientHeight
      };
    });
    if (data.oy === 'scroll' && data.sh > data.ch && data.sh > bestHeight) {
      best = d;
      bestHeight = data.sh;
    }
  }

  // fallback optionnel: accepter 'auto' si rien trouvé
  if (!best) {
    for (const d of divs) {
      const data = await d.evaluate(el => {
        const style = getComputedStyle(el);
        return {
          oy: style.overflowY,
          sh: el.scrollHeight,
          ch: el.clientHeight
        };
      });
      if (data.oy === 'auto' && data.sh > data.ch && data.sh > bestHeight) {
        best = d;
        bestHeight = data.sh;
      }
    }
  }

  return best; // ElementHandle ou null
}

// --- scrolle jusqu’en bas tant que la hauteur augmente ---
async function scrollElementToEnd(scrollEl, { pause = 2000, maxIdle = 3 } = {}) {
  let idle = 0;
  let lastHeight = await scrollEl.evaluate(el => el.scrollHeight);
  console.log('🔽 Début du scroll (élément trouvé)');

  while (idle < maxIdle) {
    let rdm = Math.floor(Math.random() * 1000);
    process.stdout.write(`\r🔽 Scroll en cours... (pause: ${pause + rdm}ms) idle : ${idle}`);
    await new Promise(r => setTimeout(r, (pause + rdm)));
    await scrollEl.evaluate(el => { el.scrollTop = el.scrollHeight; });
    const newHeight = await scrollEl.evaluate(el => el.scrollHeight);
    if (newHeight === lastHeight) {
      idle += 1;     // aucune nouvelle donnée chargée pendant ce cycle
    } else {
      idle = 0;      // du nouveau contenu a été chargé, on continue
      lastHeight = newHeight;
    }
  }
  console.log('\n🔽 Fin du scroll (plus de nouveau contenu)');
}
