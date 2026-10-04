(function (global) {
    'use strict';

    const GRAV = 2480;
    const JUMP = -565;
    const JUMP_AIR = -505;
    const MOVE = 268;
    const MAX_X = 410;
    const COYOTE_MS = 42;
    const BUFFER_MS = 72;
    const CRUMBLE_TIME = HCCrumblePlatform.CRUMBLE_TIME;
    const PLAYER_W = 11;
    const PLAYER_H = 15;

    function cloneForPlay(bp) {
        return {
            name: bp.name,
            lavaSpeed: bp.lavaSpeed,
            lavaStartOffset: bp.lavaStartOffset,
            spawn: { ...bp.spawn },
            goal: HCPlayerReact.cloneElement({ ...bp.goal }),
            solids: bp.solids.map((r) => HCPlayerReact.cloneElement(r)),
            crumble: bp.crumble.map((r, i) => HCCrumblePlatform.cloneForPlay(r, i)),
            spikes: bp.spikes.map((r) => HCPlayerReact.cloneElement(r)),
            movers: bp.movers.map((m) => HCPlayerReact.cloneElement(m)),
            pulses: bp.pulses.map((p) => HCPlayerReact.cloneElement(p)),
            pickups: (bp.pickups || []).map((p) => ({ ...HCPlayerReact.cloneElement(p), collected: false })),
        };
    }

    function createPlayer(spawn) {
        return {
            x: spawn.x,
            y: spawn.y,
            w: PLAYER_W,
            h: PLAYER_H,
            vx: 0,
            vy: 0,
            onGround: false,
            coyote: 0,
            buffer: 0,
            airJumpsLeft: 1,
            jumpHeldPrev: false,
        };
    }

    function resetPlay(bp, canvasH) {
        const sector = cloneForPlay(bp);
        return {
            sector,
            player: createPlayer(sector.spawn),
            keys: Object.create(null),
            t: 0,
            lavaY: canvasH + bp.lavaStartOffset,
            deaths: 0,
            activeEffects: HCPickupEffects.createEffectState(),
        };
    }

    function moverRect(m, time) {
        const ang = time * m.spd * Math.PI * 2 + m.phase;
        const d = Math.sin(ang) * m.amp;
        if (m.axis !== 'y') return { x: m.x + d, y: m.y, w: m.w, h: m.h };
        return { x: m.x, y: m.y + d, w: m.w, h: m.h };
    }

    function pulseActive(p, time) {
        const u = ((time + p.phase) % p.period) / p.period;
        return u < 0.5;
    }

    function pulseRect(p) {
        return { x: p.x, y: p.y, w: p.w, h: p.h };
    }

    function playerRect(player) {
        return {
            x: player.x,
            y: player.y,
            w: player.w ?? PLAYER_W,
            h: player.h ?? PLAYER_H,
        };
    }

    function overlap(a, b) {
        return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    }

    function touchHelpers() {
        return { moverRect, pulseRect, pulseActive };
    }

    function solidRects(sector, time, mods) {
        return HCPlayerTouch.collectBlockingRects(sector, time, mods, touchHelpers());
    }

    function updateAllPlayerReacts(sector, player, time) {
        for (const r of sector.solids) {
            const base = { x: r.x, y: r.y, w: r.w, h: r.h };
            if (HCPlayerReact.enabled(r)) HCPlayerReact.update(r, player, time, base);
        }
        for (const c of sector.crumble) {
            if (c.broken) continue;
            const base = { x: c.x, y: c.y, w: c.w, h: c.h };
            if (HCPlayerReact.enabled(c)) HCPlayerReact.update(c, player, time, base);
        }
        for (const sp of sector.spikes) {
            const base = { x: sp.x, y: sp.y, w: sp.w, h: sp.h };
            if (HCPlayerReact.enabled(sp)) HCPlayerReact.update(sp, player, time, base);
        }
        for (const m of sector.movers) {
            const base = moverRect(m, time);
            if (HCPlayerReact.enabled(m)) HCPlayerReact.update(m, player, time, base);
        }
        for (const p of sector.pulses) {
            const base = pulseRect(p);
            if (HCPlayerReact.enabled(p)) HCPlayerReact.update(p, player, time, base);
        }
        for (const pk of sector.pickups || []) {
            if (pk.collected) continue;
            const base = { x: pk.x, y: pk.y, w: pk.w, h: pk.h };
            if (HCPlayerReact.enabled(pk)) HCPlayerReact.update(pk, player, time, base);
        }
        const goalBase = { x: sector.goal.x, y: sector.goal.y, w: sector.goal.w, h: sector.goal.h };
        if (HCPlayerReact.enabled(sector.goal)) HCPlayerReact.update(sector.goal, player, time, goalBase);
    }

    function tryResolveX(sector, player, dt, t, mods) {
        player.x += player.vx * dt;
        const pr = playerRect(player);
        for (const r of solidRects(sector, t, mods)) {
            if (!overlap(pr, r)) continue;
            if (player.vx > 0) player.x = r.x - pr.w - 0.01;
            else if (player.vx < 0) player.x = r.x + r.w + 0.01;
            pr.x = player.x;
            player.vx = 0;
        }
    }

    function tryResolveY(sector, player, dt, t, mods) {
        player.y += player.vy * dt;
        const pr = playerRect(player);
        HCPickupEffects.resolveVerticalCollision(
            player, pr, solidRects(sector, t, mods), pr.h, mods.flipGravity, CRUMBLE_TIME
        );
    }

    function hexToRgb(hex) {
        const h = String(hex).replace('#', '').slice(0, 6);
        return [
            parseInt(h.slice(0, 2), 16),
            parseInt(h.slice(2, 4), 16),
            parseInt(h.slice(4, 6), 16),
        ];
    }

    function lerpHex(a, b, t) {
        const ca = hexToRgb(a);
        const cb = hexToRgb(b);
        const r = Math.floor(ca[0] + (cb[0] - ca[0]) * t);
        const g = Math.floor(ca[1] + (cb[1] - ca[1]) * t);
        const bl = Math.floor(ca[2] + (cb[2] - ca[2]) * t);
        return `rgb(${r},${g},${bl})`;
    }

    function parseCrumbleColor(theme, heat) {
        if (heat >= 0.75) return theme.crumbleHot;
        const t = heat / 0.75;
        if (t < 0.5) return lerpHex(theme.crumbleCool, theme.crumbleWarm, t * 2);
        return lerpHex(theme.crumbleWarm, theme.crumbleHot, (t - 0.5) * 2);
    }

    /**
     * @returns {{ died: boolean, won: boolean }}
     */
    function update(playState, dt) {
        const sector = playState.sector;
        const player = playState.player;
        const keys = playState.keys;

        playState.t += dt;
        const t = playState.t;
        HCPickupEffects.tickEffects(playState.activeEffects, dt);
        const mods = HCPickupEffects.getPhysicsModifiers(playState.activeEffects);
        HCPickupEffects.applyPlayerDimensions(player, mods, PLAYER_W, PLAYER_H);

        playState.lavaY -= sector.lavaSpeed * mods.lavaSpeed * dt;

        let ax = 0;
        if (keys['a'] || keys['arrowleft']) ax -= 1;
        if (keys['d'] || keys['arrowright']) ax += 1;
        ax = HCPickupEffects.applyMoveInput(ax, mods);
        player.vx += ax * MOVE * mods.move * 8 * dt;
        if (ax === 0) player.vx *= Math.exp(-14 * dt);
        const maxX = MAX_X * mods.maxX;
        player.vx = Math.max(-maxX, Math.min(maxX, player.vx));

        if (player.onGround) player.coyote = COYOTE_MS / 1000;
        else player.coyote = Math.max(0, player.coyote - dt);

        const wantJump = keys.space || keys[' '] || keys['arrowup'] || keys['w'];
        if (wantJump) {
            if (player.onGround || player.coyote > 0) {
                player.buffer = BUFFER_MS / 1000;
            } else if (!player.jumpHeldPrev) {
                player.buffer = BUFFER_MS / 1000;
            }
        } else {
            player.buffer = Math.max(0, player.buffer - dt);
        }
        player.jumpHeldPrev = wantJump;

        if (player.buffer > 0 && player.coyote > 0) {
            player.vy = HCPickupEffects.scaledJump(JUMP, mods.jump, mods.flipGravity);
            player.buffer = 0;
            player.coyote = 0;
            player.onGround = false;
        } else if (player.buffer > 0 && !player.onGround && player.airJumpsLeft > 0) {
            player.vy = HCPickupEffects.scaledJump(JUMP_AIR, mods.jumpAir, mods.flipGravity);
            player.buffer = 0;
            player.airJumpsLeft--;
        } else if (player.buffer > 0) {
            player.buffer = 0;
        }

        player.vy = HCPickupEffects.applyGravity(player.vy, GRAV, mods.grav, mods.flipGravity, dt);
        player.vy = HCPickupEffects.clampVerticalVelocity(player.vy, mods.flipGravity);

        HCPlayerTouch.carryPlayer(
            player, sector, t - dt, t, player.w, player.h, mods.flipGravity, touchHelpers()
        );

        tryResolveX(sector, player, dt, t, mods);
        tryResolveY(sector, player, dt, t, mods);
        HCPlayerTouch.clampPlayerToCanvas(player, HCLevelStore.W, HCLevelStore.H);

        updateAllPlayerReacts(sector, player, t);

        HCCrumblePlatform.updateCrumbles(
            sector.crumble, dt, CRUMBLE_TIME, player, player.w, player.h, mods.flipGravity
        );

        if (player.onGround) player.airJumpsLeft = 1;

        const pr = playerRect(player);

        for (const pk of sector.pickups || []) {
            if (!pk.collected) {
                const base = { x: pk.x, y: pk.y, w: pk.w, h: pk.h };
                if (overlap(pr, HCPlayerReact.apply(pk, base))) {
                    HCPickupEffects.applyPickup(playState.activeEffects, pk);
                    pk.collected = true;
                }
            }
        }

        if (!mods.shield && pr.y + pr.h > playState.lavaY) {
            HCPickupEffects.clearEffects(playState.activeEffects);
            return { died: true, won: false };
        }

        if (!mods.shield && pr.y + pr.h >= HCLevelStore.H) {
            HCPickupEffects.clearEffects(playState.activeEffects);
            return { died: true, won: false };
        }

        if (HCPlayerTouch.checkPlayerDeath(sector, pr, t, mods, touchHelpers())) {
            HCPickupEffects.clearEffects(playState.activeEffects);
            return { died: true, won: false };
        }

        const goalBase = { x: sector.goal.x, y: sector.goal.y, w: sector.goal.w, h: sector.goal.h };
        if (overlap(pr, HCPlayerReact.apply(sector.goal, goalBase))) {
            return { died: false, won: true };
        }

        return { died: false, won: false };
    }

    global.HCSectorSim = {
        PLAYER_W,
        PLAYER_H,
        CRUMBLE_TIME,
        cloneForPlay,
        createPlayer,
        resetPlay,
        moverRect,
        pulseActive,
        pulseRect,
        parseCrumbleColor,
        update,
    };
})(typeof window !== 'undefined' ? window : globalThis);
