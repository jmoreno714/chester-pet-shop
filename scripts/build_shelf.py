"""Genera el SVG del estante del catálogo (productos.html). Estilo plano con trazo de tinta, paleta del sitio.
Cada producto es <g class="shelf-item" data-cat="..."> para reaccionar a los filtros (assets/js/shelf.js)."""
INK='#1C1B19'; PAPER='#F6F4EE'; PAPER2='#ECE7DA'; OX='#A8572E'; OXDK='#82401F'; PINE='#3F5C43'; BRASS='#B8933E'; SAND='#CBB99A'
S=f'stroke="{INK}" stroke-width="2" stroke-linejoin="round"'

def paw(cx,cy,c=INK):
    return (f'<ellipse cx="{cx}" cy="{cy+3}" rx="5" ry="4" fill="{c}"/>'
            + ''.join(f'<circle cx="{cx+dx}" cy="{cy+dy}" r="1.9" fill="{c}"/>' for dx,dy in ((-5.5,-3),(-2,-6.5),(2,-6.5),(5.5,-3))))
def cat_ears(cx,cy,c=INK):
    return f'<path d="M{cx-8} {cy+5} L{cx-6} {cy-6} L{cx-1} {cy-1} L{cx+1} {cy-1} L{cx+6} {cy-6} L{cx+8} {cy+5} Z" fill="{c}"/>'
def bone(cx,cy,c=INK):
    return (f'<rect x="{cx-7}" y="{cy-2}" width="14" height="4" rx="2" fill="{c}"/>'
            + ''.join(f'<circle cx="{cx+dx}" cy="{cy+dy}" r="2.6" fill="{c}"/>' for dx,dy in ((-7,-2),(-7,2),(7,-2),(7,2))))
def bag(cat, x, base, w, h, color, label=PAPER, icon=''):
    top=base-h
    return (f'<g class="shelf-item" data-cat="{cat}">'
            f'<rect x="{x}" y="{top+9}" width="{w}" height="{h-9}" rx="5" fill="{color}" {S}/>'
            f'<rect x="{x+4}" y="{top}" width="{w-8}" height="12" rx="2.5" fill="{color}" {S}/>'
            f'<path d="M{x+8} {top+6} H{x+w-8}" stroke="{INK}" stroke-width="1.4" stroke-dasharray="3 3"/>'
            f'<rect x="{x+8}" y="{top+26}" width="{w-16}" height="{round(h*0.36)}" rx="3" fill="{label}" {S}/>'
            f'{icon}</g>')

items=[]
T=142; B=272  # bases de las dos tablas
items.append(bag('vitalcan-perros', 34, T, 64, 96, PINE, icon=paw(66, T-96+26+round(96*.36)/2+1)))
items.append(bag('vitalcan-gatos', 108, T, 58, 86, BRASS, icon=cat_ears(137, T-86+26+round(86*.36)/2+1)))
items.append(bag('sieger-agility', 176, T, 58, 100, OX, icon=bone(205, T-100+26+round(100*.36)/2)))
items.append(bag('estampa', 244, T, 54, 80, PAPER2, label=OX, icon=f'<path d="M252 {T-80+30} H290" stroke="{PAPER}" stroke-width="3"/>'))
items.append(bag('eukanuba', 308, T, 60, 92, '#2E2C28', label=BRASS, icon=paw(338, T-92+26+round(92*.36)/2+1, INK)))
items.append(bag('royal-canin', 34, B, 70, 100, OXDK, label=PAPER, icon=f'<path d="M58 {B-100+40} l11 -7 l11 7 v6 h-22 Z" fill="{OX}" {S}/>'))
items.append(bag('otros-alimentos', 114, B, 50, 66, SAND, icon=paw(139, B-66+26+round(66*.36)/2+1, OXDK)))
# húmedos: latas apiladas
def can(x,y,w,h,c):
    return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="3" fill="{c}" {S}/>'
            f'<rect x="{x}" y="{y+h*0.32}" width="{w}" height="{h*0.36}" fill="{PAPER}" {S}/>'
            f'<ellipse cx="{x+w/2}" cy="{y+1}" rx="{w/2}" ry="3" fill="{SAND}" {S}/>')
items.append(f'<g class="shelf-item" data-cat="humedos">{can(176,B-30,34,30,PINE)}{can(212,B-30,34,30,OX)}{can(194,B-61,34,30,BRASS)}</g>')
# fármacos: caja con cruz + frasquito con pipeta
items.append(f'<g class="shelf-item" data-cat="farmacos">'
             f'<rect x="258" y="{B-56}" width="42" height="56" rx="3" fill="{PAPER}" {S}/>'
             f'<path d="M279 {B-40} v20 M269 {B-30} h20" stroke="{PINE}" stroke-width="6" stroke-linecap="round"/>'
             f'<rect x="306" y="{B-40}" width="18" height="40" rx="4" fill="{BRASS}" {S}/>'
             f'<rect x="310" y="{B-52}" width="10" height="13" rx="2" fill="{INK}"/></g>')
# camita con almohadón y pelotita
items.append(f'<g class="shelf-item" data-cat="camitas">'
             f'<path d="M334 {B} Q334 {B-38} 388 {B-38} Q442 {B-38} 442 {B} Z" fill="{OX}" {S}/>'
             f'<ellipse cx="388" cy="{B-14}" rx="40" ry="12" fill="{PAPER2}" {S}/>'
             f'<circle cx="452" cy="{B-9}" r="8" fill="{PINE}" {S}/>'
             f'<path d="M445 {B-12} q7 4 14 0" stroke="{PAPER}" stroke-width="1.6" fill="none"/></g>')

def plank(y):
    # soportes cortos en las puntas de la tabla, fuera de la zona de productos
    return (f'<rect x="20" y="{y}" width="440" height="11" rx="2" fill="{BRASS}" {S}/>'
            f'<path d="M24 {y+11} v10 h9 Z M456 {y+11} v10 h-9 Z" fill="{SAND}" {S}/>')

# el perro ahora es una animación Lottie superpuesta (assets/data/perro-estante.json, ver shelf.js)
dog = ''

svg=(f'<svg class="shelf-svg" viewBox="0 0 480 312" role="img" aria-label="Estante con alimentos, latas, fármacos y una camita; un perro sentado en la punta">'
     f'<defs><clipPath id="shelf-clip"><rect x="0" y="0" width="472" height="312"/></clipPath></defs>'
     f'<g clip-path="url(#shelf-clip)">{plank(T)}{plank(B)}{"".join(items)}{dog}</g></svg>')
print(svg)  # pegar dentro de <div class="catalog-shelf"> en productos.html
