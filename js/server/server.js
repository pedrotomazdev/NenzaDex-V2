/*
 * Projeto: NenzaDex V2
 * Autor: Pedro Tomaz Rezende Fagundes
 * GitHub: https://github.com/pedrotomazdev
 *
 * ⚠️ Uso permitido APENAS com atribuição.
 * Proibido remover créditos ou redistribuir como se fosse autor original.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
// Ajusta aqui pra apontar pra pasta certa
const publicDir = path.join(__dirname, '../../');

function getContentType(ext) {
    const mimeTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
    };
    return mimeTypes[ext.toLowerCase()] || 'application/octet-stream';
}
const url = require('url');
http.createServer((req, res) => {
    // Pega só o pathname (ex: "/pokemon"), sem query string
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;

    if (pathname === '/') {
        pathname = '/index.html';
    } else if (!path.extname(pathname)) {
        pathname += '.html';
    }

    const filePath = path.join(publicDir, pathname);
    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404, {
                'Content-Type': 'text/plain'
            });
            res.end('Arquivo não encontrado');
            return;
        }

        res.writeHead(200, {
            'Content-Type': getContentType(path.extname(filePath))
        });
        res.end(content);
    });
}).listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});