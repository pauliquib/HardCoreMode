(function (global) {
    'use strict';

    const LIMITS = {
        maxJsonBytes: 10 * 1024 * 1024,
        maxMusicBytes: 8 * 1024 * 1024,
        maxSectors: 50,
        maxElementsPerSector: 500,
        maxNameLength: 80,
        maxProjectNameLength: 80,
        canvasW: 880,
        canvasH: 520,
    };

    const ALLOWED_MUSIC_MIME = new Set([
        'audio/mpeg',
        'audio/mp3',
        'audio/ogg',
        'audio/wav',
        'audio/x-wav',
        'audio/webm',
        'audio/mp4',
        'audio/aac',
    ]);

    const DANGEROUS_KEYS = new Set(['__proto__', 'prototype', 'constructor']);

    function assert(condition, message) {
        if (!condition) throw new Error(message);
    }

    function sanitizeText(value, maxLen) {
        if (typeof value !== 'string') return '';
        return value
            .replace(/[\u0000-\u001f\u007f]/g, '')
            .trim()
            .slice(0, maxLen);
    }

    function stripDangerous(value, depth = 0) {
        if (depth > 32) throw new Error('JSON je příliš hluboký');
        if (value == null || typeof value !== 'object') return value;
        if (Array.isArray(value)) {
            return value.map((item) => stripDangerous(item, depth + 1));
        }
        const out = {};
        for (const key of Object.keys(value)) {
            if (DANGEROUS_KEYS.has(key)) continue;
            out[key] = stripDangerous(value[key], depth + 1);
        }
        return out;
    }

    function parseJsonSafe(text, maxBytes) {
        assert(typeof text === 'string', 'Neplatná data');
        const bytes = new TextEncoder().encode(text).length;
        assert(bytes <= maxBytes, `Soubor je příliš velký (max ${Math.round(maxBytes / 1024 / 1024)} MB)`);
        let data;
        try {
            data = JSON.parse(text);
        } catch {
            throw new Error('Neplatný JSON');
        }
        return stripDangerous(data);
    }

    function isFiniteNumber(n, min, max) {
        return typeof n === 'number' && Number.isFinite(n) && n >= min && n <= max;
    }

    function validateRect(rect, label) {
        assert(rect && typeof rect === 'object', `${label}: chybí objekt`);
        assert(isFiniteNumber(rect.x, -200, LIMITS.canvasW + 200), `${label}: neplatná pozice X`);
        assert(isFiniteNumber(rect.y, -200, LIMITS.canvasH + 200), `${label}: neplatná pozice Y`);
        assert(isFiniteNumber(rect.w, 1, LIMITS.canvasW + 400), `${label}: neplatná šířka`);
        assert(isFiniteNumber(rect.h, 1, LIMITS.canvasH + 400), `${label}: neplatná výška`);
    }

    function validateElementList(list, label, max) {
        assert(Array.isArray(list), `${label}: očekáváno pole`);
        assert(list.length <= max, `${label}: příliš mnoho prvků (max ${max})`);
        for (let i = 0; i < list.length; i++) {
            validateRect(list[i], `${label}[${i}]`);
        }
    }

    function validateMusic(music) {
        if (music == null) return null;
        assert(typeof music === 'object', 'Hudba: neplatný formát');
        const mime = typeof music.mime === 'string' ? music.mime.toLowerCase() : '';
        assert(ALLOWED_MUSIC_MIME.has(mime), 'Hudba: nepodporovaný formát (použij MP3, OGG nebo WAV)');
        assert(typeof music.dataBase64 === 'string' && music.dataBase64.length > 0, 'Hudba: chybí data');
        const approxBytes = Math.ceil(music.dataBase64.length * 0.75);
        assert(approxBytes <= LIMITS.maxMusicBytes, `Hudba je příliš velká (max ${Math.round(LIMITS.maxMusicBytes / 1024 / 1024)} MB)`);
        return {
            mime,
            name: sanitizeText(music.name || 'hudba', 120),
            dataBase64: music.dataBase64,
            volume: isFiniteNumber(music.volume, 0.05, 1) ? music.volume : 0.45,
        };
    }

    function validateTheme(theme) {
        assert(theme && typeof theme === 'object', 'Chybí téma barev');
        assert(typeof theme.bg === 'string', 'Téma: chybí barva pozadí');
        return theme;
    }

    function validateSector(sector, index) {
        assert(sector && typeof sector === 'object', `Sektor ${index + 1}: neplatná data`);
        const name = sanitizeText(sector.name || `Level ${index + 1}`, LIMITS.maxNameLength);
        assert(name.length > 0, `Sektor ${index + 1}: chybí název`);
        assert(isFiniteNumber(sector.lavaSpeed, 1, 100), `Sektor ${index + 1}: neplatná rychlost lávy`);
        assert(isFiniteNumber(sector.lavaStartOffset, 20, 200), `Sektor ${index + 1}: neplatný offset lávy`);
        validateRect(sector.spawn, `Sektor ${index + 1} spawn`);
        validateRect(sector.goal, `Sektor ${index + 1} goal`);
        validateElementList(sector.solids || [], `Sektor ${index + 1} solids`, LIMITS.maxElementsPerSector);
        validateElementList(sector.crumble || [], `Sektor ${index + 1} crumble`, LIMITS.maxElementsPerSector);
        validateElementList(sector.spikes || [], `Sektor ${index + 1} spikes`, LIMITS.maxElementsPerSector);
        validateElementList(sector.movers || [], `Sektor ${index + 1} movers`, LIMITS.maxElementsPerSector);
        validateElementList(sector.pulses || [], `Sektor ${index + 1} pulses`, LIMITS.maxElementsPerSector);
        validateElementList(sector.pickups || [], `Sektor ${index + 1} pickups`, LIMITS.maxElementsPerSector);
        return {
            ...sector,
            name,
            public: true,
        };
    }

    function validateUserPack(data) {
        assert(data && typeof data === 'object', 'Neplatná sada levelů');
        assert(data.type === 'hc-user-pack', 'Neznámý typ souboru — očekáván soubor z tvůrce map HardCore Mode');
        assert(data.formatVersion === 1, 'Nepodporovaná verze formátu');

        const projectName = sanitizeText(data.projectName || data.label || 'Vlastní sada', LIMITS.maxProjectNameLength);
        assert(projectName.length > 0, 'Chybí název projektu');
        assert(Array.isArray(data.sectors), 'Chybí pole levelů');
        assert(data.sectors.length > 0, 'Sada musí obsahovat alespoň jeden level');
        assert(data.sectors.length <= LIMITS.maxSectors, `Příliš mnoho levelů (max ${LIMITS.maxSectors})`);

        const sectors = data.sectors.map(validateSector);
        const theme = validateTheme(data.theme);
        const music = validateMusic(data.music);

        return {
            formatVersion: 1,
            type: 'hc-user-pack',
            projectName,
            label: projectName,
            tagline: sanitizeText(data.tagline || 'Vlastní sada levelů', 160),
            theme,
            music,
            sectors,
        };
    }

    function validateMusicFile(file) {
        assert(file && typeof file.size === 'number', 'Neplatný soubor');
        assert(file.size > 0, 'Soubor je prázdný');
        assert(file.size <= LIMITS.maxMusicBytes, `Audio je příliš velké (max ${Math.round(LIMITS.maxMusicBytes / 1024 / 1024)} MB)`);
        const mime = (file.type || '').toLowerCase();
        assert(!mime || ALLOWED_MUSIC_MIME.has(mime), 'Nepodporovaný formát audia (MP3, OGG, WAV)');
        return file;
    }

    function readFileAsText(file, maxBytes) {
        return new Promise((resolve, reject) => {
            assert(file.size <= maxBytes, `Soubor je příliš velký (max ${Math.round(maxBytes / 1024 / 1024)} MB)`);
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || ''));
            reader.onerror = () => reject(new Error('Soubor se nepodařilo načíst'));
            reader.readAsText(file);
        });
    }

    function readFileAsDataUrl(file) {
        return new Promise((resolve, reject) => {
            validateMusicFile(file);
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || ''));
            reader.onerror = () => reject(new Error('Audio se nepodařilo načíst'));
            reader.readAsDataURL(file);
        });
    }

    async function fileToMusic(file) {
        validateMusicFile(file);
        const dataUrl = await readFileAsDataUrl(file);
        const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
        assert(match, 'Audio se nepodařilo zpracovat');
        return {
            mime: match[1].toLowerCase(),
            name: sanitizeText(file.name || 'hudba', 120),
            dataBase64: match[2],
            volume: 0.45,
        };
    }

    async function loadUserPackFile(file) {
        const text = await readFileAsText(file, LIMITS.maxJsonBytes);
        const data = parseJsonSafe(text, LIMITS.maxJsonBytes);
        return validateUserPack(data);
    }

    global.HCPackGuard = {
        LIMITS,
        ALLOWED_MUSIC_MIME,
        sanitizeText,
        parseJsonSafe,
        validateUserPack,
        validateMusic,
        validateMusicFile,
        fileToMusic,
        loadUserPackFile,
    };
})(typeof window !== 'undefined' ? window : globalThis);
