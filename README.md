# Chester Pet Shop — sitio nuevo (fase 1: front/UI)

Sitio estático (HTML/CSS/JS, sin build) para el rediseño de Chester Pet Shop. Ver `PROJECT_BRIEF.md` para el objetivo y las decisiones de diseño, y `PROMPTS_GUIDE.md` para seguir iterando esto con Claude Code sin caer en resultados genéricos.

## Previsualizar en local

Abrir `index.html` directamente en el navegador funciona para ver el diseño, pero para que el menú mobile y las animaciones se comporten igual que en producción conviene levantar un servidor estático simple desde esta carpeta, por ejemplo con Python (`python3 -m http.server 8000`) y entrar a `http://localhost:8000`.

## Publicar en GitHub Pages

Subir esta carpeta a un repo de GitHub y activar Pages apuntando a la rama principal, carpeta raíz — no hace falta ningún paso de build porque el sitio ya es HTML/CSS/JS plano.

## Estado

Las cuatro páginas (`index.html`, `productos.html`, `nosotros.html`, `contacto.html`) están armadas con el sistema de diseño definitivo y el logo real (`assets/img/logo-chester.png`). Las categorías y marcas del catálogo (Royal Canin, Eukanuba, Vitalcan, Sieger/Agility, Estampa, húmedos, fármacos, camitas) salen de la tienda real en Pedix. Lo que sigue siendo placeholder: fotos de producto, precios, el texto de "Nosotros", el WhatsApp de ejemplo y la dirección/horarios exactos — marcados en el propio texto para reemplazar cuando llegue esa info.
