(function (global) {
    'use strict';

    const CRUMBLE_TIME = 0.38;
    const WHEN_TOUCH = 'touch';
    const WHEN_LEAVE = 'leave';

    function crumbleWhen(el) {
        return el && el.crumbleWhen === WHEN_LEAVE ? WHEN_LEAVE : WHEN_TOUCH;
    }

    function applyDefaults(el) {
        if (!el) return;
        if (el.crumbleWhen === undefined) el.crumbleWhen = WHEN_TOUCH;
    }

    function initRuntime(c) {
        c.broken = false;
        c.stress = 0;
        c.occupied = false;
    }

    function cloneForPlay(el, id) {
        applyDefaults(el);
        const copy = { ...HCPlayerReact.cloneElement(el), id };
        initRuntime(copy);
        return copy;
    }

    function beginCrumble(c, crumbleTime) {
        if (!c || c.broken) return;
        if (c.stress <= 0) c.stress = crumbleTime;
    }

    function onPlayerLand(c, crumbleTime) {
        if (!c || c.broken) return;
        if (crumbleWhen(c) === WHEN_TOUCH) {
            beginCrumble(c, crumbleTime);
        } else {
            c.occupied = true;
        }
    }

    function platformRect(c) {
        const base = { x: c.x, y: c.y, w: c.w, h: c.h };
        return HCPlayerReact.enabled(c) ? HCPlayerReact.apply(c, base) : base;
    }

    function isPlayerOnTop(player, platRect, playerW, playerH, flipScene) {
        const tol = 1.5;
        if (flipScene) {
            const head = player.y + playerH;
            const platBottom = platRect.y + platRect.h;
            if (Math.abs(head - platBottom) > tol) return false;
        } else {
            const feet = player.y + playerH;
            const platTop = platRect.y;
            if (Math.abs(feet - platTop) > tol) return false;
        }
        const cx = player.x + playerW / 2;
        return cx > platRect.x + 0.5 && cx < platRect.x + platRect.w - 0.5;
    }

    function updateCrumbles(crumbles, dt, crumbleTime, player, playerW, playerH, flipScene) {
        for (const c of crumbles) {
            if (c.broken) continue;

            const onTop = isPlayerOnTop(player, platformRect(c), playerW, playerH, flipScene);

            if (crumbleWhen(c) === WHEN_LEAVE) {
                if (c.occupied && !onTop) {
                    beginCrumble(c, crumbleTime);
                    c.occupied = false;
                } else if (onTop) {
                    c.occupied = true;
                }
            } else if (onTop) {
                beginCrumble(c, crumbleTime);
            }

            if (c.stress > 0) {
                c.stress -= dt;
                if (c.stress <= 0) c.broken = true;
            }
        }
    }

    global.HCCrumblePlatform = {
        CRUMBLE_TIME,
        WHEN_TOUCH,
        WHEN_LEAVE,
        crumbleWhen,
        applyDefaults,
        initRuntime,
        cloneForPlay,
        onPlayerLand,
        platformRect,
        isPlayerOnTop,
        updateCrumbles,
    };
})(typeof window !== 'undefined' ? window : globalThis);
