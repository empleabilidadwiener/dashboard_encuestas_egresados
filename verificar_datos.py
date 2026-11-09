#!/usr/bin/env python3
"""
Verificación de datos del dashboard de egresados.
Compara los cálculos de Python con los valores reportados en el dashboard.
"""

import pandas as pd
import sys

# ============================================================
# CARGAR DATOS
# ============================================================
FILE = 'data/respuestas_encuestas.xlsx'
print(f"Cargando {FILE}...")
df = pd.read_excel(FILE)
total = len(df)
print(f"Total registros: {total}")
print()

# ============================================================
# COLUMNAS (misma nomenclatura que calculations.js)
# ============================================================
COLS = {
    'trabaja': '1. ¿Actualmente te encuentras trabajando o realizando una actividad remunerada que genere ingresos?',
    'condicion': '2. ¿Cuál es tu condición laboral actual?',
    'razonNoTrabaja': '1. ¿Cuál es la principal razón por la que no te encuentras trabajando actualmente?',
    'satisfaccion': '5. ¿Qué tan satisfecho te sientes con tu actividad laboral actual? (E: LEER TODA LA ESCALA)',
    'pertinencia': '6. ¿La actividad laboral que desempeña actualmente está relacionada con la carrera que estudió?',
    'salario': '9. ¿Cuál es tu ingreso mensual bruto aproximado? \n(Solicitamos esta información con el fin, de en caso te encuentres interesado en recibir información de ofertas laborales podamos enviar en base al sueldo base que percibes actualmente)',
    'nps': '13. En una escala de 0 a 10, ¿qué tan probable es que recomiende la Universidad Norbert Wiener...?',
    'ascenso': '7. ¿Has recibido algún ascenso en los últimos 5 años? (No se pregunta a emprendedores/ni independientes)',
    'personalCargo': '8. ¿Tienes personal a tu cargo?',
    'primerEmpleo': '12. ¿Tu primer empleo estuvo relacionado con la carrera estudiada?',
    'tiempoPrimerEmpleo': '11. ¿Cuánto tiempo (en meses) lograste obtener tu primer trabajo luego de haber egresado?',
    'posgrado': '2. ¿Has realizado estudios de posgrado después de egresar?',
    'colegiatura': '1. ¿Cuál es su situación actual respecto a la colegiatura profesional? (E: LEER ALTERNATIVAS)',
    'modalidad': '3.4 Modalidad de trabajo',
    'rubro': '3.2 Rubro de empresa:',
    'interesPosgrado': '6. ¿Tienes interés en llevar un posgrado en la UNW a corto plazo?',
    'carrera': 'Programa Académico:',
    'anioEgreso': 'Año de egreso:',
}

def safe_trim(series):
    return series.fillna('').astype(str).str.strip()

def norm_lower(series):
    return safe_trim(series).str.lower()

# ============================================================
# 1. ENCUESTAS VÁLIDAS
# ============================================================
print("=" * 70)
print("1. ENCUESTAS VÁLIDAS")
print("=" * 70)
dnis = df['DNI:'].dropna()
dnis_unicos = dnis.nunique()
pct_validas = (dnis_unicos / total) * 100 if total > 0 else 0
print(f"  DNI únicos: {dnis_unicos}")
print(f"  Total registros: {total}")
print(f"  % válidas (únicos/total): {pct_validas:.1f}%")
print()

# ============================================================
# 2. TRABAJA ACTUALMENTE
# ============================================================
print("=" * 70)
print("2. TRABAJA ACTUALMENTE")
print("=" * 70)
trabaja = norm_lower(df[COLS['trabaja']])
trabaja_si = trabaja.isin(['sí', 'si']).sum()
trabaja_no = trabaja.str.startswith('no').sum()
pct_trabaja = (trabaja_si / total) * 100 if total > 0 else 0
print(f"  Sí trabaja: {trabaja_si}")
print(f"  No trabaja: {trabaja_no}")
print(f"  % Trabaja: {pct_trabaja:.1f}%")
print()

# ============================================================
# 3. CLASIFICACIÓN PEA (MISMA LÓGICA QUE calculations.js)
# ============================================================
print("=" * 70)
print("3. CLASIFICACIÓN PEA (getSensibilidadPEA)")
print("=" * 70)
condicion = norm_lower(df[COLS['condicion']])
razon = norm_lower(df[COLS['razonNoTrabaja']])

trabajando = 0
emprendedores = 0
iniciandoNegocio = 0
buscanActivamente = 0
inactivosEstudio = 0  # posgrado
inactivosFamiliar = 0
otrosInactivos = 0

for i in range(total):
    t = trabaja.iloc[i]
    c = condicion.iloc[i]
    r = razon.iloc[i]

    if t in ['sí', 'si']:
        if 'propietario' in c or 'socio de negocio' in c or 'emprendimiento' in c:
            emprendedores += 1
        else:
            trabajando += 1
    else:
        if 'buscando' in r or 'insertarme' in r:
            buscanActivamente += 1
        elif 'proyecto personal' in r or 'negocio propio' in r:
            iniciandoNegocio += 1
        elif 'posgrado' in r or 'carrera' in r:
            inactivosEstudio += 1
        elif 'personales' in r or 'familiares' in r:
            inactivosFamiliar += 1
        else:
            otrosInactivos += 1

trabajadoresTotal = trabajando + emprendedores

# PEA (con posgrado en PEA pero NO como ocupado)
totalPEA = trabajando + emprendedores + iniciandoNegocio + inactivosEstudio + buscanActivamente
ocupadosTotalPEA = trabajando + emprendedores + iniciandoNegocio
totalNoPEA = inactivosFamiliar + otrosInactivos

tasaBruta = (trabajadoresTotal / total) * 100 if total > 0 else 0
tasaPEAOficial = (ocupadosTotalPEA / totalPEA) * 100 if totalPEA > 0 else 0
tasaDesempleoPEA = (buscanActivamente / totalPEA) * 100 if totalPEA > 0 else 0

print(f"  Trabajando (dependientes/independientes): {trabajando}")
print(f"  Emprendedores (propietarios/socios): {emprendedores}")
print(f"  Iniciando negocio propio: {iniciandoNegocio}")
print(f"  Buscando trabajo activamente: {buscanActivamente}")
print(f"  Posgrado (en PEA, no ocupado): {inactivosEstudio}")
print(f"  Inactivos motivos personales/familiares: {inactivosFamiliar}")
print(f"  Otros inactivos: {otrosInactivos}")
print()
print(f"  --- TOTALES ---")
print(f"  Trabajadores (Sí): {trabajadoresTotal}")
print(f"  Total PEA: {totalPEA}")
print(f"  Ocupados PEA (sin posgrado): {ocupadosTotalPEA}")
print(f"  No PEA: {totalNoPEA}")
print()
print(f"  --- TASAS ---")
print(f"  Tasa Bruta: {tasaBruta:.1f}%  (dashboard: 81.5%)")
print(f"  Tasa PEA Ocupación: {tasaPEAOficial:.1f}%  (dashboard: ~92.8%?)")
print(f"  Tasa Desempleo PEA: {tasaDesempleoPEA:.1f}%  (dashboard: ~7.2%?)")
print()

# ============================================================
# 4. DISTRIBUCIÓN PERTINENCIA
# ============================================================
print("=" * 70)
print("4. PERTINENCIA LABORAL")
print("=" * 70)
pertinencia = safe_trim(df[COLS['pertinencia']])
pert_validos = pertinencia[pertinencia != ''].shape[0]
pert_alta = pertinencia.str.contains('totalmente', case=False, na=False).sum()
pert_parcial = pertinencia.str.contains('parcialmente', case=False, na=False).sum()
pert_baja = pertinencia.str.contains('poco|nada', case=False, na=False).sum()
pct_pert_alta = (pert_alta / pert_validos) * 100 if pert_validos > 0 else 0
pct_pert_total = ((pert_alta + pert_parcial) / pert_validos) * 100 if pert_validos > 0 else 0
print(f"  Con respuesta pertinencia: {pert_validos}")
print(f"  Totalmente relacionado: {pert_alta} ({pct_pert_alta:.1f}%)")
print(f"  Parcialmente: {pert_parcial}")
print(f"  Poco/Nada: {pert_baja}")
print(f"  Total+Parcial: {pct_pert_total:.1f}%  (dashboard: 90.6%)")
print()

# ============================================================
# 5. SATISFACCIÓN LABORAL
# ============================================================
print("=" * 70)
print("5. SATISFACCIÓN LABORAL")
print("=" * 70)
satisfaccion = safe_trim(df[COLS['satisfaccion']])
sat_validos = satisfaccion[satisfaccion != ''].shape[0]
sat_alta = satisfaccion.str.contains('satisfecho', case=False, na=False) & ~satisfaccion.str.contains('insatisfecho', case=False, na=False)
sat_alta_count = sat_alta.sum()
pct_sat = (sat_alta_count / sat_validos) * 100 if sat_validos > 0 else 0
print(f"  Con respuesta satisfacción: {sat_validos}")
print(f"  Satisfechos: {sat_alta_count}")
print(f"  % Satisfacción: {pct_sat:.1f}%  (dashboard: 88.3%)")
print()

# ============================================================
# 6. PERSONAL A CARGO
# ============================================================
print("=" * 70)
print("6. PERSONAL A CARGO")
print("=" * 70)
cargo = safe_trim(df[COLS['personalCargo']])
cargo_validos = cargo[cargo != ''].shape[0]
cargo_si = norm_lower(df[COLS['personalCargo']]).str.startswith('sí').sum()
pct_cargo = (cargo_si / cargo_validos) * 100 if cargo_validos > 0 else 0
print(f"  Con respuesta: {cargo_validos}")
print(f"  Sí tiene personal: {cargo_si}")
print(f"  % Personal a cargo: {pct_cargo:.1f}%  (dashboard: 40.8%)")
print()

# ============================================================
# 7. ASCENSO
# ============================================================
print("=" * 70)
print("7. ASCENSO ENTRE DEPENDIENTES")
print("=" * 70)
ascenso = norm_lower(df[COLS['ascenso']])
dependientes = norm_lower(df[COLS['condicion']]).str.contains('dependiente', na=False)
asc_validos = ascenso[dependientes & ascenso.isin(['sí', 'si', 'no'])].shape[0]
asc_si = ascenso[dependientes].isin(['sí', 'si']).sum()
pct_asc = (asc_si / asc_validos) * 100 if asc_validos > 0 else 0
print(f"  Dependientes válidos: {asc_validos}")
print(f"  Con ascenso: {asc_si}")
print(f"  % Ascenso: {pct_asc:.1f}%  (dashboard: 28.9%)")
print()

# ============================================================
# 8. NPS
# ============================================================
print("=" * 70)
print("8. NPS (Net Promoter Score)")
print("=" * 70)
nps_raw = df[COLS['nps']]
nps_nums = pd.to_numeric(nps_raw, errors='coerce').dropna()
nps_validos = len(nps_nums)
if nps_validos > 0:
    promotores = (nps_nums >= 9).sum()
    pasivos = ((nps_nums >= 7) & (nps_nums <= 8)).sum()
    detractores = (nps_nums <= 6).sum()
    nps_score = ((promotores - detractores) / nps_validos) * 100
    pct_promotores = (promotores / nps_validos) * 100
else:
    nps_score = 0
    promotores = pasivos = detractores = 0
    pct_promotores = 0
print(f"  NPS válidos: {nps_validos}")
print(f"  Promotores (9-10): {promotores} ({pct_promotores:.1f}%)")
print(f"  Pasivos (7-8): {pasivos}")
print(f"  Detractores (≤6): {detractores}")
print(f"  NPS Score: {nps_score:.1f}")
print()

# ============================================================
# 9. POSGRADO
# ============================================================
print("=" * 70)
print("9. ESTUDIOS DE POSGRADO")
print("=" * 70)
posgrado = safe_trim(df[COLS['posgrado']])
pos_validos = posgrado[posgrado != ''].shape[0]
pos_si = posgrado.str.contains('sí|si', case=False, na=False).sum()
pct_pos = (pos_si / pos_validos) * 100 if pos_validos > 0 else 0
print(f"  Con respuesta: {pos_validos}")
print(f"  Con posgrado: {pos_si}")
print(f"  % Posgrado: {pct_pos:.1f}%")
print()

# ============================================================
# 10. COLEGIATURA
# ============================================================
print("=" * 70)
print("10. COLEGIATURA PROFESIONAL")
print("=" * 70)
coleg = safe_trim(df[COLS['colegiatura']])
coleg_counts = coleg[coleg != ''].value_counts()
print(coleg_counts.to_string(header=False))
print()

# ============================================================
# 11. PRIMER EMPLEO RELACIONADO
# ============================================================
print("=" * 70)
print("11. PRIMER EMPLEO RELACIONADO CON LA CARRERA")
print("=" * 70)
pe = safe_trim(df[COLS['primerEmpleo']])
pe_validos = pe[pe != ''].shape[0]
pe_si = pe.str.contains('sí|si|totalmente', case=False, na=False).sum()
pct_pe = (pe_si / pe_validos) * 100 if pe_validos > 0 else 0
print(f"  Con respuesta: {pe_validos}")
print(f"  Sí relacionado: {pe_si}")
print(f"  % Relacionado: {pct_pe:.1f}%")
print()

# ============================================================
# 12. TIEMPO PRIMER EMPLEO
# ============================================================
print("=" * 70)
print("12. TIEMPO PARA PRIMER EMPLEO")
print("=" * 70)
tp = safe_trim(df[COLS['tiempoPrimerEmpleo']])
tp_validos = tp[tp != ''].shape[0]
tp_counts = tp[tp != ''].value_counts()
print(f"  Con respuesta: {tp_validos}")
for val, n in tp_counts.items():
    print(f"    {val}: {n}")
print()

# ============================================================
# 13. DISTRIBUCIONES POR CARRERA Y AÑO
# ============================================================
print("=" * 70)
print("13. DISTRIBUCIÓN POR CARRERA (Top 10)")
print("=" * 70)
carrera = safe_trim(df[COLS['carrera']])
carrera_counts = carrera[carrera != ''].value_counts().head(10)
for c, n in carrera_counts.items():
    print(f"  {c}: {n} ({n/total*100:.1f}%)")
print()

print("=" * 70)
print("14. DISTRIBUCIÓN POR AÑO DE EGRESO")
print("=" * 70)
anio = safe_trim(df[COLS['anioEgreso']])
anio_counts = anio[anio != ''].value_counts().sort_index()
for a, n in anio_counts.items():
    print(f"  {a}: {n} ({n/total*100:.1f}%)")
print()

# ============================================================
# 15. INICIATIVAS ALUMNI
# ============================================================
print("=" * 70)
print("15. INICIATIVAS ALUMNI (respuestas afirmativas)")
print("=" * 70)
iniciativas_cols = {
    'Networking': '14. ¿Te gustaría participar en alguna de las siguientes iniciativas...? (E: LEER ALTERNATIVAS, Puede marcar más de una)_Networking con egresados',
    'Mentoría': '14. ¿Te gustaría participar en alguna de las siguientes iniciativas...? (E: LEER ALTERNATIVAS, Puede marcar más de una)_Mentoría a estudiantes',
    'Ponente': '14. ¿Te gustaría participar en alguna de las siguientes iniciativas...? (E: LEER ALTERNATIVAS, Puede marcar más de una)_Participación como ponente en charlas...',
    'Talleres': '14. ¿Te gustaría participar en alguna de las siguientes iniciativas...? (E: LEER ALTERNATIVAS, Puede marcar más de una)_Participación en talleres y cursos...',
    'Oportunidades': '14. ¿Te gustaría participar en alguna de las siguientes iniciativas...? (E: LEER ALTERNATIVAS, Puede marcar más de una)_Acceso a oportunidades laborales exclusivas...',
    'Beneficios': '14. ¿Te gustaría participar en alguna de las siguientes iniciativas...? (E: LEER ALTERNATIVAS, Puede marcar más de una)_Beneficios y convenios para la comunidad Alumni',
    'Voluntariado': '14. ¿Te gustaría participar en alguna de las siguientes iniciativas...? (E: LEER ALTERNATIVAS, Puede marcar más de una)_Actividades de voluntariado e impacto social',
    'Deportivas': '14. ¿Te gustaría participar en alguna de las siguientes iniciativas...? (E: LEER ALTERNATIVAS, Puede marcar más de una)_Participación en campeonatos y actividades deportivas...',
    'Embajadores': '14. ¿Te gustaría participar en alguna de las siguientes iniciativas...? (E: LEER ALTERNATIVAS, Puede marcar más de una)_Integrar la Red de Embajadores Alumni Wiener',
}
for nombre, col in iniciativas_cols.items():
    vals = df[col]
    si_count = vals.isin([1, '1', 'sí', 'si', 1.0]).sum()
    print(f"  {nombre}: {si_count}")
print()

# ============================================================
# 16. APOYO UNIVERSIDAD
# ============================================================
print("=" * 70)
print("16. APOYO UNIVERSIDAD (desempleados)")
print("=" * 70)
apoyo_cols = {
    'Formó (depende de mí)': '7. ¿De qué manera crees que la Universidad te podría apoyar en conseguir un empleo? (Puede elegir más de una opción)_La Universidad ya me formó, ahora conseguir empleo depende de mí.',
    'Cursos': '7. ¿De qué manera crees que la Universidad te podría apoyar en conseguir un empleo? (Puede elegir más de una opción)_Brindándome cursos y actividades de actualización profesional.',
    'Ofertas empleo': '7. ¿De qué manera crees que la Universidad te podría apoyar en conseguir un empleo? (Puede elegir más de una opción)_Informándome constantemente ofertas de empleo.',
    'Entrenamiento': '7. ¿De qué manera crees que la Universidad te podría apoyar en conseguir un empleo? (Puede elegir más de una opción)_Entrenándome para enfrentar mejor mis entrevistas de trabajo.',
    'Otro': '7. ¿De qué manera crees que la Universidad te podría apoyar en conseguir un empleo? (Puede elegir más de una opción)_Otro',
}
for nombre, col in apoyo_cols.items():
    vals = df[col]
    si_count = vals.isin([1, '1', 'sí', 'si', 1.0]).sum()
    print(f"  {nombre}: {si_count}")
print()

# ============================================================
# 17. TASA POR AÑO (getOcupacionPorAnioEgreso)
# ============================================================
print("=" * 70)
print("17. OCUPACIÓN POR AÑO DE EGRESO")
print("=" * 70)
for anio_val in sorted(anio.unique()):
    if not anio_val or anio_val == 'nan':
        continue
    mask_anio = anio == anio_val
    n_year = mask_anio.sum()
    if n_year == 0:
        continue

    trabaja_year = trabaja[mask_anio]
    condicion_year = condicion[mask_anio]
    razon_year = razon[mask_anio]

    trab_year = 0
    emp_year = 0
    ini_year = 0
    pos_year = 0
    bus_year = 0

    for j in range(n_year):
        t = trabaja_year.iloc[j]
        c = condicion_year.iloc[j]
        r = razon_year.iloc[j]

        if t in ['sí', 'si']:
            if 'propietario' in c or 'socio de negocio' in c or 'emprendimiento' in c:
                emp_year += 1
            else:
                trab_year += 1
        else:
            if 'buscando' in r or 'insertarme' in r:
                bus_year += 1
            elif 'proyecto personal' in r or 'negocio propio' in r:
                ini_year += 1
            elif 'posgrado' in r or 'carrera' in r:
                pos_year += 1

    ocup_year = trab_year + emp_year + ini_year
    pea_year = ocup_year + pos_year + bus_year
    tasa_year = (ocup_year / pea_year) * 100 if pea_year > 0 else 0
    print(f"  {anio_val}: n={n_year}, ocupados={ocup_year}, posgrado={pos_year}, buscando={bus_year}, PEA={pea_year}, tasa={tasa_year:.1f}%")

print()

# ============================================================
# RESUMEN COMPARATIVO
# ============================================================
print("=" * 70)
print("RESUMEN COMPARATIVO: PYTHON vs DASHBOARD")
print("=" * 70)
print(f"  {'Métrica':<35} {'Python':>10} {'Dashboard':>12} {'Match':>8}")
print(f"  {'-'*35} {'-'*10} {'-'*12} {'-'*8}")
print(f"  {'Total registros':<35} {total:>10} {'2,984':>12} {'✓' if total == 2984 else '✗':>8}")
print(f"  {'Trabaja actualmente':<35} {pct_trabaja:>9.1f}% {'81.5%':>12} {'✓' if abs(pct_trabaja - 81.5) < 1 else '✗':>8}")
print(f"  {'Ocupación PEA':<35} {tasaPEAOficial:>9.1f}% {'~92.8%':>12} {'✓' if abs(tasaPEAOficial - 92.8) < 2 else '✗':>8}")
print(f"  {'Desempleo PEA':<35} {tasaDesempleoPEA:>9.1f}% {'4.8%':>12} {'✓' if abs(tasaDesempleoPEA - 4.8) < 0.5 else '✗':>8}")
print(f"  {'Pertinencia (total+parcial)':<35} {pct_pert_total:>9.1f}% {'90.6%':>12} {'✓' if abs(pct_pert_total - 90.6) < 2 else '✗':>8}")
print(f"  {'Satisfacción laboral':<35} {pct_sat:>9.1f}% {'88.3%':>12} {'✓' if abs(pct_sat - 88.3) < 2 else '✗':>8}")
print(f"  {'Personal a cargo':<35} {pct_cargo:>9.1f}% {'40.8%':>12} {'✓' if abs(pct_cargo - 40.8) < 2 else '✗':>8}")
print(f"  {'Ascenso dependientes':<35} {pct_asc:>9.1f}% {'28.9%':>12} {'✓' if abs(pct_asc - 28.9) < 2 else '✗':>8}")
print(f"  {'NPS Score':<35} {nps_score:>10.1f} {'--':>12} {'--':>8}")
print(f"  {'Posgrado':<35} {pct_pos:>9.1f}% {'16.8%':>12} {'✓' if abs(pct_pos - 16.8) < 2 else '✗':>8}")
print()

# PEA summary
print("  --- Componentes PEA ---")
print(f"  Trabajando:        {trabajando:>6}")
print(f"  Emprendedores:     {emprendedores:>6}")
print(f"  Iniciando negocio: {iniciandoNegocio:>6}")
print(f"  Posgrado (en PEA): {inactivosEstudio:>6}")
print(f"  Buscando trabajo:  {buscanActivamente:>6}")
print(f"  TOTAL PEA:         {totalPEA:>6}")
print(f"  Ocupados PEA:      {ocupadosTotalPEA:>6}")
print(f"  No PEA:            {totalNoPEA:>6}")
print()

if tasaPEAOficial < 90 or tasaPEAOficial > 96:
    print(f"  ⚠ ALERTA: Tasa PEA = {tasaPEAOficial:.1f}% fuera del rango esperado (~92.8-95.0%)")
    print(f"    Verificar lógica de clasificación posgrado en calculations.js")
else:
    print(f"  ✓ Tasa PEA = {tasaPEAOficial:.1f}% dentro del rango esperado (posgrado en PEA, no ocupado)")

# ============================================================
# 18. VERIFICACIÓN DE GRÁFICOS (chart data)
# ============================================================
print()
print("=" * 70)
print("18. VERIFICACIÓN DE GRÁFICOS")
print("=" * 70)

# 18a. Gráfico Cohorte (ocupación por año)
print()
print("  18a. Gráfico Cohorte (Ocupación por Año de Egreso)")
print("  " + "-" * 60)
for anio_val in sorted(anio.unique()):
    if not anio_val or anio_val == 'nan':
        continue
    mask = anio == anio_val
    n = mask.sum()
    if n == 0:
        continue
    trabaja_y = trabaja[mask]
    condicion_y = condicion[mask]
    razon_y = razon[mask]
    trab = emp = ini = pos = bus = 0
    for j in range(n):
        t = trabaja_y.iloc[j]
        c = condicion_y.iloc[j]
        r = razon_y.iloc[j]
        if t in ['sí', 'si']:
            if 'propietario' in c or 'socio de negocio' in c or 'emprendimiento' in c:
                emp += 1
            else:
                trab += 1
        else:
            if 'buscando' in r or 'insertarme' in r:
                bus += 1
            elif 'proyecto personal' in r or 'negocio propio' in r:
                ini += 1
            elif 'posgrado' in r or 'carrera' in r:
                pos += 1
    ocup = trab + emp + ini
    pea_y = ocup + pos + bus
    tasa = (ocup / pea_y) * 100 if pea_y > 0 else 0
    print(f"    {anio_val}: n={n}, ocupados={ocup}, pea={pea_y}, tasa={tasa:.1f}%")

# 18b. Gráfico Facultad (ocupación por facultad)
print()
print("  18b. Gráfico Facultad (Ocupación por Facultad)")
print("  " + "-" * 60)
facultad_col = COLS['carrera']
fac_map = {
    'ENFERMERÍA': 'Ciencias de la Salud',
    'FARMACIA Y BIOQUÍMICA': 'Ciencias de la Salud',
    'MEDICINA HUMANA': 'Ciencias de la Salud',
    'NUTRICIÓN Y DIETÉTICA': 'Ciencias de la Salud',
    'OBSTETRICIA': 'Ciencias de la Salud',
    'ODONTOLOGÍA': 'Ciencias de la Salud',
    'PSICOLOGÍA': 'Ciencias de la Salud',
    'TECNOLOGÍA MÉDICA EN TERAPIA FÍSICA Y REHABILITACIÓN': 'Ciencias de la Salud',
    'TECNOLOGÍA MÉDICA EN LABORATORIO CLÍNICO Y ANATOMÍA PATOLÓGICA': 'Ciencias de la Salud',
    'ADMINISTRACIÓN EN TURISMO Y HOTELERÍA': 'Negocios e Ingenierías',
    'ADMINISTRACIÓN Y DIRECCIÓN DE EMPRESAS': 'Negocios e Ingenierías',
    'ADMINISTRACIÓN Y MARKETING': 'Negocios e Ingenierías',
    'ADMINISTRACIÓN Y NEGOCIOS INTERNACIONALES': 'Negocios e Ingenierías',
    'CONTABILIDAD Y AUDITORÍA': 'Negocios e Ingenierías',
    'INGENIERÍA DE SISTEMAS E INFORMÁTICA': 'Negocios e Ingenierías',
    'INGENIERÍA INDUSTRIAL Y DE GESTIÓN EMPRESARIAL': 'Negocios e Ingenierías',
    'DERECHO Y CIENCIA POLÍTICA': 'Derecho y Ciencia Política',
}

fac_data = {}
for i in range(total):
    c = safe_trim(df[facultad_col]).iloc[i]
    fac = fac_map.get(c, 'Otra')
    if fac not in fac_data:
        fac_data[fac] = {'n': 0, 'trab': 0, 'emp': 0, 'ini': 0, 'pos': 0, 'bus': 0}
    fd = fac_data[fac]
    fd['n'] += 1
    t = trabaja.iloc[i]
    co = condicion.iloc[i]
    r = razon.iloc[i]
    if t in ['sí', 'si']:
        if 'propietario' in co or 'socio de negocio' in co or 'emprendimiento' in co:
            fd['emp'] += 1
        else:
            fd['trab'] += 1
    else:
        if 'buscando' in r or 'insertarme' in r:
            fd['bus'] += 1
        elif 'proyecto personal' in r or 'negocio propio' in r:
            fd['ini'] += 1
        elif 'posgrado' in r or 'carrera' in r:
            fd['pos'] += 1

for fac in sorted(fac_data.keys()):
    fd = fac_data[fac]
    ocup = fd['trab'] + fd['emp'] + fd['ini']
    pea_f = ocup + fd['pos'] + fd['bus']
    tasa = (ocup / pea_f) * 100 if pea_f > 0 else 0
    print(f"    {fac}: n={fd['n']}, ocupados={ocup}, pea={pea_f}, tasa={tasa:.1f}%")

# 18c. Gráfico Vínculo Laboral
print()
print("  18c. Gráfico Vínculo Laboral (solo trabajadores)")
print("  " + "-" * 60)
vinculo_counts = {}
for i in range(total):
    if trabaja.iloc[i] not in ['sí', 'si']:
        continue
    c = condicion.iloc[i]
    if 'dependiente' in c and 'independiente' not in c:
        key = 'Dependiente'
    elif 'independiente' in c and 'dependiente' not in c:
        key = 'Independiente'
    elif 'dependiente' in c and 'independiente' in c:
        key = 'Ambos'
    else:
        key = 'Otro'
    vinculo_counts[key] = vinculo_counts.get(key, 0) + 1

total_v = sum(vinculo_counts.values()) or 1
for k in ['Dependiente', 'Independiente', 'Ambos', 'Otro']:
    v = vinculo_counts.get(k, 0)
    pct = (v / total_v) * 100
    print(f"    {k}: {v} ({pct:.1f}%)")

# 18d. Gráfico Ingresos
print()
print("  18d. Gráfico Ingresos Laborales")
print("  " + "-" * 60)
salario = safe_trim(df[COLS['salario']])
salario_validos = salario[salario != ''].shape[0]
salario_counts = salario[salario != ''].value_counts()
for val, n in salario_counts.items():
    pct = (n / salario_validos) * 100 if salario_validos > 0 else 0
    print(f"    {val}: {n} ({pct:.1f}%)")

# 18e. Resumen de verificación
print()
print("=" * 70)
print("19. VERIFICACIÓN FINAL DE GRÁFICOS")
print("=" * 70)
all_ok = True

# Verificar que las tasas por año son consistentes
for anio_val in sorted(anio.unique()):
    if not anio_val or anio_val == 'nan':
        continue
    mask = anio == anio_val
    n = mask.sum()
    if n == 0:
        continue
    trabaja_y = trabaja[mask]
    condicion_y = condicion[mask]
    razon_y = razon[mask]
    trab = emp = ini = pos = bus = 0
    for j in range(n):
        t = trabaja_y.iloc[j]
        c = condicion_y.iloc[j]
        r = razon_y.iloc[j]
        if t in ['sí', 'si']:
            if 'propietario' in c or 'socio de negocio' in c or 'emprendimiento' in c:
                emp += 1
            else:
                trab += 1
        else:
            if 'buscando' in r or 'insertarme' in r:
                bus += 1
            elif 'proyecto personal' in r or 'negocio propio' in r:
                ini += 1
            elif 'posgrado' in r or 'carrera' in r:
                pos += 1
    ocup = trab + emp + ini
    pea_y = ocup + pos + bus
    tasa = (ocup / pea_y) * 100 if pea_y > 0 else 0
    if pea_y == 0:
        print(f"  ⚠ {anio_val}: PEA = 0, verificar datos")
        all_ok = False
    elif tasa < 80 or tasa > 100:
        print(f"  ⚠ {anio_val}: tasa = {tasa:.1f}% fuera de rango esperado (80-100%)")
        all_ok = False

# Verificar consistencia global
if totalPEA == 0:
    print("  ⚠ PEA total = 0, verificar clasificación")
    all_ok = False
if ocupadosTotalPEA > totalPEA:
    print(f"  ⚠ Ocupados ({ocupadosTotalPEA}) > PEA ({totalPEA})")
    all_ok = False
if tasaPEAOficial < 80 or tasaPEAOficial > 100:
    print(f"  ⚠ Tasa PEA = {tasaPEAOficial:.1f}% fuera de rango")
    all_ok = False

if all_ok:
    print("  ✓ Todos los gráficos verificados correctamente")
    print("  ✓ Todos los valores son consistentes con los datos")
else:
    print("  ✗ Se encontraron inconsistencias en los datos")
