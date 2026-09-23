# -*- coding: utf-8 -*-
import openpyxl, json, re

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
    "Old Prince", "Fawna", "Nutrique", "Therapy", "Belcan",
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

counts = {}
for p in productos:
    counts[p["categoria"]] = counts.get(p["categoria"], 0) + 1

with open(OUT, "w", encoding="utf-8") as f:
    json.dump(productos, f, ensure_ascii=False, indent=2)

print("total productos:", len(productos))
print("excluidos ENVIOS:", skipped_envios)
print("excluidos Inactivo:", skipped_inactivo)
print("por categoria:", counts)
print("sin precio:", sum(1 for p in productos if p["precio"] is None))
