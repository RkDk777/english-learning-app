#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""英语学习助手 - HTTP 服务器"""
import http.server
import os
import sys
import io

# Force UTF-8 on Windows
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

DIR = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIR, **kwargs)

    def end_headers(self):
        p = self.path.lower()
        if p.endswith('.js'):
            self.send_header('Content-Type', 'application/javascript; charset=utf-8')
        elif p.endswith('.json'):
            self.send_header('Content-Type', 'application/json; charset=utf-8')
        elif p.endswith('.css'):
            self.send_header('Content-Type', 'text/css; charset=utf-8')
        super().end_headers()

    def log_message(self, fmt, *args):
        if len(args) > 1 and args[1][0] in ('4', '5'):
            super().log_message(fmt, *args)

if __name__ == '__main__':
    os.chdir(DIR)
    port = 5500
    for p in [5500, 8080, 3000, 5000, 9090]:
        try:
            httpd = http.server.HTTPServer(("0.0.0.0", p), Handler)
            port = p
            break
        except OSError:
            continue

    print("=" * 50)
    print("  English Learning App Server")
    print("=" * 50)
    print()
    print(f"  http://localhost:{port}")
    print()
    print("  Open the URL above in your browser.")
    print("  Press Ctrl+C to stop.")
    print()

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n  Server stopped.")
