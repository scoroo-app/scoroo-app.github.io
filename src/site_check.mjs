// Vérifie les pages du site générées par src/build_site.mjs (accueil index.html et <langue>/index.html,
// et la page d'un jeu par langue) dans Chrome sans fenêtre, aux tailles et
// dans les langues voulues : débordement horizontal (éléments plus larges que l'écran) et capture de
// toute la page.
//
//   node src/site_check.mjs [--sizes=390x844,1440x900] [--langs=fr,en] [--games=tarot,belote | --games=all | --games=]
//
// Captures dans build/site_check/<langue>_<page>_<largeur>.png (dossier ignoré par git). Node 22 ou plus, Google Chrome.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const args = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, ...v] = a.replace(/^--/, '').split('='); return [k, v.join('=')]; }));
const sizes = (args.sizes || '390x844,1440x900').split(',').map((s) => s.split('x').map(Number));
const langs = (args.langs || 'fr,en,es,de,it').split(',');
// Pages des jeux : dossiers générés (jeux/, en/games/…), repérés dans l'ordre par leur rang.
const GAMES_DIR = { fr: 'jeux', en: 'games', es: 'juegos', de: 'spiele', it: 'giochi' };
const wantedGames = args.games === undefined ? ['tarot'] : args.games === '' ? [] : args.games.split(',');
function pagesOf(lang) {
  const home = lang === 'fr' ? '' : lang + '/';
  const out = [['home', path.join(SITE, home, 'index.html')]];
  const frDir = path.join(SITE, 'jeux');
  const frGames = fs.existsSync(frDir) ? fs.readdirSync(frDir).sort() : [];
  const dir = path.join(SITE, home, GAMES_DIR[lang]);
  // Même rang dans l'ordre alphabétique français : les noms changent d'une langue à l'autre.
  const games = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
  for (const g of frGames) {
    if (!(args.games === 'all' || wantedGames.includes(g))) continue;
    const html = fs.readFileSync(path.join(frDir, g, 'index.html'), 'utf8');
    const href = html.match(new RegExp(`hreflang="${lang}" href="[^"]*/([^/"]+)/"`));
    const name = href && games.includes(href[1]) ? href[1] : null;
    if (name) out.push([g, path.join(dir, name, 'index.html')]);
  }
  return out;
}
const outDir = path.join(SITE, 'build', 'site_check');
fs.mkdirSync(outDir, { recursive: true });
const chrome = [process.env.CHROME, 'C:/Program Files/Google/Chrome/Application/chrome.exe', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome']
  .filter(Boolean).find((p) => fs.existsSync(p));
if (!chrome) throw new Error('Chrome introuvable (variable CHROME pour donner son chemin).');

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'site-check-'));
const proc = spawn(chrome, ['--headless=new', '--remote-debugging-port=0', '--user-data-dir=' + profile, '--hide-scrollbars', 'about:blank'],
  { stdio: ['ignore', 'ignore', 'pipe'] });
process.on('exit', () => proc.kill());
const wsUrl = await new Promise((resolve, reject) => {
  let buf = '';
  proc.stderr.on('data', (d) => { buf += d; const m = buf.match(/DevTools listening on (ws:\S+)/); if (m) resolve(m[1]); });
  proc.on('exit', () => reject(new Error('Chrome s\'est arrêté :\n' + buf)));
});
const ws = new WebSocket(wsUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let nextId = 1;
const pending = new Map();
ws.addEventListener('message', (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) reject(new Error(msg.error.message)); else resolve(msg.result);
  }
});
const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
  const id = nextId++;
  pending.set(id, { resolve, reject });
  ws.send(JSON.stringify({ id, method, params, sessionId }));
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
const page = (m, p) => send(m, p, sessionId);
await page('Page.enable');
const evaluate = async (expression) => (await page('Runtime.evaluate', { expression, returnByValue: true })).result.value;

let problems = 0;
for (const [w, h] of sizes) {
  await page('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: w < 800 });
  for (const lang of langs) for (const [name, file] of pagesOf(lang)) {
    await page('Page.navigate', { url: pathToFileURL(file).href });
    await sleep(1800);
    // Éléments qui dépassent à droite ou à gauche (hors zones qui défilent de côté).
    const wide = await evaluate(`(() => {
      const W = document.documentElement.clientWidth, out = [];
      const scrolls = (el) => { for (let e = el.parentElement; e; e = e.parentElement) { const o = getComputedStyle(e).overflowX; if (o === 'auto' || o === 'scroll' || o === 'hidden') return true; } return false; };
      for (const el of document.querySelectorAll('body *')) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || scrolls(el)) continue;
        if (r.right > W + 1 || r.left < -1) out.push(el.tagName.toLowerCase() + '.' + (el.className || '') + ' ' + Math.round(r.left) + '→' + Math.round(r.right) + ' « ' + (el.textContent || '').trim().slice(0, 40) + ' »');
      }
      return { scrollWidth: document.documentElement.scrollWidth, W, out: out.slice(0, 12) };
    })()`);
    const ok = wide.scrollWidth <= wide.W && wide.out.length === 0;
    if (!ok) problems++;
    console.log(`${lang} ${name} ${w}x${h} : ${ok ? 'ok' : 'déborde (' + wide.scrollWidth + ' > ' + wide.W + ')'}`);
    for (const line of wide.out) console.log('   ' + line);
    const height = await evaluate('document.documentElement.scrollHeight');
    const r = await page('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: w, height, scale: 1 } });
    fs.writeFileSync(path.join(outDir, `${lang}_${name}_${w}.png`), Buffer.from(r.data, 'base64'));
  }
}
console.log(problems ? `${problems} page(s) qui débordent` : 'Aucun débordement');
process.exit(0);
