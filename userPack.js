(function (global) {
    'use strict';

    const FORMAT_VERSION = 1;
    const TYPE = 'hc-user-pack';
    const CUSTOM_ID = 'custom';

    function defaultTheme() {
        if (global.HCLevelStore) return HCLevelStore.getThemeDefaults('easy');
        return { bg: '#0a1218', solid: '#1e3a48', solidStroke: '#3a6a7a', overlayAccent: '#5ec8e8' };
    }

    function createEmpty(projectName) {
        const name = global.HCPackGuard
            ? HCPackGuard.sanitizeText(projectName || 'Můj projekt', 80)
            : String(projectName || 'Můj projekt').slice(0, 80);
        const sectors = global.HCLevelStore
            ? [HCLevelStore.createSectorTemplate('easy', 0)]
            : [{
                name: 'Level 1',
                lavaSpeed: 16,
                lavaStartOffset: 130,
                public: true,
                spawn: { x: 48, y: 465 },
                goal: { x: 792, y: 68, w: 44, h: 40 },
                solids: [{ x: 0, y: 480, w: 180, h: 40 }],
                crumble: [],
                spikes: [],
                movers: [],
                pulses: [],
                pickups: [],
            }];
        return {
            formatVersion: FORMAT_VERSION,
            type: TYPE,
            projectName: name,
            label: name,
            tagline: 'Vlastní sada levelů',
            theme: defaultTheme(),
            music: null,
            sectors,
        };
    }

    function toDifficultyData(pack) {
        return {
            id: CUSTOM_ID,
            label: pack.projectName || pack.label || 'Vlastní sada',
            tagline: pack.tagline || 'Vlastní sada levelů',
            theme: pack.theme,
            music: pack.music || null,
            sectors: pack.sectors || [],
        };
    }

    function fromDifficulty(diff, projectName) {
        const name = global.HCPackGuard
            ? HCPackGuard.sanitizeText(projectName || diff.label || 'Můj projekt', 80)
            : String(projectName || diff.label || 'Můj projekt').slice(0, 80);
        return {
            formatVersion: FORMAT_VERSION,
            type: TYPE,
            projectName: name,
            label: name,
            tagline: diff.tagline || 'Vlastní sada levelů',
            theme: diff.theme,
            music: diff.music || null,
            sectors: (diff.sectors || []).map((s) => ({ ...s, public: true })),
        };
    }

    function toGameDifficulty(pack) {
        const validated = global.HCPackGuard ? HCPackGuard.validateUserPack(pack) : pack;
        return toDifficultyData(validated);
    }

    function toJson(pack) {
        const data = global.HCPackGuard ? HCPackGuard.validateUserPack(pack) : pack;
        return JSON.stringify(data, null, 2);
    }

    function download(pack, filename) {
        const safeName = String(filename || pack.projectName || 'hardcore-mapy')
            .replace(/[^\w\u00C0-\u024F.-]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '') || 'hardcore-mapy';
        const blob = new Blob([toJson(pack)], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${safeName}.hc-pack.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    global.HCUserPack = {
        FORMAT_VERSION,
        TYPE,
        CUSTOM_ID,
        createEmpty,
        toDifficultyData,
        fromDifficulty,
        toGameDifficulty,
        toJson,
        download,
    };
})(typeof window !== 'undefined' ? window : globalThis);
