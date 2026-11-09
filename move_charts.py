import sys

# Read resumen.js
with open('js/pages/resumen.js', 'r') as f:
    resumen_lines = f.readlines()

# Extract segments
# inferirSexoDesdeNombre: 47 to 61
# HTML: 565 to 600
# init calls: 880 to 882
# JS functions: 2065 to 2301
# mappings: 2551 to 2553

def extract(start, end):
    # start and end are 1-based
    return "".join(resumen_lines[start-1:end])

# I need to double check the line numbers since removing lines shifts them if done naively.
# Better to do it by creating a new file from scratch.
# We will use exact string matching to find start/end indices in python to be perfectly robust.

def extract_block(lines, start_marker, end_marker):
    start_idx = -1
    end_idx = -1
    for i, line in enumerate(lines):
        if start_idx == -1 and start_marker in line:
            start_idx = i
        if start_idx != -1 and end_idx == -1 and end_marker in line:
            end_idx = i
            break
    if start_idx != -1 and end_idx != -1:
        block = lines[start_idx:end_idx+1]
        del lines[start_idx:end_idx+1]
        return block
    return []

# We'll just carefully do it via indices because some markers are not unique
# or it's just safer to use the exact line numbers we found (they won't change until we write the file)

# We will delete from bottom to top so indices don't shift!
# Original mappings 2551-2553
del resumen_lines[2550:2553] # 0-indexed: 2550 to 2552 (slice 2550:2553)
resumen_lines[2549] = resumen_lines[2549].replace(',', '') # remove trailing comma

js_functions_block = resumen_lines[2064:2301]
del resumen_lines[2064:2301]

init_calls_block = resumen_lines[879:882]
del resumen_lines[879:882]

html_block = resumen_lines[564:600]
del resumen_lines[564:600]

inferir_block = resumen_lines[46:62] # 47 to 62
del resumen_lines[46:62]

with open('js/pages/resumen.js', 'w') as f:
    f.writelines(resumen_lines)


# Now read empleabilidad.js
with open('js/pages/empleabilidad.js', 'r') as f:
    emp_lines = f.readlines()

# Insert HTML block around line 185, before "<!-- SECCIÓN: NIVEL DE EMPLEABILIDAD x PERTINENCIA LABORAL, POR CARRERA -->"
html_insert_idx = -1
for i, line in enumerate(emp_lines):
    if "<!-- SECCIÓN: NIVEL DE EMPLEABILIDAD x PERTINENCIA LABORAL, POR CARRERA -->" in line:
        html_insert_idx = i
        break

if html_insert_idx != -1:
    emp_lines = emp_lines[:html_insert_idx] + html_block + ["\n"] + emp_lines[html_insert_idx:]

# Insert init calls in Charts.waitForReady().then(() => {
init_insert_idx = -1
for i, line in enumerate(emp_lines):
    if "const rankingPertinencia = ranking" in line:
        init_insert_idx = i
        break

if init_insert_idx != -1:
    # Need to change IDs if we change them, but if we don't, we can just insert the calls
    emp_lines = emp_lines[:init_insert_idx] + init_calls_block + ["\n"] + emp_lines[init_insert_idx:]

# Insert JS functions and inferirSexo at the bottom
emp_lines = emp_lines + ["\n"] + inferir_block + ["\n"] + js_functions_block

# We also need to add NOMBRE_GENERO into empleabilidad.js or import it. It's only defined in resumen.js!
# We can just copy it from resumen.js.
with open('js/pages/resumen.js', 'r') as f:
    res = f.readlines()

nombre_genero_block = []
start = -1
for i, l in enumerate(res):
    if "const NOMBRE_GENERO = {" in l:
        start = i
    if start != -1 and "};" in l:
        nombre_genero_block = res[start:i+1]
        break

emp_lines = emp_lines + ["\n"] + nombre_genero_block

with open('js/pages/empleabilidad.js', 'w') as f:
    f.writelines(emp_lines)

print("Done python script")
