# Cómo pedirle esto a Claude Code sin que salga genérico

Esta guía es para cuando sigas iterando este sitio vos mismo con Claude Code (local o acá). La idea central: un prompt vago ("hacé una landing moderna para una tienda de mascotas") produce, casi siempre, uno de tres resultados clonados — fondo crema con serif grande y acento terracota, fondo negro con un verde o rojo neón, o un diseño tipo diario con líneas finas y sin bordes redondeados. Ninguno tiene que ver con el negocio real, así que hay que escribir el prompt de manera que no le quede otra que salir de ahí.

## Ancla siempre en el negocio real, no en la categoría

No le pidas "una tienda de mascotas". Decile qué es Chester puntualmente: un almacén de comida para mascotas en Tucumán, que hoy vende por Pedix, con qué tono querés que hable, y qué lo distingue de un local cualquiera. Cuanto más específico el negocio en el prompt, menos margen tiene el modelo para caer en la plantilla por defecto.

Ejemplo de prompt pobre:

```
Hacé una landing page moderna para una tienda de comida de mascotas,
con hero, sección de productos y footer.
```

Ejemplo de prompt anclado:

```
Estoy rediseñando el sitio de Chester Pet Shop, un almacén de comida
para mascotas en San Miguel de Tucumán que hoy vende por Pedix
(link: [pegar acá]). Quiero alejarme del look de catálogo genérico
que tiene la tienda actual. Antes de tocar código, pensá un concepto
de diseño propio para este negocio: paleta de 4 a 6 colores con hex,
tipografías para título/cuerpo/detalle, un wireframe ASCII del layout,
y un elemento visual que sea la firma del sitio. Mostrame ese plan
primero y explicame por qué no es un diseño genérico de IA (evitá
específicamente: crema + serif alta + terracota, negro + acento neón,
o layout tipo diario con líneas finas).
```

## Pedile el plan antes que el código

Un buen prompt separa el diseño del código en dos pasos. Primero el plan (paleta, tipografía, layout, elemento firma) y una autocrítica explícita de si ese plan suena a "lo que haría para cualquier proyecto parecido". Recién después, con el plan aprobado, se escribe el HTML/CSS real. Si le pedís todo junto en un solo prompt gigante, es más probable que resuelva rápido con el patrón por defecto.

## Dale referencias reales, no solo texto

Cuando tengas el link de la tienda actual, capturas de pantalla, fotos del local o de productos, o el Instagram del negocio, pasáselos en el prompt o adjuntalos. Y decile explícitamente qué evitar además de qué imitar: por ejemplo "evitá iconos de huellitas y fotos de perros de stock" es tan útil como decirle qué sí usar. Higgsfield te sirve acá para generar o adaptar imágenes propias en vez de caer en bancos de fotos genéricos.

## Iterá por partes, no todo de una

Pedile primero el hero y una sección, revisalo, y recién ahí seguí con el resto. Un prompt que dice "hacé todo el sitio completo" tiende a resolver cada sección con el bloque más obvio (hero + 3 tarjetas + footer) porque no hay lugar para pensar cada una. De a partes, mantenés el control de que cada sección tenga una razón de ser específica de Chester y no sea relleno.

## Pedile evidencia visual antes de dar por terminado

Un buen cierre de prompt es pedirle que capture screenshots del resultado en desktop y en mobile (con Playwright, por ejemplo) y que se autocritique contra el plan original antes de decir que terminó. Así el diseño no se aprueba a ciegas, ni por vos ni por el propio Claude Code.

## Frases que conviene sumar siempre

Decile que evite Tailwind/shadcn por defecto si el objetivo es que no se note un stack genérico, que evite Inter/Poppins como tipografía de cuerpo salvo que las hayas elegido vos, y que cualquier animación tenga una razón (no motion por decoración). Y si alguna vez el resultado te suena "ya visto", decíselo así de directo — pedile que lo vuelva a pensar desde cero, no que lo retoque.
