import pandas as pd
import numpy as np
import re
import os

def clean_year(year_str):
    if pd.isna(year_str):
        return np.nan
    year_str = str(year_str)
    # Extraer el año usando regex (4 dígitos)
    match = re.search(r'\d{4}', year_str)
    if match:
        return int(match.group(0))
    return year_str

def load_and_merge():
    print("Cargando encuestas históricas (XLSX)...")
    df_old = pd.read_excel('data/respuestas_encuestas.xlsx')
    
    print("Cargando nuevas encuestas 2025 (CSV)...")
    df_new = pd.read_csv('data/respuestas_encuestas_2025.csv', encoding='latin1', sep=';')
    
    # 1. Limpiar años de egreso en el antiguo
    df_old['Año de egreso:'] = df_old['Año de egreso:'].apply(clean_year)
    
    # 2. Renombrar columnas del CSV para que coincidan con el Excel
    rename_map = {
        'DNI del egresado (copiar exactamente como específica la base) ': 'DNI:',
        'Nombre del egresado ( copiar exactamente como específica la base) ': 'Nombres y apellidos:',
        'Carrera': 'Programa Académico:',
        'Año de egreso': 'Año de egreso:',
        '2. ¿Cuál es tu condición laboral actual?': '2. ¿Cuál es tu condición laboral actual?',
        'Motivo No Trabajo (FINAL) ': '1. ¿Cuál es la principal razón por la que no te encuentras trabajando actualmente?',
        '5.   Considerando todos los aspectos de tu empleo  ¿Qué tan satisfecho te sientes con tu trabajo actual? ': '5. ¿Qué tan satisfecho te sientes con tu actividad laboral actual? (E: LEER TODA LA ESCALA)',
        'Sueldo (FINAL)': '9. ¿Cuál es tu ingreso mensual bruto aproximado? \n(Solicitamos esta información con el fin, de en caso te encuentres interesado en recibir información de ofertas laborales podamos enviar en base al sueldo base que percibes actualmente)',
        '9. ¿Cuánto tiempo (en meses) lograste obtener tu primer trabajo luego de haber egresado? ': '11. ¿Cuánto tiempo (en meses) lograste obtener tu primer trabajo luego de haber egresado?',
        '6. ¿Has recibido algún ascenso en los últimos 5 años?': '7. ¿Has recibido algún ascenso en los últimos 5 años? (No se pregunta a emprendedores/ni independientes)',
        '7. ¿Tienes personal a tu cargo? ': '8. ¿Tienes personal a tu cargo?',
        'A.  De manera general ¿Qué tan satisfecho te encuentras con la formación académica recibida por la Universidad Norbert Wiener? ¿Por qué? (menciona solo una característica, ejemplo: calidad académica, docentes, oportunidades laborales, prácticas/internados, etc.)': '13. En una escala de 0 a 10, ¿qué tan probable es que recomiende la Universidad Norbert Wiener...?',
        'Razones Sat (1era mención) (Categorizado)': '13.1 ¿Cuál es la principal razón de la calificación otorgada? (abierta):',
        'C. ¿Has llevado algún curso de posgrado (como maestría, diplomado, especialización) Ejemplo de respuesta: (Sí- U. San Martin - Maestría en salud) / No (separar en secciones)': '2. ¿Has realizado estudios de posgrado después de egresar?',
        'Nivel de Emp (Final)': '6. ¿La actividad laboral que desempeña actualmente está relacionada con la carrera que estudió?'
    }
    
    df_new_mapped = df_new.rename(columns=rename_map)
    
    # 3. Concatenar los DataFrames
    df_merged = pd.concat([df_old, df_new_mapped], ignore_index=True)
    
    # 4. Limpiar columnas como el DNI si es necesario
    # Convertir 'Año de egreso:' a entero donde sea posible para consistencia
    def safe_int(x):
        try:
            return int(float(x))
        except:
            return x
    df_merged['Año de egreso:'] = df_merged['Año de egreso:'].apply(safe_int)
    
    # 5. Guardar archivo unificado
    output_file = 'data/respuestas_encuestas_unificadas.xlsx'
    print(f"Guardando archivo unificado en {output_file}...")
    df_merged.to_excel(output_file, index=False)
    print("Fusión completada exitosamente.")

if __name__ == '__main__':
    load_and_merge()
