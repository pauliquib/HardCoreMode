(function (global) {
    'use strict';

    const STORAGE_KEY = 'hc_progress_v1';

    function loadAll() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return {};
            const data = JSON.parse(raw);
            return data && typeof data === 'object' ? data : {};
        } catch {
            return {};
        }
    }

    function saveAll(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    function diffBucket(diffId) {
        const all = loadAll();
        if (!all[diffId]) all[diffId] = {};
        return all[diffId];
    }

    function getSectorRecord(diffId, sectorIndex) {
        const bucket = loadAll()[diffId];
        if (!bucket) return null;
        const rec = bucket[String(sectorIndex)];
        return rec && typeof rec === 'object' ? rec : null;
    }

    function isSectorPublic(sector) {
        if (global.HCLevelStore) return global.HCLevelStore.isSectorPublic(sector);
        return sector?.public !== false;
    }

    /** První veřejný sektor je vždy odemčen; další po dokončení předchozího. */
    function isSectorUnlocked(diffId, sectorIndex, sectors) {
        if (!sectors || sectorIndex < 0 || sectorIndex >= sectors.length) return false;
        if (!isSectorPublic(sectors[sectorIndex])) return false;

        let prevPlayable = -1;
        for (let i = 0; i < sectorIndex; i++) {
            if (isSectorPublic(sectors[i])) prevPlayable = i;
        }
        if (prevPlayable < 0) return true;

        const prev = getSectorRecord(diffId, prevPlayable);
        return !!(prev && prev.completed);
    }

    function getSectorTileState(diffId, sectorIndex, sector, sectors) {
        if (!isSectorPublic(sector)) {
            return { kind: 'coming_soon' };
        }
        if (!isSectorUnlocked(diffId, sectorIndex, sectors)) {
            return { kind: 'locked' };
        }
        const rec = getSectorRecord(diffId, sectorIndex);
        if (rec && rec.completed) {
            return {
                kind: 'completed',
                bestTime: rec.bestTime,
                bestDeaths: rec.bestDeaths,
            };
        }
        return { kind: 'unlocked' };
    }

    function recordSectorComplete(diffId, sectorIndex, timeSec, deaths) {
        const all = loadAll();
        if (!all[diffId]) all[diffId] = {};
        const key = String(sectorIndex);
        const prev = all[diffId][key] || {};
        const bestTime =
            prev.bestTime != null ? Math.min(prev.bestTime, timeSec) : timeSec;
        const bestDeaths =
            prev.bestDeaths != null ? Math.min(prev.bestDeaths, deaths) : deaths;
        all[diffId][key] = {
            completed: true,
            bestTime,
            bestDeaths,
            lastTime: timeSec,
            lastDeaths: deaths,
            completedAt: Date.now(),
        };
        saveAll(all);
        return all[diffId][key];
    }

    function getDifficultyStats(diffId, sectorCount) {
        let completed = 0;
        for (let i = 0; i < sectorCount; i++) {
            const rec = getSectorRecord(diffId, i);
            if (rec && rec.completed) completed++;
        }
        return { completed };
    }

    function firstPlayableSectorIndex(diffId, sectors) {
        for (let i = 0; i < sectors.length; i++) {
            const state = getSectorTileState(diffId, i, sectors[i], sectors);
            if (state.kind === 'unlocked' || state.kind === 'completed') return i;
        }
        return -1;
    }

    global.HCProgress = {
        STORAGE_KEY,
        loadAll,
        getSectorRecord,
        isSectorUnlocked,
        getSectorTileState,
        recordSectorComplete,
        getDifficultyStats,
        firstPlayableSectorIndex,
        isSectorPublic,
    };
})(typeof window !== 'undefined' ? window : globalThis);
