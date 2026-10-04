#!/usr/bin/env node
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 8765;

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.cjs': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2',
};

function buildLevelsPackJs(pack) {
    return `(function (global) {
    'use strict';
    /** Vygenerováno editorem — Uložit do projektu */
    global.HC_LEVELS_PACK = ${JSON.stringify(pack, null, 4)};
})(typeof window !== 'undefined' ? window : globalThis);
`;
}

function sendJson(res, status, obj) {
    const body = JSON.stringify(obj);
    res.writeHead(status, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end(body);
}

function readBody(req) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        req.on('data', (c) => chunks.push(c));
        req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
        req.on('error', reject);
    });
}

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

    if (req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        });
        res.end();
        return;
    }

    if (req.method === 'POST' && url.pathname === '/api/save-levels') {
        try {
            const raw = await readBody(req);
            const pack = JSON.parse(raw);
            if (!pack || typeof pack !== 'object') throw new Error('Očekáván objekt balíku úrovní');
            const outPath = path.join(ROOT, 'levels-pack.js');
            fs.writeFileSync(outPath, buildLevelsPackJs(pack), 'utf8');
            sendJson(res, 200, { ok: true, path: 'levels-pack.js' });
        } catch (err) {
            sendJson(res, 400, { ok: false, error: err.message || String(err) });
        }
        return;
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
        sendJson(res, 405, { ok: false, error: 'Method not allowed' });
        return;
    }

    let rel = decodeURIComponent(url.pathname);
    if (rel === '/') rel = '/index.html';
    const filePath = path.normalize(path.join(ROOT, rel));
    if (!filePath.startsWith(ROOT)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('Not found');
            return;
        }
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        if (req.method === 'HEAD') res.end();
        else res.end(data);
    });
});

server.listen(PORT, () => {
    console.log(`HardCore Mode — lokální vývoj`);
    console.log(`  Hra:    http://localhost:${PORT}/index.html`);
    console.log(`  Editor: http://localhost:${PORT}/editor.html`);
    console.log(`  Uložení map: POST /api/save-levels → levels-pack.js`);
});
