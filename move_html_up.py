with open('js/pages/empleabilidad.js', 'r') as f:
    lines = f.readlines()

# Extract the block
start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if "<!-- Empleabilidad por Sexo, Edad y Geografía -->" in line:
        start_idx = i
    if start_idx != -1 and i > start_idx and "<!-- SECCIÓN: NIVEL DE EMPLEABILIDAD x PERTINENCIA LABORAL, POR CARRERA -->" in line:
        end_idx = i
        break

if start_idx != -1 and end_idx != -1:
    block = lines[start_idx:end_idx]
    del lines[start_idx:end_idx]

    # Find insertion point
    insert_idx = -1
    for i, line in enumerate(lines):
        if "<!-- SECCIÓN: TRABAJOS PERTINENTES POR CARRERA -->" in line:
            insert_idx = i
            break
    
    if insert_idx != -1:
        lines = lines[:insert_idx] + block + lines[insert_idx:]
    
    with open('js/pages/empleabilidad.js', 'w') as f:
        f.writelines(lines)
    print("Moved block successfully.")
else:
    print("Could not find block.")
