# -*- coding: utf-8 -*-
import openpyxl, json, re, unicodedata
from collections import OrderedDict

SRC = r"C:\Users\Joaquin\Desktop\Chester new\chester-pet-shop\inventario_stock_actual.xlsx"
OUT = r"C:\Users\Joaquin\Desktop\Chester new\chester-pet-shop\assets\data\productos.json"

FARMACO_BRANDS = {
    "CIDAR", "Ectholaner", "Ecthol Collar Antipulgas", "Frontline", "SIMPARICA",
    "Ocladerm", "Osspret", "Tea", "MV",
}
CAMITAS_BRANDS = {
    "NamuPets", "VitalFun", "PELLET", "Absorsol",
}
# líneas que el cliente confirmó que son todas Vitalcan (se separan
# perro/gato según lo que diga el nombre del producto)
VITALCAN_BRANDS = {
    "Vitalcan Premium", "Balanced", "Balanced Natural Recipe", "Complete",
    "Old Prince", "Fawna", "Nutrique", "Therapy", "Belcan", "Belcat",
    "Criadores Maintenance",
}
SIEGER_AGILITY_BRANDS = {"SIEGER", "Agility"}
ESTAMPA_BRANDS = {"Estampa Plus", "Estampa Criadores"}
EUKANUBA_BRANDS = {"Eukanuba"}
ROYAL_CANIN_BRANDS = {"Royal Canin"}
EXCLUDE_CATEGORIES = {"ENVIOS"}

WET_RE = re.compile(r"\b(lata|latas|pouch|sobre|sobres)\b", re.IGNORECASE)
GATO_RE = re.compile(r"\bgato\b", re.IGNORECASE)
ROYAL_CANIN_RE = re.compile(r"royal\s*canin", re.IGNORECASE)
EUKANUBA_RE = re.compile(r"eukanuba", re.IGNORECASE)

def classify(nombre, marca):
    if WET_RE.search(nombre):
        return "humedos"
    # el nombre del producto manda si menciona una marca puntual —
    # cubre errores de tipeo en la columna Categoría de la planilla
    # (ej.: un "Royal Canin" cargado como "Balanced")
    if ROYAL_CANIN_RE.search(nombre):
        return "royal-canin"
    if EUKANUBA_RE.search(nombre):
        return "eukanuba"
    if marca in FARMACO_BRANDS:
        return "farmacos"
    if marca in CAMITAS_BRANDS:
        return "camitas"
    if marca in VITALCAN_BRANDS:
        return "vitalcan-gatos" if GATO_RE.search(nombre) else "vitalcan-perros"
    if marca in SIEGER_AGILITY_BRANDS:
        return "sieger-agility"
    if marca in ESTAMPA_BRANDS:
        return "estampa"
    if marca in EUKANUBA_BRANDS:
        return "eukanuba"
    if marca in ROYAL_CANIN_BRANDS:
        return "royal-canin"
    return "otros-alimentos"

wb = openpyxl.load_workbook(SRC, data_only=True)
ws = wb.active
rows = list(ws.iter_rows(values_only=True))
header, data = rows[0], rows[1:]

productos = []
skipped_envios = 0
skipped_inactivo = 0

for r in data:
    nombre, marca, stock, costo, valor_total, codigo, estado, precio = r
    if marca in EXCLUDE_CATEGORIES:
        skipped_envios += 1
        continue
    if estado == "Inactivo":
        skipped_inactivo += 1
        continue
    if not nombre:
        continue
    nombre = str(nombre).strip()
    marca = str(marca).strip() if marca else ""
    categoria = classify(nombre, marca)
    precio_val = None
    if isinstance(precio, (int, float)):
        precio_val = round(precio)
    productos.append({
        "nombre": nombre,
        "marca": marca,
        "categoria": categoria,
        "precio": precio_val,
        "codigo": str(codigo) if codigo else "",
    })

# --- agrupar por peso: "Balanced Gato Adulto x 2Kg" / "x 7,5 Kg" / "x 15 Kg"
# son el mismo producto con distinto kilaje, no productos distintos ---
WEIGHT_RE = re.compile(r"\s*[xX]?\s*(\d+(?:[.,]\d+)?)\s*(kgs?|grs?|g)\.?\s*$", re.IGNORECASE)

def split_weight(nombre):
    m = WEIGHT_RE.search(nombre)
    if not m:
        return re.sub(r"\s+", " ", nombre).strip(), None
    valor = float(m.group(1).replace(",", "."))
    unidad = "kg" if m.group(2).lower().startswith("kg") else "g"
    num_str = str(int(valor)) if valor == int(valor) else str(valor).replace(".", ",")
    peso = f"{num_str} {unidad}"
    base = nombre[: m.start()].strip().rstrip(",.").strip()
    base = re.sub(r"\s+", " ", base)
    return base, peso

def peso_a_kg(peso):
    if not peso:
        return 0
    valor, unidad = peso.split(" ")
    valor = float(valor.replace(",", "."))
    return valor if unidad == "kg" else valor / 1000

def slugify(texto):
    texto = unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode("ascii")
    texto = texto.lower()
    return re.sub(r"[^a-z0-9]+", "-", texto).strip("-")

# título a mostrar: le suma al nombre base los kilajes disponibles
# (ej. "Balanced Gato Adulto" + variantes 2kg/7,5kg -> "Balanced Gato Adulto 2-7,5 kg")
def titulo_con_pesos(nombre, variantes):
    pesos = [v["peso"] for v in variantes if v["peso"]]
    if not pesos:
        return nombre
    numeros, unidades = [], set()
    for peso in pesos:
        num, unidad = peso.split(" ")
        numeros.append(num)
        unidades.add(unidad)
    if len(unidades) == 1:
        return f"{nombre} {'-'.join(numeros)} {unidades.pop()}"
    return f"{nombre} {' / '.join(pesos)}"

grupos = OrderedDict()
for p in productos:
    # en fármacos el "X a Y kg" de nombre es el rango de peso de la mascota
    # para elegir la dosis, no un tamaño de envase — no se agrupa por eso
    if p["categoria"] == "farmacos":
        base, peso = re.sub(r"\s+", " ", p["nombre"]).strip(), None
    else:
        base, peso = split_weight(p["nombre"])
    # sin peso detectado: nunca se agrupa con otro (evita mezclar productos
    # distintos que comparten nombre pero son renglones separados en la planilla)
    key = (p["marca"], base.lower()) if peso else (p["marca"], base.lower(), p["codigo"])
    if key not in grupos:
        grupos[key] = {
            "nombre": base,
            "marca": p["marca"],
            "categoria": p["categoria"],
            "variantes": [],
        }
    grupos[key]["variantes"].append({
        "peso": peso,
        "precio": p["precio"],
        "codigo": p["codigo"],
    })

catalogo = []
slugs_usados = set()
for g in grupos.values():
    g["variantes"].sort(key=lambda v: peso_a_kg(v["peso"]))
    slug = slugify(f"{g['marca']}-{g['nombre']}")
    if slug in slugs_usados:
        slug = slugify(f"{g['marca']}-{g['nombre']}-{g['variantes'][0]['codigo']}")
    slugs_usados.add(slug)
    g["slug"] = slug
    g["titulo"] = titulo_con_pesos(g["nombre"], g["variantes"])
    catalogo.append(g)

counts = {}
for g in catalogo:
    counts[g["categoria"]] = counts.get(g["categoria"], 0) + 1
con_variantes = sum(1 for g in catalogo if len(g["variantes"]) > 1)

with open(OUT, "w", encoding="utf-8") as f:
    json.dump(catalogo, f, ensure_ascii=False, indent=2)

print("total items planilla:", len(productos))
print("total productos (agrupados):", len(catalogo))
print("productos con variantes de peso:", con_variantes)
print("excluidos ENVIOS:", skipped_envios)
print("excluidos Inactivo:", skipped_inactivo)
print("por categoria:", counts)
print("sin precio:", sum(1 for p in productos if p["precio"] is None))
