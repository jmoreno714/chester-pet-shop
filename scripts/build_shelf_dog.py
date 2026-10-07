"""Versiones del perro del CTA preparadas para verse chicas (estante del catálogo, ~90 px).
A ese tamaño las líneas finas del original (420 px) quedan de menos de medio píxel y se lavan:
acá se engrosan las líneas en el original, se reduce con Lanczos a 2x del tamaño en pantalla y se aplica nitidez."""
from PIL import Image, ImageFilter
W, H = 200, 112
for src, out in (('perro-cta-cuerpo', 'perro-estante-cuerpo'), ('perro-cta-cola', 'perro-estante-cola'), ('perro-cta-ojos-cerrados', 'perro-estante-ojos')):
    im = Image.open(f'assets/img/{src}.png').convert('RGBA')
    px = im.load()
    # máscara de líneas: píxeles oscuros y opacos
    mask = Image.new('L', im.size, 0); pm = mask.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a > 200 and (r * 0.3 + g * 0.59 + b * 0.11) < 85: pm[x, y] = 255
    thick = mask.filter(ImageFilter.MaxFilter(5))   # líneas ~2.5x más gruesas
    tk = thick.load()
    for y in range(im.height):
        for x in range(im.width):
            if tk[x, y] and px[x, y][3] > 0: px[x, y] = (47, 42, 46, px[x, y][3])
    small = im.resize((W, H), Image.LANCZOS)
    small = small.filter(ImageFilter.UnsharpMask(radius=1.2, percent=60, threshold=2))
    small.save(f'assets/img/{out}.png', optimize=True)
    print(out, small.size)
