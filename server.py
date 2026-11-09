#!/usr/bin/env python3
"""
Servidor HTTP personalizado con tipos MIME correctos para archivos .xlsx
"""
import http.server
import socketserver
import os
import sys

PORT = 8080

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # CORS headers para permitir fetch desde el navegador
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def guess_type(self, path):
        result = super().guess_type(path)
        # Sobrescribir tipos MIME para archivos Excel y JSON
        if path.endswith('.xlsx'):
            return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', None
        if path.endswith('.xls'):
            return 'application/vnd.ms-excel', None
        if path.endswith('.json'):
            return 'application/json', None
        return result

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Content-Length', '0')
        self.end_headers()

    def do_GET(self):
        if self.path.startswith('/api/status'):
            resp_body = b'{"status": "running", "server": "server.py", "port": 8080}'
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(resp_body)))
            self.end_headers()
            self.wfile.write(resp_body)
            return
        super().do_GET()

    def do_POST(self):
        if self.path.startswith('/api/save-texts'):
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                post_data = self.rfile.read(content_length)
                
                # Validar y formatear JSON
                import json
                parsed = json.loads(post_data.decode('utf-8'))
                
                data_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
                os.makedirs(data_dir, exist_ok=True)
                file_path = os.path.join(data_dir, 'custom_texts.json')
                
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(parsed, f, indent=2, ensure_ascii=False)
                
                resp_body = b'{"status": "ok", "message": "Textos guardados correctamente para todos los usuarios."}'
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Content-Length', str(len(resp_body)))
                self.end_headers()
                self.wfile.write(resp_body)
            except Exception as e:
                resp_body = f'{{"status": "error", "message": "{str(e)}"}}'.encode('utf-8')
                self.send_response(500)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Content-Length', str(len(resp_body)))
                self.end_headers()
                self.wfile.write(resp_body)
            return

        if self.path.startswith('/api/reset-texts'):
            try:
                data_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
                file_path = os.path.join(data_dir, 'custom_texts.json')
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write('{\n  "version": "1.0",\n  "updatedAt": null,\n  "pages": {}\n}\n')
                
                resp_body = b'{"status": "ok", "message": "Textos restablecidos a valores originales."}'
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Content-Length', str(len(resp_body)))
                self.end_headers()
                self.wfile.write(resp_body)
            except Exception as e:
                resp_body = f'{{"status": "error", "message": "{str(e)}"}}'.encode('utf-8')
                self.send_response(500)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Content-Length', str(len(resp_body)))
                self.end_headers()
                self.wfile.write(resp_body)
            return

        self.send_response(404)
        self.send_header('Content-Length', '0')
        self.end_headers()

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Matar proceso anterior en el puerto si existe
    import subprocess
    try:
        subprocess.run(['fuser', '-k', f'{PORT}/tcp'], capture_output=True)
    except:
        pass
    
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.ThreadingTCPServer(("", PORT), CustomHandler) as httpd:
        print("=" * 40)
        print("  Dashboard de Egresados 2026")
        print("=" * 40)
        print(f"\nIniciando servidor en http://localhost:{PORT}")
        print("Tipos MIME configurados para .xlsx")
        print("CORS habilitado")
        print("\nPresiona Ctrl+C para detener")
        print("=" * 40)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServidor detenido.")
            sys.exit(0)