#!/usr/bin/env node
'use strict';

/**
 * Sestaví publikovanou verzi hry do složky public/.
 *
 * Použití:
 *   node build-public.cjs
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = __dirname;
const OUT = path.join(ROOT, 'public');

const PUBLISH_MODES = ['easy'];
const ONLY_PUBLIC_SECTORS = true;

const GAME_FILES = [
    'style.css',
    'game.js',
    'levelStore.js',
    'levels.js',
    'progressStore.js',
    'jumpPhysics.js',
    'spikeDraw.js',
    'sectorPreview.js',
    'pickupEffects.js',
    'playerReact.js',
    'crumblePlatform.js',
    'playerTouch.js',
    'audio.js',
    'packGuard.js',
    'userPack.js',
];

const EDITOR_FILES = [
    'editor.js',
    'editor.css',
    'sectorSim.js',
    'user-editor.html',
];

const LEGAL_FILES = ['LICENSE', 'PUBLIC_LEGAL.md'];

function loadLevelsPack() {
    const src = fs.readFileSync(path.join(ROOT, 'levels-pack.js'), 'utf8');
    const sandbox = { global: {}, window: {} };
    sandbox.global = sandbox.window;
    vm.runInNewContext(src, sandbox, { filename: 'levels-pack.js' });
    const pack = sandbox.global.HC_LEVELS_PACK || sandbox.window.HC_LEVELS_PACK;
    if (!pack || typeof pack !== 'object') {
        throw new Error('levels-pack.js neobsahuje HC_LEVELS_PACK — nejdřív ulož mapy z editoru.');
    }
    return pack;
}

function isSectorPublic(sector) {
    return sector?.public !== false;
}

function filterPack(pack) {
    const filtered = {};
    for (const mode of PUBLISH_MODES) {
        if (!pack[mode]) throw new Error(`Obtížnost „${mode}“ chybí v levels-pack.js`);
        const diff = JSON.parse(JSON.stringify(pack[mode]));
        if (ONLY_PUBLIC_SECTORS) {
            const before = diff.sectors.length;
            diff.sectors = diff.sectors.filter(isSectorPublic);
            const after = diff.sectors.length;
            if (after === 0) throw new Error(`Obtížnost „${mode}“ nemá žádné veřejné sektory`);
            if (after < before) console.log(`  ${mode}: ${after}/${before} veřejných sektorů`);
        }
        filtered[mode] = diff;
    }
    return filtered;
}

function buildLevelsPackJs(pack) {
    return `(function (global) {
    'use strict';
    /** Vygenerováno build-public.cjs */
    global.HC_LEVELS_PACK = ${JSON.stringify(pack, null, 4)};
})(typeof window !== 'undefined' ? window : globalThis);
`;
}

function buildPublishConfigJs() {
    const cfg = {
        production: true,
        modes: PUBLISH_MODES,
        onlyPublicSectors: ONLY_PUBLIC_SECTORS,
        singleMode: PUBLISH_MODES.length === 1,
        userEditor: true,
    };
    return `(function (global) {
    'use strict';
    global.HC_PUBLISH_CONFIG = ${JSON.stringify(cfg, null, 4)};
})(typeof window !== 'undefined' ? window : globalThis);
`;
}

function buildIndexHtml() {
    let html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const primary = PUBLISH_MODES[0];
    const label = primary.charAt(0).toUpperCase() + primary.slice(1);

    html = html.replace(
        /<meta charset="UTF-8">/,
        `<meta charset="UTF-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; media-src 'self' blob: data:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none';">`
    );
    html = html.replace(/<body data-difficulty="[^"]*">/, `<body data-difficulty="${primary}">`);
    html = html.replace(/<title>[^<]*<\/title>/, '<title>HardCore Mode — Easy</title>');
    html = html.replace(/<h1 class="menu-title">[^<]*<\/h1>/, `<h1 class="menu-title">${label.toUpperCase()} MODE</h1>`);
    html = html.replace(
        /<p class="menu-sub">[^<]*<\/p>/,
        '<p class="menu-sub">Tréninková zóna — pomalá láva, široké plošiny</p>'
    );

    html = html.replace(/\s*<div class="diff-grid"[\s\S]*?<\/div>\s*/, '\n');
    html = html.replace(/\s*<a href="editor\.html"[^>]*>[^<]*<\/a>\s*/, '\n');
    html = html.replace(
        /<p class="menu-hint">[^<]*<\/p>/,
        '<p class="menu-hint">Vyber sektor a začni hrát. Jeden dotek červeného = smrt. Láva stoupá. Křehké plošiny se rozpadnou po dopadu.</p>'
    );

    // V hlavním menu nech jen sector panel akce (menuPanel se v public verzi nepoužívá)
    html = html.replace(/\s*<div class="menu-actions">[\s\S]*?<\/div>\s*(?=<\/div>\s*<!-- Výběr sektorů)/, '\n');

    const legalFooter = '\n            <p class="legal-footer">Data zůstávají v prohlížeči. <a href="PUBLIC_LEGAL.md" target="_blank" rel="noopener">Právní informace</a></p>';
    html = html.replace(
        /(<button type="button" id="sectorCampaignBtn"[^>]*>[^<]*<\/button>)/,
        `${legalFooter}\n            $1`
    );

    html = html.replace(
        '<script src="jumpPhysics.js"></script>',
        '<script src="publish-config.js"></script>\n    <script src="jumpPhysics.js"></script>'
    );

    return html;
}

function buildUserEditorHtml() {
    let html = fs.readFileSync(path.join(ROOT, 'user-editor.html'), 'utf8');
    html = html.replace(
        /<meta charset="UTF-8">/,
        `<meta charset="UTF-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; media-src 'self' blob: data:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none';">`
    );
    return html;
}

function copyFile(name) {
    fs.copyFileSync(path.join(ROOT, name), path.join(OUT, name));
}

function main() {
    console.log('HardCore Mode — sestavení publikované verze');
    console.log(`  Zdroj:  ${ROOT}`);
    console.log(`  Cíl:    ${OUT}`);
    console.log(`  Módy:   ${PUBLISH_MODES.join(', ')}`);
    console.log('');

    const fullPack = loadLevelsPack();
    const publishPack = filterPack(fullPack);

    fs.mkdirSync(OUT, { recursive: true });

    fs.writeFileSync(path.join(OUT, 'publish-config.js'), buildPublishConfigJs(), 'utf8');
    fs.writeFileSync(path.join(OUT, 'levels-pack.js'), buildLevelsPackJs(publishPack), 'utf8');
    fs.writeFileSync(path.join(OUT, 'index.html'), buildIndexHtml(), 'utf8');
    fs.writeFileSync(path.join(OUT, 'user-editor.html'), buildUserEditorHtml(), 'utf8');

    for (const file of [...GAME_FILES, ...EDITOR_FILES, ...LEGAL_FILES]) {
        copyFile(file);
    }

    const sectorCount = publishPack[PUBLISH_MODES[0]].sectors.length;
    console.log(`Hotovo — ${PUBLISH_MODES[0]}: ${sectorCount} sektorů + tvůrce map`);
    console.log(`Soubory v: ${OUT}`);
}

main();
