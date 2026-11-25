# Images d'aperçu des liens du site (WhatsApp, LinkedIn, Facebook, X…), 1200 × 630, une par langue :
# l'image 1920 × 1280 de l'App Store (store/appstore_1920x1280_<langue>.png du dépôt de l'appli, voisin
# de celui-ci : ../Scoroo), logo, nom et accroche au milieu, pictogrammes des jeux autour, réduite
# puis recadrée au centre.
#
#   python src/og_images.py   →   img/og_<langue>.jpg (moins de 300 Ko : WhatsApp ignore les images plus lourdes)
from pathlib import Path

from PIL import Image

SITE = Path(__file__).resolve().parent.parent
STORE = SITE.parent / 'Scoroo' / 'store'

for lang in ['fr', 'en', 'es', 'de', 'it']:
    src = Image.open(STORE / f'appstore_1920x1280_{lang}.png').convert('RGB')
    w = 1200
    h = round(src.height * w / src.width)
    img = src.resize((w, h), Image.LANCZOS)
    top = (h - 630) // 2
    img.crop((0, top, w, top + 630)).save(SITE / 'img' / f'og_{lang}.jpg', quality=86, optimize=True)
    print(lang, 'ok')
