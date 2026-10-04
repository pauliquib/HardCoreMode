(function (global) {
    'use strict';

    function defaultBlocks(kind) {
        return kind === 'solid' || kind === 'crumble';
    }

    function defaultKill(kind) {
        return kind === 'spike' || kind === 'mover' || kind === 'pulse';
    }

    function blocksPlayer(el, kind) {
        if (!el || kind === 'spawn') return false;
        if (el.blocksPlayer !== undefined) return !!el.blocksPlayer;
        return defaultBlocks(kind);
    }

    function killOnContact(el, kind) {
        if (!el || kind === 'spawn') return false;
        if (el.killOnContact !== undefined) return !!el.killOnContact;
        return defaultKill(kind);
    }

    function applyDefaults(el, kind) {
        if (!el || kind === 'spawn') return;
        if (el.blocksPlayer === undefined) el.blocksPlayer = defaultBlocks(kind);
        if (el.killOnContact === undefined) el.killOnContact = defaultKill(kind);
        if (kind === 'mover' && el.axis !== 'x' && el.axis !== 'y') el.axis = 'x';
    }

    function overlap(a, b) {
        return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    }

    function elementRect(el, kind, time, helpers) {
        let base;
        if (kind === 'mover') base = helpers.moverRect(el, time);
        else if (kind === 'spawn') return null;
        else if (kind === 'goal' || kind === 'pickup' || kind === 'solid' || kind === 'crumble' || kind === 'spike') {
            base = { x: el.x, y: el.y, w: el.w, h: el.h };
        } else if (kind === 'pulse') {
            base = helpers.pulseRect(el);
        } else {
            return null;
        }
        return HCPlayerReact.enabled(el) ? HCPlayerReact.apply(el, base) : base;
    }

    function isActive(el, kind, time, mods, helpers) {
        if (kind === 'pulse') return helpers.pulseActive(el, time) && !(mods && mods.pulseOff);
        if (kind === 'pickup') return !el.collected;
        if (kind === 'crumble') return !el.broken;
        return true;
    }

    function elementGroups(sector) {
        return [
            ['solid', sector.solids],
            ['crumble', sector.crumble],
            ['spike', sector.spikes],
            ['mover', sector.movers],
            ['pulse', sector.pulses],
            ['pickup', sector.pickups || []],
            ['goal', sector.goal ? [sector.goal] : []],
        ];
    }

    function standingOnTop(playerRect, plat, flipGravity) {
        const tol = 2.5;
        if (flipGravity) {
            if (Math.abs((playerRect.y + playerRect.h) - (plat.y + plat.h)) > tol) return false;
        } else if (Math.abs((playerRect.y + playerRect.h) - plat.y) > tol) {
            return false;
        }
        const cx = playerRect.x + playerRect.w / 2;
        return cx > plat.x && cx < plat.x + plat.w;
    }

    function collectBlockingRects(sector, time, mods, helpers) {
        const list = [];
        for (const [kind, items] of elementGroups(sector)) {
            for (const el of items) {
                if (!blocksPlayer(el, kind)) continue;
                if (!isActive(el, kind, time, mods || {}, helpers)) continue;
                const rect = elementRect(el, kind, time, helpers);
                if (!rect) continue;
                const item = { x: rect.x, y: rect.y, w: rect.w, h: rect.h };
                if (kind === 'crumble') item._crumble = el;
                list.push(item);
            }
        }
        return list;
    }

    function carryPlayer(player, sector, prevTime, time, playerW, playerH, flipGravity, helpers) {
        if (!player.onGround) return;
        const pRect = { x: player.x, y: player.y, w: playerW, h: playerH };
        for (const m of sector.movers) {
            if (!blocksPlayer(m, 'mover')) continue;
            const prev = elementRect(m, 'mover', prevTime, helpers);
            const now = elementRect(m, 'mover', time, helpers);
            if (!prev || !now) continue;
            if (!standingOnTop(pRect, prev, flipGravity)) continue;
            player.x += now.x - prev.x;
            player.y += now.y - prev.y;
        }
    }

    function clampPlayerToCanvas(player, canvasW, canvasH) {
        const pw = player.w ?? 11;
        if (player.x < 0) {
            player.x = 0;
            player.vx = 0;
        }
        if (player.x + pw > canvasW) {
            player.x = canvasW - pw;
            player.vx = 0;
        }
        if (player.y < 0) {
            player.y = 0;
            player.vy = 0;
        }
    }

    /**
     * @returns {boolean}
     */
    function checkPlayerDeath(sector, playerRect, time, mods, helpers) {
        if (mods.shield) return false;

        for (const [kind, items] of elementGroups(sector)) {
            for (const el of items) {
                if (!killOnContact(el, kind)) continue;
                if (!isActive(el, kind, time, mods, helpers)) continue;
                const rect = elementRect(el, kind, time, helpers);
                if (!rect || !overlap(playerRect, rect)) continue;
                if (blocksPlayer(el, kind) && standingOnTop(playerRect, rect, !!mods.flipGravity)) continue;
                return true;
            }
        }
        return false;
    }

    global.HCPlayerTouch = {
        defaultBlocks,
        defaultKill,
        blocksPlayer,
        killOnContact,
        applyDefaults,
        collectBlockingRects,
        carryPlayer,
        clampPlayerToCanvas,
        checkPlayerDeath,
    };
})(typeof window !== 'undefined' ? window : globalThis);
