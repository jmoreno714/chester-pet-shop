# Chester Pet Shop — brief del rediseño

## Objetivo

Chester Pet Shop ya existe como negocio real en Yerba Buena, Tucumán (alimento balanceado, fármacos y accesorios para mascotas, con envío a domicilio) y hoy vende a través de la tienda [pedix.app/chesterpetshop](https://pedix.app/chesterpetshop), con la estética genérica típica de esa plataforma (tema oscuro por defecto, sin relación con la marca). El objetivo de este proyecto es diseñar y construir un front nuevo, con identidad propia, que reemplace esa vidriera genérica — sin todavía tocar pagos ni la carga real de productos.

## Alcance de esta primera etapa

Front-end y UI/UX únicamente. No hay pasarela de pago. El catálogo se muestra con productos de ejemplo (placeholder) porque la forma de cargar productos reales (planilla, panel simple, o hardcodeado) todavía no está definida — queda para una etapa siguiente, una vez que el diseño esté aprobado.

## Decisión de stack

HTML, CSS y JS estático, sin build ni framework. Motivos: es el mismo flujo que ya usaste para el sitio anterior de Chester (prompts de Claude Code + GitHub Pages), no depende de instalar nada para editarlo, y para una etapa de solo-diseño no hace falta la complejidad de un framework. Cuando llegue el momento de cargar productos reales de forma dinámica, lo natural es migrar a Astro (content collections) o sumar un JSON + fetch sobre esta misma base visual — el diseño no se pierde, se reestructura el dato.

Estructura del repo:

```
chester-pet-shop/
  index.html          → home
  productos.html       → catálogo (placeholder)
  nosotros.html         → historia del local (placeholder)
  contacto.html         → WhatsApp + formulario de ejemplo
  assets/css/style.css  → sistema de diseño completo
  assets/js/main.js     → menú mobile + animación de sellos
  assets/img/           → vacío, a la espera de fotos reales
```

## Concepto de diseño elegido (iteración 2, con logo y link reales)

La primera pasada de este boceto (antes de tener el logo y el link) usaba una dirección "almacén de barrio" con paleta kraft y acentos oxblood/pino. Al llegar el isologo real — una ilustración de línea fina en negro de la cabeza de un boxer con collar y chapita "CHESTER", más el wordmark en mayúsculas espaciadas con una pata reemplazando la O de "PET SHOP" — quedó claro que esa dirección rústica no correspondía: el logo es prolijo, editorial, en blanco y negro, no rústico. Se revisó el concepto para anclarlo en el logo real en vez de en una idea inventada de "almacén".

Dirección actual: línea editorial en blanco y negro, con el isologo como protagonista, presentado como una lámina/placa de grabado (marco de línea fina, como una ficha de catálogo naturalista), y un único acento cálido tomado del collar de cuero del propio logo. Se sigue evitando los tres clichés de IA (crema + serif alta + terracota; negro + neón; diario con líneas finas) — acá ninguno aplica porque la base es blanco/hueso con tinta negra protagonista, no fondo oscuro ni cliché crema-serif.

Paleta: papel hueso `#F6F4EE`, papel oscuro `#ECE7DA` (secciones alternadas), tinta `#1C1B19` (texto y línea del logo), cuero/cognac `#A8572E` (acento primario, tomado del collar del logo), verde sello `#3F5C43` (acento secundario, color clásico de sello de tinta) y bronce `#B8933E` (etiquetas de precio).

Tipografía: Big Shoulders Display para títulos (condensada, en mayúsculas, hace eco del wordmark propio del logo), Karla para el cuerpo de texto, y Space Mono para etiquetas de precio y textos utilitarios.

Elemento firma: el isologo real montado como placa de grabado en el hero, con una etiqueta tipo cartón colgante ("Envío a domicilio") prendida en la esquina. Se mantuvo también el sello circular de tinta que "estampa" cada promesa en la sección "libro de reclamos, al revés" — no dependía de la paleta rústica, así que sobrevivió al cambio de concepto con los colores nuevos.

Las categorías del catálogo (Marcas premium, Húmedos, Fármacos, Camitas y accesorios) y las marcas listadas (Royal Canin, Eukanuba, Vitalcan, Sieger/Agility, Estampa) salen directo de la tienda actual en Pedix — dejaron de ser genéricas "para perros / para gatos".

## Qué falta para la siguiente vuelta

Ya tenemos logo, categorías reales y ubicación (Yerba Buena, Tucumán). Todavía falta: precios reales, fotos del local y de productos (para reemplazar los placeholders "foto del producto"), el número real de WhatsApp, la dirección exacta y los horarios de atención. El texto de "Nosotros" también sigue siendo placeholder — falta la historia real del local y de dónde salió el nombre "Chester".
