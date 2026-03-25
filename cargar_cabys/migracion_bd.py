import pandas as pd
from sqlalchemy import create_engine, text

# ==================== CONFIGURACIÓN (CÁMBIALO) ====================
DB_NAME = "agropecuario_pos"      # ← CAMBIA ESTO (ej: cabys_db, facturacion, etc.)
DB_USER = "root"
DB_PASS = "1234"
DB_HOST = "localhost"

EXCEL_PATH = "Catalogo-de-bienes-servicios.xlsx"

# ==================== LECTURA CON DIAGNÓSTICO ====================
print("Leyendo hoja 'Catálogo'...")
df = pd.read_excel(EXCEL_PATH, sheet_name="Catálogo", header=1)

print("\n=== COLUMNAS DETECTADAS EN EL EXCEL ===")
print(df.columns.tolist())
print("====================================\n")

# Selección flexible (por si los nombres varían un poco)
cabys_col = [c for c in df.columns if "Categoría 9" in str(c)][0]
desc_col  = [c for c in df.columns if "Descripción (categoría 9" in str(c)][0]
impuesto_col = [c for c in df.columns if "Impuesto" in str(c)][0]

df = df[[cabys_col, desc_col, impuesto_col]].copy()
df.columns = ["cabys_code", "description", "tax_rate"]

# Limpieza
df["cabys_code"] = df["cabys_code"].astype(str).str.strip().str.zfill(13)
df["description"] = df["description"].astype(str).str.strip()
df["tax_rate"] = pd.to_numeric(df["tax_rate"], errors="coerce")

df = df.dropna(subset=["cabys_code", "description", "tax_rate"])
df = df[df["cabys_code"].str.len() == 13]

print(f"✅ Registros listos para cargar: {len(df):,}")

# ==================== CREACIÓN DE TABLA Y CARGA ====================
engine = create_engine(f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}/{DB_NAME}?charset=utf8mb4")

with engine.connect() as conn:
    conn.execute(text("""
        CREATE TABLE IF NOT EXISTS cabys (
            id INT AUTO_INCREMENT PRIMARY KEY,
            cabys_code VARCHAR(13) NOT NULL UNIQUE,
            description VARCHAR(1000) NOT NULL,
            tax_rate DECIMAL(5,4) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_cabys (cabys_code),
            INDEX idx_tax (tax_rate)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """))

    result = conn.execute(text("SELECT COUNT(*) FROM cabys")).scalar()
    if result > 0:
        print(f"El catálogo CABYS ya tiene {result} registros. Omitiendo carga repetida.")
    else:
        df.to_sql("cabys", engine, if_exists="append", index=False, method="multi", chunksize=5000)
        print("🎉 ¡Catálogo CABYS cargado correctamente!")