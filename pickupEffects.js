(function (global) {
    'use strict';

    /** @typedef {{ effectType: string, strength: number, remaining: number, flipGravity?: boolean }} ActiveEffect */

    const PICKUP_EFFECTS = {
        speed: {
            label: 'Rychlost',
            defaultStrength: 1.5,
            defaultDuration: 4,
            affects: 'player',
            desc: 'Zvyšuje horizontální rychlost',
        },
        jump: {
            label: 'Skok',
            defaultStrength: 1.25,
            defaultDuration: 5,
            affects: 'player',
            desc: 'Silnější skoky',
        },
        shield: {
            label: 'Štít',
            defaultStrength: 1,
            defaultDuration: 3,
            affects: 'player',
            desc: 'Neviditelnost vůči nebezpečí',
        },
        low_gravity: {
            label: 'Nízká gravitace',
            defaultStrength: 0.55,
            defaultDuration: 4,
            affects: 'player',
            desc: 'Slabší gravitace',
        },
        lava_slow: {
            label: 'Pomalá láva',
            defaultStrength: 0.45,
            defaultDuration: 6,
            affects: 'environment',
            desc: 'Zpomalí stoupání lávy',
        },
        pulse_off: {
            label: 'Pulz vypnut',
            defaultStrength: 1,
            defaultDuration: 5,
            affects: 'environment',
            desc: 'Pulzní zóny nejsou smrtelné',
        },
        mirror_move: {
            label: 'Zrcadlený pohyb',
            defaultStrength: 1,
            defaultDuration: 5,
            affects: 'player',
            desc: 'Levá a pravá šipka jsou prohozené',
        },
        flip_scene: {
            label: 'Převrácení',
            defaultStrength: 1,
            defaultDuration: 5,
            affects: 'environment',
            desc: 'Scéna vzhůru nohama — gravitaci lze zapnout/vypnout',
        },
        player_size: {
            label: 'Velikost',
            defaultStrength: 0.65,
            defaultDuration: 5,
            affects: 'player',
            desc: 'Změní velikost hráče (síla = násobitel, např. 0.5 malý / 1.5 velký)',
        },
    };

    const MIN_PLAYER_SCALE = 0.45;
    const MAX_PLAYER_SCALE = 2;

    const EFFECT_ORDER = Object.keys(PICKUP_EFFECTS);

    const PICKUP_THEME_DEFAULTS = {
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

    function pickupThemeKeyFill(effectType) {
        return `pickup_${effectType}`;
    }

    function pickupThemeKeyGlow(effectType) {
        return `pickup_${effectType}Glow`;
    }

    function applyThemeDefaults(theme) {
        if (!theme) return theme;
        for (const id of EFFECT_ORDER) {
            const d = PICKUP_THEME_DEFAULTS[id];
            const fk = pickupThemeKeyFill(id);
            const gk = pickupThemeKeyGlow(id);
            if (theme[fk] == null) theme[fk] = theme.pickup ?? d.fill;
            if (theme[gk] == null) theme[gk] = theme.pickupGlow ?? d.glow;
        }
        return theme;
    }

    function getPickupColors(theme, effectType) {
        const id = effectType || 'speed';
        const d = PICKUP_THEME_DEFAULTS[id] || PICKUP_THEME_DEFAULTS.speed;
        return {
            fill: theme[pickupThemeKeyFill(id)] ?? theme.pickup ?? d.fill,
            glow: theme[pickupThemeKeyGlow(id)] ?? theme.pickupGlow ?? d.glow,
        };
    }

    function getThemeColorFields() {
        return EFFECT_ORDER.flatMap((id) => {
            const fx = PICKUP_EFFECTS[id];
            return [
                { key: pickupThemeKeyFill(id), label: `Bonus — ${fx.label}` },
                { key: pickupThemeKeyGlow(id), label: `Bonus — ${fx.label} glow` },
            ];
        });
    }

    function pickupDefaults(p) {
        const def = PICKUP_EFFECTS[p.effectType] || PICKUP_EFFECTS.speed;
        return {
            effectType: p.effectType || 'speed',
            strength: p.strength ?? def.defaultStrength,
            duration: p.duration ?? def.defaultDuration,
        };
    }

    function createEffectState() {
        return [];
    }

    /** @param {ActiveEffect[]} activeEffects */
    function clearEffects(activeEffects) {
        activeEffects.length = 0;
    }

    /** @param {ActiveEffect[]} activeEffects */
    function applyPickup(activeEffects, pickup) {
        const cfg = pickupDefaults(pickup);
        /** @type {ActiveEffect} */
        const entry = {
            effectType: cfg.effectType,
            strength: cfg.strength,
            remaining: cfg.duration,
        };
        if (cfg.effectType === 'flip_scene') {
            entry.flipGravity = pickup.flipGravity !== false;
        }
        activeEffects.push(entry);
    }

    /** @param {ActiveEffect[]} activeEffects */
    function tickEffects(activeEffects, dt) {
        for (let i = activeEffects.length - 1; i >= 0; i--) {
            activeEffects[i].remaining -= dt;
            if (activeEffects[i].remaining <= 0) activeEffects.splice(i, 1);
        }
    }

    /** @param {ActiveEffect[]} activeEffects */
    function hasEffect(activeEffects, type) {
        return activeEffects.some((e) => e.effectType === type);
    }

    /** @param {ActiveEffect[]} activeEffects */
    function effectStrength(activeEffects, type, fallback = 1) {
        let best = fallback;
        for (const e of activeEffects) {
            if (e.effectType === type) best = Math.max(best, e.strength);
        }
        return best;
    }

    /** @param {ActiveEffect[]} activeEffects */
    function latestEffectStrength(activeEffects, type, fallback = 1) {
        for (let i = activeEffects.length - 1; i >= 0; i--) {
            if (activeEffects[i].effectType === type) return activeEffects[i].strength;
        }
        return fallback;
    }

    /** @param {ActiveEffect[]} activeEffects */
    function getPhysicsModifiers(activeEffects) {
        const shield = hasEffect(activeEffects, 'shield');
        return {
            move: effectStrength(activeEffects, 'speed', 1),
            maxX: effectStrength(activeEffects, 'speed', 1),
            jump: effectStrength(activeEffects, 'jump', 1),
            jumpAir: effectStrength(activeEffects, 'jump', 1),
            grav: effectStrength(activeEffects, 'low_gravity', 1),
            lavaSpeed: effectStrength(activeEffects, 'lava_slow', 1),
            shield,
            pulseOff: hasEffect(activeEffects, 'pulse_off'),
            mirrorMove: hasEffect(activeEffects, 'mirror_move'),
            flipScene: hasEffect(activeEffects, 'flip_scene'),
            flipGravity: activeEffects.some(
                (e) => e.effectType === 'flip_scene' && e.flipGravity !== false
            ),
            playerScale: latestEffectStrength(activeEffects, 'player_size', 1),
        };
    }

    function clampPlayerScale(scale) {
        return Math.max(MIN_PLAYER_SCALE, Math.min(MAX_PLAYER_SCALE, scale));
    }

    function getPlayerDimensions(mods, baseW, baseH) {
        const scale = clampPlayerScale(mods.playerScale ?? 1);
        return { w: baseW * scale, h: baseH * scale, scale };
    }

    function applyPlayerDimensions(player, mods, baseW, baseH) {
        const dim = getPlayerDimensions(mods, baseW, baseH);
        player.w = dim.w;
        player.h = dim.h;
        return dim;
    }

    function applyMoveInput(ax, mods) {
        return mods.mirrorMove ? -ax : ax;
    }

    function scaledJump(baseJump, strength, flipGravity) {
        const v = baseJump * strength;
        return flipGravity ? -v : v;
    }

    function applyGravity(vy, grav, strength, flipGravity, dt) {
        const delta = grav * strength * dt;
        return flipGravity ? vy - delta : vy + delta;
    }

    function clampVerticalVelocity(vy, flipGravity) {
        return flipGravity ? Math.max(vy, -880) : Math.min(vy, 880);
    }

    function rectsOverlap(a, b) {
        return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    }

    function resolveVerticalCollision(player, pr, rects, playerH, flipGravity, crumbleTime) {
        player.onGround = false;
        for (const r of rects) {
            if (!rectsOverlap(pr, r)) continue;
            if (flipGravity) {
                if (player.vy < 0) {
                    player.y = r.y + r.h + 0.01;
                    player.vy = 0;
                    player.onGround = true;
                    if (r._crumble) HCCrumblePlatform.onPlayerLand(r._crumble, crumbleTime);
                } else if (player.vy > 0) {
                    player.y = r.y - playerH - 0.01;
                    player.vy = 0;
                }
            } else if (player.vy > 0) {
                player.y = r.y - playerH - 0.01;
                player.vy = 0;
                player.onGround = true;
                if (r._crumble) HCCrumblePlatform.onPlayerLand(r._crumble, crumbleTime);
            } else if (player.vy < 0) {
                player.y = r.y + r.h + 0.01;
                player.vy = 0;
            }
            pr.y = player.y;
        }
    }

    function beginSceneFlipDraw(ctx, canvasH, flipScene) {
        if (!flipScene) return false;
        ctx.save();
        ctx.translate(0, canvasH);
        ctx.scale(1, -1);
        return true;
    }

    function endSceneFlipDraw(ctx, flipped) {
        if (flipped) ctx.restore();
    }

    /** @param {ActiveEffect[]} activeEffects */
    function getPrimaryEffect(activeEffects) {
        if (!activeEffects.length) return null;
        return activeEffects.reduce((a, b) => (a.remaining >= b.remaining ? a : b));
    }

    global.HCPickupEffects = {
        PICKUP_EFFECTS,
        EFFECT_ORDER,
        PICKUP_THEME_DEFAULTS,
        pickupThemeKeyFill,
        pickupThemeKeyGlow,
        applyThemeDefaults,
        getPickupColors,
        getThemeColorFields,
        pickupDefaults,
        createEffectState,
        clearEffects,
        applyPickup,
        tickEffects,
        hasEffect,
        effectStrength,
        getPhysicsModifiers,
        getPrimaryEffect,
        clampPlayerScale,
        getPlayerDimensions,
        applyPlayerDimensions,
        applyMoveInput,
        scaledJump,
        applyGravity,
        clampVerticalVelocity,
        resolveVerticalCollision,
        beginSceneFlipDraw,
        endSceneFlipDraw,
    };
})(typeof window !== 'undefined' ? window : globalThis);
