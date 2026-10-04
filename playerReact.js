(function (global) {
    'use strict';

    const PLAYER_W = 11;
    const PLAYER_H = 15;

    function enabled(el) {
        return !!(el && el.reactPlayer);
    }

    function defaultProps() {
        return {
            reactMult: 1,
            reactDir: 'toward',
            reactMode: 'mirror',
            reactAxis: 'both',
            reactOffsetX: 0,
            reactOffsetY: 0,
            reactPerpAmp: 0,
            reactPerpFreq: 0.05,
            reactPerpPhase: 0,
            reactMaxDist: 120,
            reactMinDist: 0,
            reactRange: 0,
        };
    }

    function applyDefaults(el) {
        const d = defaultProps();
        for (const key of Object.keys(d)) {
            if (el[key] === undefined) el[key] = d[key];
        }
    }

    function initRuntime(el) {
        if (!enabled(el)) return;
        el._reactOx = 0;
        el._reactOy = 0;
        el._reactPrevPx = null;
        el._reactPrevPy = null;
        el._reactBaseCx = null;
        el._reactBaseCy = null;
        el._reactPerpX = 0;
        el._reactPerpY = 0;
    }

    function ensurePlayerBaseline(el, pcx, pcy) {
        if (el._reactBaseCx == null) {
            el._reactBaseCx = pcx;
            el._reactBaseCy = pcy;
        }
    }

    function cfg(el) {
        return {
            mult: el.reactMult ?? 1,
            dir: el.reactDir ?? 'toward',
            axis: el.reactAxis ?? 'both',
            mode: el.reactMode ?? 'mirror',
            offsetX: el.reactOffsetX ?? 0,
            offsetY: el.reactOffsetY ?? 0,
            perpAmp: el.reactPerpAmp ?? 0,
            perpFreq: el.reactPerpFreq ?? 0.05,
            perpPhase: el.reactPerpPhase ?? 0,
            maxDist: el.reactMaxDist ?? 120,
            minDist: el.reactMinDist ?? 0,
            reactRange: el.reactRange ?? 0,
        };
    }

    function clampOffset(ox, oy, maxDist) {
        const len = Math.hypot(ox, oy);
        if (len <= maxDist || maxDist <= 0) return { ox, oy };
        const s = maxDist / len;
        return { ox: ox * s, oy: oy * s };
    }

    function update(el, player, time, baseRect) {
        if (!enabled(el)) return;
        const c = cfg(el);
        const sign = c.dir === 'away' ? -1 : 1;
        const pw = player.w ?? PLAYER_W;
        const ph = player.h ?? PLAYER_H;
        const pcx = player.x + pw / 2;
        const pcy = player.y + ph / 2;
        const acx = baseRect.x + baseRect.w / 2;
        const acy = baseRect.y + baseRect.h / 2;

        ensurePlayerBaseline(el, pcx, pcy);
        const playerMoveDx = pcx - el._reactBaseCx;
        const playerMoveDy = pcy - el._reactBaseCy;

        if (c.mode === 'position') {
            const dx = pcx - acx;
            const dy = pcy - acy;
            const dist = Math.hypot(dx, dy);
            if (c.reactRange > 0 && dist > c.reactRange) {
                el._reactOx = 0;
                el._reactOy = 0;
            } else if (dist < c.minDist) {
                el._reactOx = 0;
                el._reactOy = 0;
            } else if (playerMoveDx === 0 && playerMoveDy === 0) {
                el._reactOx = 0;
                el._reactOy = 0;
            } else {
                let ox = sign * c.mult * playerMoveDx;
                let oy = sign * c.mult * playerMoveDy;
                if (c.axis === 'x') oy = 0;
                else if (c.axis === 'y') ox = 0;
                const clamped = clampOffset(ox, oy, c.maxDist);
                el._reactOx = clamped.ox;
                el._reactOy = clamped.oy;
            }
        } else {
            const curCx = acx + (el._reactOx || 0);
            const curCy = acy + (el._reactOy || 0);
            const dx = curCx - pcx;
            const dy = curCy - pcy;
            const dist = Math.hypot(dx, dy) || 1;

            if (el._reactPrevPx != null && (c.reactRange <= 0 || dist <= c.reactRange)) {
                const mdx = player.x - el._reactPrevPx;
                const mdy = player.y - el._reactPrevPy;
                if (mdx !== 0 || mdy !== 0) {
                    const ndx = dx / dist;
                    const ndy = dy / dist;
                    const towardElem = -(mdx * ndx + mdy * ndy);
                    if (dist >= c.minDist) {
                        const move = sign * c.mult * towardElem;
                        el._reactOx = (el._reactOx || 0) - ndx * move;
                        el._reactOy = (el._reactOy || 0) - ndy * move;
                    }
                }
            }
            el._reactPrevPx = player.x;
            el._reactPrevPy = player.y;

            if (c.axis === 'x') el._reactOy = 0;
            else if (c.axis === 'y') el._reactOx = 0;

            const clamped = clampOffset(el._reactOx || 0, el._reactOy || 0, c.maxDist);
            el._reactOx = clamped.ox;
            el._reactOy = clamped.oy;
        }

        if (c.perpAmp) {
            const ox = el._reactOx || 0;
            const oy = el._reactOy || 0;
            const curCx = acx + ox;
            const curCy = acy + oy;
            const dx = curCx - pcx;
            const dy = curCy - pcy;
            const dist = Math.hypot(dx, dy) || 1;
            const wobble = Math.sin(dist * c.perpFreq + c.perpPhase + time * 2) * c.perpAmp;
            el._reactPerpX = (-dy / dist) * wobble;
            el._reactPerpY = (dx / dist) * wobble;
        } else {
            el._reactPerpX = 0;
            el._reactPerpY = 0;
        }
    }

    function apply(el, baseRect) {
        if (!enabled(el)) return baseRect;
        const ox = (el._reactOx || 0) + (el.reactOffsetX ?? 0) + (el._reactPerpX || 0);
        const oy = (el._reactOy || 0) + (el.reactOffsetY ?? 0) + (el._reactPerpY || 0);
        return { x: baseRect.x + ox, y: baseRect.y + oy, w: baseRect.w, h: baseRect.h };
    }

    function worldRect(el, baseRect, player, time) {
        if (!enabled(el)) return baseRect;
        update(el, player, time, baseRect);
        return apply(el, baseRect);
    }

    function cloneElement(el) {
        const copy = { ...el };
        initRuntime(copy);
        return copy;
    }

    global.HCPlayerReact = {
        PLAYER_W,
        PLAYER_H,
        enabled,
        defaultProps,
        applyDefaults,
        initRuntime,
        update,
        apply,
        worldRect,
        cloneElement,
    };
})(typeof window !== 'undefined' ? window : globalThis);
