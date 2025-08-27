export async function TestEdge(page) {
  const PAGES = [];
  const USERS = [];
  let LAST_CURSOR = null;

  // helper pour extraire dans différents schémas
  const pick = (obj, keys) => keys.find(k => obj && Object.prototype.hasOwnProperty.call(obj, k)) ?? null;

  page.on('response', async (res) => {
    const url = res.url();
    if (!/\/api\/v1\/friendships\/\d+\/followers\//.test(url)) return;

    try {
      const js = await res.json();
      const users = js.users ?? js.items ?? [];
      const hasMore = js.has_more ?? js.big_list ?? false;
      // différents backends exposent le cursor sous ces noms :
      const nextCursorKey = pick(js, ['next_max_id', 'next_max_id', 'next_min_id', 'next_cursor', 'max_id']);
      const nextCursor = nextCursorKey ? js[nextCursorKey] : null;

      PAGES.push({ count: users.length, hasMore, nextCursor });
      USERS.push(...users);
      LAST_CURSOR = nextCursor;

      console.log(`[followers] page=${PAGES.length} users=${users.length} has_more=${hasMore} cursor=${String(nextCursor).slice(0,12)}...`);
    } catch {}
  });

  // retourne une petite API pour lire ce qui a été capté
  return {
    getPages: () => PAGES.slice(),
    getUsers: () => USERS.slice(),
    getCursor: () => LAST_CURSOR
  };
}