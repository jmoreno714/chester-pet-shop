# -*- coding: utf-8 -*-
# Pone ?v=<fecha-hora> a los CSS/JS propios en todas las páginas, para que
# el navegador no mezcle un JS nuevo con un CSS viejo guardado en caché.
# Correr antes de publicar un cambio de CSS o JS:  py scripts/bump_version.py
import glob, os, re, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VERSION = time.strftime("%Y%m%d%H%M")
PATRON = re.compile(r'((?:href|src)="assets/(?:css|js)/[^"?]+\.(?:css|js))(?:\?v=[^"]*)?"')

for f in sorted(glob.glob(os.path.join(ROOT, "*.html"))):
    with open(f, encoding="utf-8") as fh:
        s = fh.read()
    nuevo, n = PATRON.subn(lambda m: f'{m.group(1)}?v={VERSION}"', s)
    if nuevo != s:
        with open(f, "w", encoding="utf-8", newline="") as fh:
            fh.write(nuevo)
    print(os.path.basename(f), n, "referencias")
print("versión", VERSION)
