"""Genera assets/js/ilustraciones.js: un dibujo por categoría (el mismo producto del estante del
catálogo, recortado y apoyado en un tramo de tabla) para la ficha de producto mientras no haya fotos.
Correr: py scripts/build_ilustraciones.py"""
import json, re, os, sys
sys.path.insert(0, os.path.dirname(__file__))
import build_shelf as bs

T, B = bs.T, bs.B
# caja de cada producto en el SVG del estante: x0, arriba, x1, base (la base es la tabla)
CAJAS = {
    'vitalcan-perros': (34, T-96, 98, T),
    'vitalcan-gatos': (108, T-86, 166, T),
    'sieger-agility': (176, T-100, 234, T),
    'estampa': (244, T-80, 298, T),
    'eukanuba': (308, T-92, 368, T),
    'royal-canin': (34, B-100, 104, B),
    'otros-alimentos': (114, B-66, 164, B),
    'humedos': (176, B-64, 246, B),
    'farmacos': (258, B-56, 324, B),
    'camitas': (334, B-38, 460, B),
}

def grupo(cat):
    for it in bs.items:
        if f'data-cat="{cat}"' in it:
            return it.replace('class="shelf-item"', 'class="ilus-item"', 1)
    raise KeyError(cat)

out = {}
for cat, (x0, y0, x1, base) in CAJAS.items():
    w, h = x1 - x0, base - y0
    alto = h + 11                      # producto + tabla
    lado = max(w + 28, alto) / 0.62    # el dibujo ocupa ~62% del cuadro
    vx = (x0 + x1) / 2 - lado / 2
    vy = y0 + alto / 2 - lado / 2 + 4
    tabla = (f'<rect x="{x0-14}" y="{base}" width="{w+28}" height="11" rx="2" fill="{bs.BRASS}" {bs.S}/>')
    out[cat] = (f'<svg viewBox="{vx:.1f} {vy:.1f} {lado:.1f} {lado:.1f}" aria-hidden="true" focusable="false">'
                f'{tabla}{grupo(cat)}</svg>')

js = ('// Generado por scripts/build_ilustraciones.py (no editar a mano): un dibujo por categoría,\n'
      '// el mismo del estante del catálogo, para la ficha mientras no haya fotos de producto.\n'
      'window.ChesterIlustraciones = ' + json.dumps(out, ensure_ascii=False, indent=1) + ';\n')
open(os.path.join(os.path.dirname(__file__), '..', 'assets', 'js', 'ilustraciones.js'), 'w', encoding='utf-8').write(js)
print('ok', len(out), len(js))
