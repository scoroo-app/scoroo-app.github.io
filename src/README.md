# Sources du site de Scoroo

Le site (https://scoroo-app.github.io) est servi par GitHub Pages depuis la racine de ce dépôt. Les
pages d'accueil et les pages des jeux y sont **générées** : ne pas les modifier à la main.

- `index.template.html` : modèle de la page d'accueil (styles, textes des cinq langues dans `I18N`,
  script de la page). C'est ici qu'on modifie l'accueil.
- `rules.json` : règles des jeux, exportées depuis le dépôt de l'appli (`../Scoroo`) par
  `flutter test tool/site/rules_dump_test.dart`.
- `build_site.mjs` : génère `index.html` (français), `<langue>/index.html`, les pages des jeux
  (`jeux/`, `en/games/`, `es/juegos/`, `de/spiele/`, `it/giochi/`), `sitemap.xml` et `robots.txt`.
- `og_images.py` : images d'aperçu des liens `img/og_<langue>.jpg`, tirées de `../Scoroo/store/`.
- `site_check.mjs` : vérifie l'affichage dans Chrome (débordements, captures dans `build/`).

Écrits à la main, hors génération : `privacy.html`, `download/`, `g/` (jeux partagés), `tv/` (page du
Chromecast), `.well-known/` (liens qui ouvrent l'appli), `app-ads.txt`.

Mettre à jour le site :

```bash
node src/build_site.mjs
node src/site_check.mjs            # facultatif : --games=all, --langs=fr,en, --sizes=390x844
git add -A && git commit -m "…" && git push
```
