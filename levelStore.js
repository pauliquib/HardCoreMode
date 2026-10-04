(function (global) {
    'use strict';

    const W = 880;
    const H = 520;
    const STORAGE_KEY = 'hc_level_editor_v1';

    const THEMES = {
        easy: {
            id: 'easy',
            label: 'Easy',
            tagline: 'Tréninková zóna — pomalá láva, široké plošiny',
            theme: {
                bg: '#0a1218',
                lavaTop: 'rgba(80,200,220,0.92)',
                lavaMid: 'rgba(30,120,160,0.88)',
                lavaBot: '#061018',
                lavaLine: 'rgba(160,240,255,0.55)',
                solid: '#1e3a48',
                solidStroke: '#3a6a7a',
                crumbleCool: '#6ab8c8',
                crumbleWarm: '#3a9aaa',
                crumbleHot: '#2a8898',
                spike: '#4a8898',
                mover: '#5ec8e8',
                moverGlow: '#40a0c0',
                reactor: '#7ae8a0',
                reactorGlow: '#40c878',
                pulseOn: 'rgba(80,220,255,0.7)',
                pulseOff: 'rgba(60,180,200,0.12)',
                pulseStrokeOn: 'rgba(140,240,255,0.85)',
                pulseStrokeOff: 'rgba(80,160,180,0.3)',
                goalFill: 'rgba(80,220,200,0.28)',
                goalStroke: '#5ec8b0',
                ...buildPickupTheme(),
                player: '#e8f8ff',
                playerStroke: '#1a2830',
                overlayAccent: '#5ec8e8',
                hudDanger: '#ff6b6b',
            },
        },
        medium: {
            id: 'medium',
            label: 'Medium',
            tagline: 'Ohnivá jáma — klasická obtížnost',
            theme: {
                bg: '#08080d',
                lavaTop: 'rgba(255,60,30,0.95)',
                lavaMid: 'rgba(180,20,10,0.9)',
                lavaBot: '#1a0505',
                lavaLine: 'rgba(255,200,80,0.5)',
                solid: '#2a2a38',
                solidStroke: '#4a4a5c',
                crumbleCool: '#b4642d',
                crumbleWarm: '#d05020',
                crumbleHot: '#ff3d1f',
                spike: '#c41e1e',
                mover: '#ff2244',
                moverGlow: '#ff0000',
                reactor: '#ff8844',
                reactorGlow: '#ffaa22',
                pulseOn: 'rgba(255,0,60,0.75)',
                pulseOff: 'rgba(60,255,120,0.15)',
                pulseStrokeOn: 'rgba(255,100,120,0.9)',
                pulseStrokeOff: 'rgba(100,200,140,0.35)',
                goalFill: 'rgba(80,220,160,0.25)',
                goalStroke: '#3ecf8e',
                ...buildPickupTheme(),
                player: '#f4f2ef',
                playerStroke: '#1a1a22',
                overlayAccent: '#ff2d2d',
                hudDanger: '#ff2d2d',
            },
        },
        hard: {
            id: 'hard',
            label: 'Hard',
            tagline: 'Temnota — rychlejší láva, pulzní pasti',
            theme: {
                bg: '#0a0812',
                lavaTop: 'rgba(180,40,255,0.92)',
                lavaMid: 'rgba(100,10,160,0.88)',
                lavaBot: '#120818',
                lavaLine: 'rgba(220,140,255,0.5)',
                solid: '#2a2038',
                solidStroke: '#4a3860',
                crumbleCool: '#6a4088',
                crumbleWarm: '#8830a8',
                crumbleHot: '#b020d0',
                spike: '#9018a0',
                mover: '#d040ff',
                moverGlow: '#a020e0',
                reactor: '#60e8ff',
                reactorGlow: '#30b8e0',
                pulseOn: 'rgba(200,60,255,0.78)',
                pulseOff: 'rgba(80,40,120,0.15)',
                pulseStrokeOn: 'rgba(240,140,255,0.9)',
                pulseStrokeOff: 'rgba(120,80,160,0.35)',
                goalFill: 'rgba(160,100,255,0.22)',
                goalStroke: '#a060e8',
                ...buildPickupTheme(),
                player: '#f0e8ff',
                playerStroke: '#1a1028',
                overlayAccent: '#b040ff',
                hudDanger: '#ff4080',
            },
        },
        hardcore: {
            id: 'hardcore',
            label: 'Hardcore',
            tagline: 'Inferno — kombinované pasti',
            theme: {
                bg: '#0c0606',
                lavaTop: 'rgba(255,20,0,0.97)',
                lavaMid: 'rgba(140,0,0,0.94)',
                lavaBot: '#180202',
                lavaLine: 'rgba(255,120,40,0.65)',
                solid: '#301818',
                solidStroke: '#502828',
                crumbleCool: '#883020',
                crumbleWarm: '#b82010',
                crumbleHot: '#ff1800',
                spike: '#e01010',
                mover: '#ff3010',
                moverGlow: '#ff0000',
                reactor: '#ffaa00',
                reactorGlow: '#ff6600',
                pulseOn: 'rgba(255,40,0,0.85)',
                pulseOff: 'rgba(80,20,10,0.18)',
                pulseStrokeOn: 'rgba(255,100,40,0.95)',
                pulseStrokeOff: 'rgba(120,40,20,0.4)',
                goalFill: 'rgba(255,120,40,0.2)',
                goalStroke: '#ff6020',
                ...buildPickupTheme(),
                player: '#fff0e8',
                playerStroke: '#220808',
                overlayAccent: '#ff2000',
                hudDanger: '#ff1800',
            },
        },
        bornForHell: {
            id: 'bornForHell',
            label: 'Born for Hell',
            tagline: 'Abaddon — maximální chaos',
            theme: {
                bg: '#040404',
                lavaTop: 'rgba(255,255,255,0.95)',
                lavaMid: 'rgba(200,0,0,0.95)',
                lavaBot: '#0a0000',
                lavaLine: 'rgba(255,255,255,0.7)',
                solid: '#181818',
                solidStroke: '#303030',
                crumbleCool: '#404040',
                crumbleWarm: '#802020',
                crumbleHot: '#ff0000',
                spike: '#ffffff',
                mover: '#ff0000',
                moverGlow: '#ffffff',
                reactor: '#ffcc00',
                reactorGlow: '#ffffff',
                pulseOn: 'rgba(255,255,255,0.9)',
                pulseOff: 'rgba(60,0,0,0.2)',
                pulseStrokeOn: 'rgba(255,0,0,0.95)',
                pulseStrokeOff: 'rgba(80,0,0,0.45)',
                goalFill: 'rgba(255,0,0,0.25)',
                goalStroke: '#ff0000',
                ...buildPickupTheme({
                    speed: { fill: '#ffff44', glow: '#ffffaa' },
                    shield: { fill: '#aaccff', glow: '#ffffff' },
                }),
                player: '#ffffff',
                playerStroke: '#000000',
                overlayAccent: '#ffffff',
                hudDanger: '#ff0000',
            },
        },
    };

    const SECTOR_NAMES = {
        easy: ['První krok', 'Bez spěchu', 'Široké mosty', 'Klidná stezka', 'První výšiny', 'Slunce nad roklinou', 'Východ z pekla'],
        medium: ['Křehký rozjezd', 'Kyvadla', 'Pulzní mříž', 'Vertikální řez', 'Ohnivý žlab', 'Jádro', 'Poslední brána'],
        hard: ['Stínový průchod', 'Dvojité kyvadlo', 'Fialová síť', 'Propast bez milosti', 'Synchronní pulz', 'Úzké jádro', 'Temnota končí'],
        hardcore: ['Spalující start', 'Krvavé kyvadlo', 'Žhavá mříž', 'Vnitřní oheň', 'Pekelný žlab', 'Synchronní peklo', 'Brána inferna'],
        bornForHell: ['Nulová tolerance', 'Bílý oheň', 'Absolutní propast', 'Krvavý labyrint', 'Synchronní smrt', 'Poslední dech', 'Abaddon'],
    };

    const LAVA_BY_DIFF = { easy: 16, medium: 28, hard: 34, hardcore: 42, bornForHell: 52 };

    function buildPickupTheme(overrides = {}) {
        const out = {};
        const defs = {
            speed: { fill: '#ffe066', glow: '#ffd700' },
            jump: { fill: '#66e0ff', glow: '#00b8e8' },
            shield: { fill: '#88bbff', glow: '#4488ff' },
            low_gravity: { fill: '#c088ff', glow: '#9040e0' },
            lava_slow: { fill: '#ff9955', glow: '#ff5500' },
            pulse_off: { fill: '#66ff99', glow: '#22cc55' },
            mirror_move: { fill: '#ff66cc', glow: '#ff0088' },
            flip_scene: { fill: '#cccccc', glow: '#ffffff' },
            player_size: { fill: '#ffb366', glow: '#ff8833' },
        };
        for (const [id, base] of Object.entries(defs)) {
            const c = overrides[id] || base;
            out[`pickup_${id}`] = c.fill;
            out[`pickup_${id}Glow`] = c.glow;
        }
        return out;
    }

    function deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    /** Základní šablona sektoru — první easy má ručně ověřené kroky */
    function createSectorTemplate(diffKey, index) {
        const names = SECTOR_NAMES[diffKey] || SECTOR_NAMES.medium;
        const lava = LAVA_BY_DIFF[diffKey] || 28;
        const leftW = diffKey === 'easy' ? 180 : 160;
        const rightW = 100;

        if (diffKey === 'easy' && index === 0) {
            return {
                name: names[0],
                lavaSpeed: 14,
                lavaStartOffset: 130,
                spawn: { x: 48, y: H - 55 },
                goal: { x: W - 88, y: 68, w: 44, h: 40 },
                solids: [
                    { x: 0, y: H - 40, w: leftW, h: 40 },
                    { x: W - rightW, y: H - 40, w: rightW, h: 40 },
                ],
                crumble: [
                    { x: 190, y: 438, w: 76, h: 11 },
                    { x: 320, y: 362, w: 72, h: 11 },
                    { x: 500, y: 286, w: 68, h: 11 },
                    { x: 660, y: 210, w: 64, h: 11 },
                ],
                spikes: [{ x: leftW, y: H - 18, w: W - leftW - rightW, h: 12 }],
                movers: [],
                pulses: [],
                pickups: [],
            };
        }

        if (diffKey === 'medium' && index === 0) {
            return {
                name: names[0],
                lavaSpeed: 24,
                lavaStartOffset: 105,
                spawn: { x: 52, y: H - 55 },
                goal: { x: W - 88, y: 68, w: 44, h: 40 },
                solids: [
                    { x: 0, y: H - 40, w: 160, h: 40 },
                    { x: W - 100, y: H - 40, w: 100, h: 40 },
                ],
                crumble: [
                    { x: 155, y: H - 82, w: 56, h: 11 },
                    { x: 248, y: H - 124, w: 52, h: 11 },
                    { x: 358, y: H - 166, w: 50, h: 11 },
                    { x: 468, y: H - 208, w: 48, h: 11 },
                    { x: 578, y: H - 250, w: 46, h: 11 },
                    { x: 678, y: H - 292, w: 44, h: 11 },
                ],
                spikes: [{ x: 160, y: H - 18, w: W - 260, h: 12 }],
                movers: [],
                pulses: [],
                pickups: [],
            };
        }

        const yOff = 82 + index * 38;
        return {
            name: names[index] || `Sektor ${index + 1}`,
            lavaSpeed: lava + index * 2,
            lavaStartOffset: 120 - index * 8,
            spawn: { x: 48, y: H - 55 },
            goal: { x: W - 88, y: 68, w: 44, h: 40 },
            solids: [
                { x: 0, y: H - 40, w: leftW, h: 40 },
                { x: W - rightW, y: H - 40, w: rightW, h: 40 },
            ],
            crumble: [
                { x: leftW + 12, y: H - yOff, w: 56, h: 11 },
                { x: leftW + 90, y: H - yOff - 42, w: 52, h: 11 },
                { x: leftW + 168, y: H - yOff - 84, w: 48, h: 11 },
            ],
            spikes: [{ x: leftW, y: H - 18, w: W - leftW - rightW, h: 12 }],
            movers: [],
            pulses: [],
            pickups: [],
        };
    }

    function createDefaultPack() {
        const pack = {};
        for (const key of Object.keys(THEMES)) {
            pack[key] = {
                ...deepClone(THEMES[key]),
                sectors: SECTOR_NAMES[key].map((_, i) => createSectorTemplate(key, i)),
            };
        }
        return pack;
    }

    function loadRaw() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch {
            return null;
        }
    }

    function saveRaw(pack) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(pack));
    }

    function getProjectPack() {
        if (global.HC_LEVELS_PACK && typeof global.HC_LEVELS_PACK === 'object') {
            return deepClone(global.HC_LEVELS_PACK);
        }
        return null;
    }

    function getDifficulties() {
        const cfg = global.HC_PUBLISH_CONFIG;
        if (!cfg?.production) {
            const stored = loadRaw();
            if (stored) return stored;
        }
        const project = getProjectPack();
        if (project) return project;
        return createDefaultPack();
    }

    function filterPackForPublish(pack) {
        const cfg = global.HC_PUBLISH_CONFIG;
        if (!cfg?.modes) return pack;
        const filtered = {};
        for (const key of cfg.modes) {
            if (!pack[key]) continue;
            const diff = deepClone(pack[key]);
            if (cfg.onlyPublicSectors) {
                diff.sectors = diff.sectors.filter((s) => isSectorPublic(s));
            }
            filtered[key] = diff;
        }
        return filtered;
    }

    function buildLevelsPackJs(pack) {
        return `(function (global) {
    'use strict';
    /** Vygenerováno editorem — Uložit do projektu */
    global.HC_LEVELS_PACK = ${JSON.stringify(pack, null, 4)};
})(typeof window !== 'undefined' ? window : globalThis);
`;
    }

    function getThemeDefaults(diffKey) {
        const theme = deepClone(THEMES[diffKey]?.theme || THEMES.medium.theme);
        if (global.HCPickupEffects) HCPickupEffects.applyThemeDefaults(theme);
        return theme;
    }

    function saveDifficulties(pack) {
        saveRaw(pack);
    }

    function resetToDefaults() {
        localStorage.removeItem(STORAGE_KEY);
        return createDefaultPack();
    }

    function exportJson() {
        return JSON.stringify(getDifficulties(), null, 2);
    }

    function importJson(text) {
        const data = JSON.parse(text);
        saveRaw(data);
        return data;
    }

    function getLevelsExport() {
        const all = getDifficulties();
        const cfg = global.HC_PUBLISH_CONFIG;
        const defaultOrder = ['easy', 'medium', 'hard', 'hardcore', 'bornForHell'];
        const order = cfg?.modes || defaultOrder;
        const DIFFICULTIES = cfg?.modes ? filterPackForPublish(all) : all;
        return {
            W,
            H,
            DIFFICULTIES,
            DIFFICULTY_ORDER: order.filter((k) => DIFFICULTIES[k]),
        };
    }

    /** Nepublikované sektory (public: false) se ve hře zobrazí jako „coming soon“. */
    function isSectorPublic(sector) {
        return sector?.public !== false;
    }

    global.HCLevelStore = {
        W,
        H,
        STORAGE_KEY,
        THEMES,
        SECTOR_NAMES,
        deepClone,
        createSectorTemplate,
        createDefaultPack,
        getDifficulties,
        getProjectPack,
        saveDifficulties,
        resetToDefaults,
        exportJson,
        importJson,
        getLevelsExport,
        buildLevelsPackJs,
        getThemeDefaults,
        isSectorPublic,
    };
})(typeof window !== 'undefined' ? window : globalThis);
