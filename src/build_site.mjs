// Génère le site de Scoroo à partir du modèle src/index.template.html et des règles de l'appli
// (src/rules.json, exportées depuis le dépôt de l'appli par « flutter test tool/site/rules_dump_test.dart ») :
//
//   node src/build_site.mjs        (Node 18 ou plus)
//
// Écrit, à la racine de ce dépôt (publiée par GitHub Pages) :
// - index.html (français) et <langue>/index.html : la page d'accueil, textes déjà écrits dans
//   le HTML (les moteurs de recherche et les aperçus de liens les lisent sans JavaScript), titre et
//   description de la langue, liens hreflang entre les langues, balises de partage (Open Graph, X),
//   données structurées (appli, site, FAQ) ;
// - une page par jeu et par langue : règles et comptage des points (jeux/<jeu>/, en/games/<jeu>/,
//   es/juegos/…, de/spiele/…, it/giochi/…) ;
// - sitemap.xml (avec les pages des autres langues) et robots.txt.
//
// Domaine : SITE_URL ci-dessous (à changer si le site passe sur un nom de domaine à lui).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_URL = 'https://scoroo-app.github.io';
const SRC = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(SRC, '..');
const TEMPLATE = fs.readFileSync(path.join(SRC, 'index.template.html'), 'utf8');
const RULES = JSON.parse(fs.readFileSync(path.join(SRC, 'rules.json'), 'utf8'));

// Données de la page (constantes entre « // <data> » et « // </data> » du modèle).
const dataSrc = TEMPLATE.match(/\/\/ <data>[^\n]*\n([\s\S]*?)\/\/ <\/data>/)[1];
const { PLAY, APPLE, LANGS, GAMES, I18N, APPLE_LOGO, PLAY_LOGO } = new Function(
  `${dataSrc}\nreturn { PLAY, APPLE, LANGS, GAMES, I18N, APPLE_LOGO, PLAY_LOGO };`,
)();

const LOCALES = { fr: 'fr_FR', en: 'en_US', es: 'es_ES', de: 'de_DE', it: 'it_IT' };
const LANG_NAMES = { fr: 'Français', en: 'English', es: 'Español', de: 'Deutsch', it: 'Italiano' };
const GAMES_DIR = { fr: 'jeux', en: 'games', es: 'juegos', de: 'spiele', it: 'giochi' };
// Captures de l'appli montrées sur la page d'un jeu, quand il y en a une.
const GAME_SHOTS = { tarot: '2_tarot', darts: '4_flechettes', yams: '5_yams' };

// Textes des pages des jeux.
const S = {
  fr: {
    h1: '{game} : règles et comptage des points',
    meta: '{game} : règles et calcul des points expliqués simplement. {tagline}. Comptez vos parties gratuitement avec Scoroo.',
    intro: 'Voici les règles telles que Scoroo les applique. Pendant la partie, saisissez chaque manche : l’appli additionne, applique les primes et les pénalités, et désigne le gagnant.',
    how: 'Compter les points avec Scoroo',
    steps: [
      ['edit_note', 'Saisissez chaque manche', 'Quelques appuis sur le téléphone, sans papier ni calcul.'],
      ['calculate', 'Scoroo fait les calculs', 'Le barème ci-dessous est appliqué tout seul.'],
      ['emoji_events', 'Classement et statistiques', 'Le gagnant, les records et l’historique de chaque joueur.'],
    ],
    rules: 'Les règles',
    cta: 'Comptez votre prochaine partie avec Scoroo',
    others: 'Les autres jeux de Scoroo',
    shot: 'Capture d’écran de Scoroo',
  },
  en: {
    h1: '{game}: rules and how to keep score',
    meta: '{game} rules and scoring, explained simply. {tagline}. Keep score for free with Scoroo.',
    intro: 'Here are the rules as Scoroo applies them. During the game, enter each round: the app adds up, applies bonuses and penalties, and declares the winner.',
    how: 'Keeping score with Scoroo',
    steps: [
      ['edit_note', 'Enter each round', 'A few taps on your phone, no paper, no maths.'],
      ['calculate', 'Scoroo does the maths', 'The scoring below is applied automatically.'],
      ['emoji_events', 'Rankings and stats', 'The winner, records and every player’s history.'],
    ],
    rules: 'The rules',
    cta: 'Keep score of your next game with Scoroo',
    others: 'More games in Scoroo',
    shot: 'Scoroo screenshot',
  },
  es: {
    h1: '{game}: reglas y cómo contar los puntos',
    meta: '{game}: reglas y puntuación explicadas de forma sencilla. {tagline}. Cuenta los puntos gratis con Scoroo.',
    intro: 'Estas son las reglas tal como las aplica Scoroo. Durante la partida, anota cada ronda: la app suma, aplica primas y penalizaciones y designa al ganador.',
    how: 'Contar los puntos con Scoroo',
    steps: [
      ['edit_note', 'Anota cada ronda', 'Unos toques en el móvil, sin papel ni cálculos.'],
      ['calculate', 'Scoroo hace las cuentas', 'La puntuación de abajo se aplica sola.'],
      ['emoji_events', 'Clasificación y estadísticas', 'El ganador, los récords y el historial de cada jugador.'],
    ],
    rules: 'Las reglas',
    cta: 'Cuenta tu próxima partida con Scoroo',
    others: 'Otros juegos de Scoroo',
    shot: 'Captura de pantalla de Scoroo',
  },
  de: {
    h1: '{game}: Regeln und Punktezählung',
    meta: '{game}: Regeln und Punktezählung einfach erklärt. {tagline}. Punkte kostenlos zählen mit Scoroo.',
    intro: 'Hier sind die Regeln, so wie Scoroo sie anwendet. Während des Spiels gibst du jede Runde ein: Die App rechnet zusammen, wendet Boni und Strafen an und kürt den Sieger.',
    how: 'Punkte zählen mit Scoroo',
    steps: [
      ['edit_note', 'Jede Runde eingeben', 'Ein paar Tipps auf dem Handy, ohne Papier und Rechnen.'],
      ['calculate', 'Scoroo rechnet', 'Die Wertung unten wird automatisch angewendet.'],
      ['emoji_events', 'Rangliste und Statistiken', 'Der Sieger, Rekorde und der Verlauf jedes Spielers.'],
    ],
    rules: 'Die Regeln',
    cta: 'Zähle dein nächstes Spiel mit Scoroo',
    others: 'Weitere Spiele in Scoroo',
    shot: 'Screenshot von Scoroo',
  },
  it: {
    h1: '{game}: regole e come contare i punti',
    meta: '{game}: regole e punteggio spiegati in modo semplice. {tagline}. Conta i punti gratis con Scoroo.',
    intro: 'Ecco le regole così come le applica Scoroo. Durante la partita, inserisci ogni mano: l’app somma, applica premi e penalità e proclama il vincitore.',
    how: 'Contare i punti con Scoroo',
    steps: [
      ['edit_note', 'Inserisci ogni mano', 'Pochi tocchi sul telefono, senza carta né calcoli.'],
      ['calculate', 'Scoroo fa i conti', 'Il punteggio qui sotto viene applicato da solo.'],
      ['emoji_events', 'Classifica e statistiche', 'Il vincitore, i record e lo storico di ogni giocatore.'],
    ],
    rules: 'Le regole',
    cta: 'Conta la tua prossima partita con Scoroo',
    others: 'Altri giochi di Scoroo',
    shot: 'Schermata di Scoroo',
  },
};

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const slug = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const fmt = (s, vars) => s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
const ld = (data) => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;

// Adresses (relatives à la racine du site, '' = la racine).
const homePath = (lang) => (lang === 'fr' ? '' : `${lang}/`);
const gamePages = GAMES.filter((g) => g.page && RULES.fr[g.page]);
const gamePath = (lang, id) => `${homePath(lang)}${GAMES_DIR[lang]}/${slug(RULES[lang][id].label)}/`;
const baseOf = (p) => '../'.repeat(p.split('/').length - 1);
/** Lien relatif d'une page à une autre (adresses de dossiers, '' = la racine). */
function rel(from, to) {
  const a = from.split('/').filter(Boolean);
  const b = to.split('/').filter(Boolean);
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return '../'.repeat(a.length - i) + b.slice(i).map((x) => x + '/').join('') || './';
}
const abs = (p) => `${SITE_URL}/${p}`;

function storesHtml(t) {
  const play = `<a class="store" href="${PLAY}">${PLAY_LOGO}<span><small>${esc(t.storeGet)}</small>Google Play</span></a>`;
  const apple = `<a class="store" href="${APPLE}">${APPLE_LOGO}<span><small>${esc(t.storeApple)}</small>App Store</span></a>`;
  return play + apple;
}

/** Balises communes du <head> : titre, description, adresse canonique, langues, partage. */
function headHtml({ lang, title, description, pathOf, current, type = 'website' }) {
  const t = I18N[lang];
  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}">`,
    `<link rel="canonical" href="${abs(current)}">`,
    ...LANGS.map((l) => `<link rel="alternate" hreflang="${l}" href="${abs(pathOf(l))}">`),
    `<link rel="alternate" hreflang="x-default" href="${abs(pathOf('en'))}">`,
    '<meta name="theme-color" content="#0b3a6e">',
    `<meta property="og:type" content="${type}">`,
    '<meta property="og:site_name" content="Scoroo">',
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(description)}">`,
    `<meta property="og:url" content="${abs(current)}">`,
    `<meta property="og:image" content="${abs(`img/og_${lang}.jpg`)}">`,
    '<meta property="og:image:width" content="1200">',
    '<meta property="og:image:height" content="630">',
    `<meta property="og:image:alt" content="${esc(t.title)}">`,
    `<meta property="og:locale" content="${LOCALES[lang]}">`,
    ...LANGS.filter((l) => l !== lang).map((l) => `<meta property="og:locale:alternate" content="${LOCALES[l]}">`),
    '<meta name="twitter:card" content="summary_large_image">',
  ].join('\n');
}

const SOCIALS = ['https://www.instagram.com/scoroo_app/', 'https://www.tiktok.com/@scoroo_app'];

/** Données structurées de la page d'accueil : l'appli, le site et la FAQ. */
function homeLd(lang) {
  const t = I18N[lang];
  return ld({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'MobileApplication',
        '@id': `${SITE_URL}/#app`,
        name: 'Scoroo',
        description: t.description,
        url: abs(homePath(lang)),
        image: abs('img/logo.png'),
        operatingSystem: 'Android, iOS',
        applicationCategory: 'UtilitiesApplication',
        inLanguage: LANGS,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
        installUrl: [PLAY, APPLE],
        sameAs: [PLAY, APPLE, ...SOCIALS],
      },
      { '@type': 'WebSite', '@id': `${SITE_URL}/#site`, name: 'Scoroo', url: `${SITE_URL}/`, inLanguage: lang },
      {
        '@type': 'FAQPage',
        inLanguage: lang,
        mainEntity: t.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
      },
    ],
  });
}

/** Remplit la page d'accueil comme le fait render() dans le navigateur (même HTML). */
function fillHome(html, lang, base) {
  const t = I18N[lang];
  const pages = Object.fromEntries(gamePages.map((g) => [g.page, rel(homePath(lang), gamePath(lang, g.page))]));
  const fillTag = (attr, value) => {
    const re = new RegExp(`(<(\\w+)\\b[^>]*?\\s${attr}(?=[\\s=>])(?:="([^"]*)")?[^>]*>)</\\2>`, 'g');
    html = html.replace(re, (m, open, tag, key) => open + value(key) + `</${tag}>`);
  };
  fillTag('data-i18n', (k) => esc(t[k]));
  fillTag('data-i18n-html', (k) => t[k]);
  fillTag('data-stores', () => storesHtml(t));
  fillTag('data-tabs', () => t.tvTabs.map((x, i) => `<button type="button" data-tab="${i}"${i === 0 ? ' class="on"' : ''}>${esc(x)}</button>`).join(''));
  fillTag('data-points', (k) => (t.points?.[k] || t[k + 'Points']).map(([icon, title, text]) =>
    `<li><span class="ms">${icon}</span><div><b>${esc(title)}</b><span>${esc(text)}</span></div></li>`).join(''));
  fillTag('data-steps', (k) => t.steps[k].map(([title, text]) => `<div class="step"><h3>${esc(title)}</h3><p>${esc(text)}</p></div>`).join(''));
  fillTag('data-chips', (k) => t.chips[k].map(([icon, label]) => `<span><span class="ms">${icon}</span>${esc(label)}</span>`).join(''));
  fillTag('data-tiles', (k) => t.tiles[k].map(([icon, title, text]) =>
    `<div class="tile"><span class="ms">${icon}</span><h3>${esc(title)}</h3><p>${esc(text)}</p></div>`).join(''));
  fillTag('data-list', (k) => t.list[k].map((x) => `<li><span class="ms">check_circle</span><span>${esc(x)}</span></li>`).join(''));
  fillTag('data-faq', () => t.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join(''));
  html = html.replace('<div class="games" id="games"></div>', '<div class="games" id="games">' + GAMES.map((g) => {
    const [name, desc, tags] = t.g[g.id];
    const url = pages[g.page];
    return `<article class="game" style="--c:${g.c}"><div class="ic"><span class="ms">${g.icon}</span></div>` +
      `<h3>${url ? `<a href="${url}">${esc(name)}</a>` : esc(name)}</h3><p>${esc(desc)}</p>` +
      `<div class="tags">${tags.map((x) => `<span>${esc(x)}</span>`).join('')}</div>` +
      (url ? `<a class="more" href="${url}">${esc(t.rulesLink)}<span class="ms">arrow_forward</span></a>` : '') +
      '</article>';
  }).join('') + '</div>');
  // Captures : adresse et texte de remplacement.
  html = html.replace(/<img data-shot="([^"]+)"([^>]*?) alt=""/g, (m, shot, rest) =>
    `<img src="${base}img/${lang}_${shot}.webp" data-shot="${shot}"${rest} alt="${esc(S[lang].shot)}"`);
  const vlang = lang === 'fr' ? 'fr' : 'en';
  html = html.replace('<video data-video', `<video data-video poster="${base}video/scoroo_${vlang}.webp" src="${base}video/scoroo_${vlang}.mp4"`);
  html = html.replace(`<option value="${lang}">`, `<option value="${lang}" selected>`);
  html = html.replace('const PAGES = /*PAGES*/{};', `const PAGES = ${JSON.stringify(pages)};`);
  return html;
}

function buildHome(lang) {
  const t = I18N[lang];
  const current = homePath(lang);
  const base = baseOf(current);
  let html = TEMPLATE.replace(/<!--\n  MODÈLE[\s\S]*?pages des jeux et sitemap\)\. __LANG__, __BASE__ et <!--HEAD--> y sont remplacés\.\n/,
    '<!--\n  Fichier généré par node src/build_site.mjs à partir de src/index.template.html : modifier le modèle.\n');
  html = html.replaceAll('__LANG__', lang).replaceAll('__BASE__', base);
  html = html.replace('<!--HEAD-->', headHtml({ lang, title: t.title, description: t.description, pathOf: homePath, current }) + '\n' + homeLd(lang));
  return fillHome(html, lang, base);
}

// Feuille de style du modèle, reprise par les pages des jeux.
const STYLE = TEMPLATE.match(/<style>([\s\S]*?)<\/style>/)[1];
const FONTS = TEMPLATE.match(/<link rel="preconnect"[\s\S]*?Material\+Symbols[^\n]*\n/)[0];
const FOOTER = TEMPLATE.match(/<footer>[\s\S]*?<\/footer>/)[0];
const GAME_STYLE = `
  .ghero { background: radial-gradient(900px 420px at 90% -20%, color-mix(in srgb, var(--c) 70%, #2b5fa0) 0%, transparent 60%), linear-gradient(160deg, var(--navy) 0%, var(--navy-2) 100%);
    color: #fff; padding: 40px 0 44px; position: relative; overflow: hidden; }
  .ghero::before { content: ''; position: absolute; inset: 0; opacity: .08; background-image: radial-gradient(circle at 1px 1px, #fff 1.4px, transparent 0); background-size: 26px 26px; }
  .ghero .wrap, .article { max-width: 860px; position: relative; }
  .crumbs { font-size: 14px; color: rgba(255,255,255,.7); display: flex; flex-wrap: wrap; gap: 6px; }
  .crumbs a { color: inherit; }
  .gic { width: 64px; height: 64px; border-radius: 20px; display: grid; place-items: center; color: #fff; margin-top: 26px;
    background: linear-gradient(145deg, color-mix(in srgb, var(--c) 75%, white), var(--c)); box-shadow: 0 10px 24px -10px var(--c); }
  .gic .ms { font-size: 36px; }
  .ghero h1 { font-size: clamp(32px, 5.4vw, 52px); font-weight: 800; letter-spacing: -0.03em; margin-top: 16px; }
  .ghero .lead { color: rgba(255,255,255,.84); }
  .ghero .stores { margin-bottom: 0; }
  .article { padding-top: 8px; }
  .how { display: grid; grid-template-columns: 1fr auto; gap: 40px; align-items: center; }
  .how .phone { position: static; width: 240px; transform: rotate(2deg); }
  @media (max-width: 760px) { .how { grid-template-columns: 1fr; } .how .phone { width: 210px; margin: 0 auto; } }
  .article h2 { font-size: clamp(26px, 3.8vw, 36px); margin: 52px 0 8px; }
  .article .how h2 { margin-top: 0; }
  .rule { background: var(--card); border: 1px solid var(--line); border-left: 4px solid var(--c); border-radius: 16px; padding: 16px 20px; margin-top: 12px; }
  .rule h3, .rule h4 { font-family: var(--display); letter-spacing: -0.02em; line-height: 1.08; margin: 0; font-size: 19px; font-weight: 700; }
  .rule p { margin: 6px 0 0; font-size: 16.5px; }
  .variant { font-size: 23px; margin: 34px 0 4px; color: color-mix(in srgb, var(--c) 70%, var(--ink)); }
  .others { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 22px; }
  .others a { display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 999px; background: var(--card); border: 1px solid var(--line);
    text-decoration: none; color: var(--ink); font-weight: 600; }
  .others a:hover { border-color: var(--c); }
  .others .ms { color: var(--c); font-size: 20px; }
`;

function buildGame(lang, g) {
  const t = I18N[lang];
  const s = S[lang];
  const rules = RULES[lang][g.page];
  const current = gamePath(lang, g.page);
  const base = baseOf(current);
  const home = rel(current, homePath(lang));
  const label = rules.label;
  const h1 = fmt(s.h1, { game: label });
  const description = fmt(s.meta, { game: label, tagline: rules.tagline.replace(/\.$/, '') });
  const shot = GAME_SHOTS[g.page];
  const several = rules.variants.length > 1;
  const body = (text) => esc(text).replace(/\n/g, '<br>');
  const sections = rules.variants.map((v) =>
    (several ? `<h3 class="variant">${esc(v.title)}</h3>` : '') +
    v.sections.map((x) => {
      const h = several ? 'h4' : 'h3';
      return `<div class="rule"><${h}>${esc(x.title)}</${h}><p>${body(x.body)}</p></div>`;
    }).join('')).join('');
  const others = gamePages.filter((o) => o.page !== g.page).map((o) =>
    `<a href="${rel(current, gamePath(lang, o.page))}" style="--c:${o.c}"><span class="ms">${o.icon}</span>${esc(RULES[lang][o.page].label)}</a>`).join('');
  const options = LANGS.map((l) => `<option value="${l}" data-href="${rel(current, gamePath(l, g.page))}"${l === lang ? ' selected' : ''}>${LANG_NAMES[l]}</option>`).join('');
  const crumbs = ld({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Scoroo', item: abs(homePath(lang)) },
      { '@type': 'ListItem', position: 2, name: t.navGames, item: abs(homePath(lang)) + '#jeux' },
      { '@type': 'ListItem', position: 3, name: label, item: abs(current) },
    ],
  });
  const footer = FOOTER.replaceAll('__BASE__', base)
    .replace(/(<(\w+)\b[^>]*?\sdata-i18n="([^"]*)"[^>]*>)<\/\2>/g, (m, open, tag, k) => open + esc(t[k]) + `</${tag}>`);
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<!-- Fichier généré par node src/build_site.mjs (règles : src/rules.json) : ne pas modifier. -->
${headHtml({ lang, title: `${h1} · Scoroo`, description, pathOf: (l) => gamePath(l, g.page), current, type: 'article' })}
${crumbs}
<link rel="icon" href="${base}img/logo.png">
${FONTS}<style>${STYLE}${GAME_STYLE}</style>
</head>
<body style="--c:${g.c}">
<header class="top">
  <div class="wrap">
    <a class="brand" href="${home}"><img src="${base}img/logo.png" alt="Scoroo"><span>Scoroo</span></a>
    <nav class="nav">
      <a href="${home}#jeux">${esc(t.navGames)}</a>
      <a href="${home}#creer">${esc(t.navCreate)}</a>
      <a href="${home}#tournois">${esc(t.navCups)}</a>
      <a href="${home}#prix">${esc(t.navPrice)}</a>
    </nav>
    <select class="lang" id="lang" aria-label="Language">${options}</select>
  </div>
</header>
<main>
<section class="ghero">
  <div class="wrap">
    <nav class="crumbs" aria-label="breadcrumb"><a href="${home}">Scoroo</a><span>›</span><a href="${home}#jeux">${esc(t.navGames)}</a><span>›</span><span>${esc(label)}</span></nav>
    <div class="gic"><span class="ms">${g.icon}</span></div>
    <h1>${esc(h1)}</h1>
    <p class="lead">${esc(rules.tagline.replace(/\.$/, ''))}. ${esc(s.intro)}</p>
    <div class="stores" data-stores>${storesHtml(t)}</div>
  </div>
</section>
<section style="padding-top: 56px">
  <div class="wrap article">
    <div class="how">
      <div>
        <h2>${esc(s.how)}</h2>
        <ul class="points">${s.steps.map(([icon, title, text]) => `<li><span class="ms">${icon}</span><div><b>${esc(title)}</b><span>${esc(text)}</span></div></li>`).join('')}</ul>
      </div>
      ${shot ? `<div class="phone"><img src="${base}img/${lang}_${shot}.webp" alt="${esc(s.shot)} : ${esc(label)}" loading="lazy"></div>` : ''}
    </div>
    <h2>${esc(s.rules)}</h2>
    ${sections}
  </div>
</section>
<section style="padding-top: 0">
  <div class="wrap">
    <div class="cta">
      <h2>${esc(s.cta)}</h2>
      <p class="lead" style="color: rgba(255,255,255,.8); margin-left: auto; margin-right: auto">${esc(t.ctaLead)}</p>
      <div class="stores" data-stores>${storesHtml(t)}</div>
    </div>
  </div>
</section>
<section style="padding-top: 0">
  <div class="wrap">
    <h2 style="font-size: clamp(24px, 3.4vw, 32px)">${esc(s.others)}</h2>
    <div class="others">${others}</div>
  </div>
</section>
</main>
${footer}
<script>
  // Boutons des stores : celui du téléphone d'abord. Langue : page du même jeu dans l'autre langue.
  const ua = navigator.userAgent || '';
  const ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (ios) document.querySelectorAll('[data-stores]').forEach((el) => el.prepend(el.lastElementChild));
  const select = document.getElementById('lang');
  select.addEventListener('change', () => {
    try { localStorage.setItem('scoroo-lang', select.value); } catch (e) {}
    location.href = select.selectedOptions[0].dataset.href;
  });
</script>
</body>
</html>
`;
}

function write(rel, content) {
  const file = path.join(OUT, rel, rel.endsWith('.xml') || rel.endsWith('.txt') ? '' : 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

// Pages des jeux d'une génération précédente (un nom de jeu peut changer) : effacées avant.
for (const lang of LANGS) {
  const dir = path.join(OUT, homePath(lang), GAMES_DIR[lang]);
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true });
}

const today = new Date().toISOString().slice(0, 10);
const urls = [];
for (const lang of LANGS) {
  write(homePath(lang), buildHome(lang));
  urls.push({ loc: homePath(lang), alts: homePath, priority: lang === 'fr' ? '1.0' : '0.9' });
  for (const g of gamePages) {
    write(gamePath(lang, g.page), buildGame(lang, g));
    urls.push({ loc: gamePath(lang, g.page), alts: (l) => gamePath(l, g.page), priority: '0.7' });
  }
}
urls.push({ loc: 'privacy.html', priority: '0.2' });

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.map((u) => `  <url>
    <loc>${abs(u.loc)}</loc>
    <lastmod>${today}</lastmod>
    <priority>${u.priority}</priority>
${u.alts ? [...LANGS.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${abs(u.alts(l))}"/>`),
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${abs(u.alts('en'))}"/>`].join('\n') + '\n' : ''}  </url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), sitemap);
fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *
Allow: /
# Page affichée par le Chromecast et sources du site, sans intérêt dans les résultats de recherche.
Disallow: /tv/
Disallow: /src/

User-agent: Google-adstxt
Disallow:

Sitemap: ${SITE_URL}/sitemap.xml
`);
console.log(`${urls.length} pages, sitemap.xml et robots.txt écrits dans ${OUT}`);
