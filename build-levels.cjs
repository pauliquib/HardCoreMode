#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const W = 880;
const H = 520;

const GRAV = 2480;
const JUMP = -565;
const JUMP_AIR = -505;
const MOVE = 268;
const MAX_X = 410;
const PLAYER_W = 11;
const PLAYER_H = 15;
const DT = 1 / 240;

function overlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function canReachPlatform(fromPlat, toPlat) {
    for (const holdDir of [0, 1]) {
        for (let sx = fromPlat.x; sx <= fromPlat.x + fromPlat.w - PLAYER_W; sx += 4) {
            for (let pre = 0; pre <= 90; pre += 6) {
                let x = sx, y = fromPlat.y - PLAYER_H, vx = 0, vy = 0, t = 0, used = false;
                for (let i = 0; i < pre; i++) {
                    vx += holdDir * MOVE * 8 * DT;
                    if (holdDir === 0) vx *= Math.exp(-14 * DT);
                    vx = Math.max(-MAX_X, Math.min(MAX_X, vx));
                    x += vx * DT;
                    if (x + PLAYER_W > fromPlat.x + fromPlat.w) x = fromPlat.x + fromPlat.w - PLAYER_W;
                    if (x < fromPlat.x) x = fromPlat.x;
                }
                vy = JUMP;
                while (t < 2.5) {
                    t += DT;
                    if (!used && t >= 0.2) { vy = JUMP_AIR; used = true; }
                    vx += holdDir * MOVE * 8 * DT;
                    if (holdDir === 0) vx *= Math.exp(-14 * DT);
                    vx = Math.max(-MAX_X, Math.min(MAX_X, vx));
                    vy += GRAV * DT;
                    vy = Math.min(vy, 880);
                    x += vx * DT;
                    y += vy * DT;
                    if (vy > 0 && y + PLAYER_H >= toPlat.y && y + PLAYER_H <= toPlat.y + toPlat.h + 6 &&
                        x + PLAYER_W > toPlat.x + 2 && x + 2 < toPlat.x + toPlat.w) return true;
                    if (y + PLAYER_H > fromPlat.y + 450) break;
                }
            }
        }
    }
    return false;
}

function canReachGoal(fromPlat, goal) {
    for (const holdDir of [0, 1]) {
        for (let sx = fromPlat.x; sx <= fromPlat.x + fromPlat.w - PLAYER_W; sx += 4) {
            for (let pre = 0; pre <= 90; pre += 6) {
                let x = sx, y = fromPlat.y - PLAYER_H, vx = 0, vy = 0, t = 0, used = false;
                for (let i = 0; i < pre; i++) {
                    vx += holdDir * MOVE * 8 * DT;
                    if (holdDir === 0) vx *= Math.exp(-14 * DT);
                    vx = Math.max(-MAX_X, Math.min(MAX_X, vx));
                    x += vx * DT;
                    if (x + PLAYER_W > fromPlat.x + fromPlat.w) x = fromPlat.x + fromPlat.w - PLAYER_W;
                    if (x < fromPlat.x) x = fromPlat.x;
                }
                vy = JUMP;
                while (t < 2.5) {
                    t += DT;
                    if (!used && t >= 0.2) { vy = JUMP_AIR; used = true; }
                    vx += holdDir * MOVE * 8 * DT;
                    if (holdDir === 0) vx *= Math.exp(-14 * DT);
                    vx = Math.max(-MAX_X, Math.min(MAX_X, vx));
                    vy += GRAV * DT;
                    vy = Math.min(vy, 880);
                    x += vx * DT;
                    y += vy * DT;
                    if (overlap({ x, y, w: PLAYER_W, h: PLAYER_H }, goal)) return true;
                    if (y + PLAYER_H > fromPlat.y + 450) break;
                }
            }
        }
    }
    return false;
}

const LIMITS = {
    easy: { maxDy: 100, minDy: 38, gapX: [10, 28], platW: [56, 76], steps: 5 },
    medium: { maxDy: 108, minDy: 42, gapX: [10, 32], platW: [44, 68], steps: 5 },
    hard: { maxDy: 115, minDy: 44, gapX: [8, 36], platW: [38, 62], steps: 5 },
    hardcore: { maxDy: 122, minDy: 46, gapX: [8, 40], platW: [34, 58], steps: 5 },
    bornForHell: { maxDy: 128, minDy: 48, gapX: [8, 44], platW: [30, 52], steps: 5 },
};

function findNextPlatform(fromPlat, limits, seed, preferredDy) {
    const isSmall = fromPlat.w <= 80;
    const gapMin = isSmall ? 40 : limits.gapX[0];
    const gapMax = isSmall ? 100 : limits.gapX[1];
    const dyCap = limits.maxDy;
    preferredDy = Math.min(preferredDy, dyCap);

    const candidates = [];
    const dyOrder = [];
    for (let d = 0; d <= dyCap - limits.minDy; d += 2) {
        for (const sign of [0, -1, 1]) {
            const dy = Math.round(preferredDy + sign * d);
            if (dy >= limits.minDy && dy <= dyCap && !dyOrder.includes(dy)) dyOrder.push(dy);
        }
    }

    for (let gi = gapMin; gi <= gapMax; gi += isSmall ? 4 : 2) {
        for (const dy of dyOrder) {
            for (let pw = limits.platW[0]; pw <= limits.platW[1]; pw += 4) {
                const target = {
                    x: Math.round(fromPlat.x + fromPlat.w + gi),
                    y: Math.round(fromPlat.y - dy),
                    w: pw,
                    h: 11,
                };
                if (target.x + target.w > W - 80 || target.y < 55) continue;
                if (canReachPlatform(fromPlat, target)) {
                    const dyPenalty = Math.abs(dy - preferredDy) * 2;
                    const gapPenalty = isSmall ? Math.abs(gi - 60) * 0.5 : Math.abs(gi - 16) * 0.8;
                    const score = pw * 2 - dyPenalty - gapPenalty + ((seed + gi + dy) % 7);
                    candidates.push({ target, score });
                }
            }
        }
    }
    if (!candidates.length) return null;
    candidates.sort((a, b) => b.score - a.score);
    return candidates[seed % Math.min(8, candidates.length)].target;
}

function buildValidatedSector(opts) {
    const {
        name, lavaSpeed, lavaStartOffset, diffKey, seed = 0,
        leftW = 160, rightW = 100, floorH = 40,
        spawn, goalY = 64, goalW = 40, goalH = 36,
        movers = [], pulses = [], extraSolids = [], spikes = null,
    } = opts;
    const limits = LIMITS[diffKey];
    let plat = { x: 0, y: H - floorH, w: leftW, h: floorH };
    const crumble = [];
    const targetTopY = goalY + 48;
    const totalRise = (H - floorH) - targetTopY;
    const perStep = totalRise / limits.steps;

    for (let i = 0; i < limits.steps; i++) {
        const preferredDy = Math.min(
            limits.maxDy,
            Math.max(limits.minDy, Math.round(perStep + ((seed + i) % 3) - 1))
        );
        const next = findNextPlatform(plat, limits, seed + i * 7, preferredDy);
        if (!next) throw new Error(`Krok ${i + 1} selhal: ${name} (y=${plat.y})`);
        crumble.push({ x: next.x, y: next.y, w: next.w, h: 11 });
        plat = next;
    }

    /** Pevné plošiny u cíle — koncová kotva */
    const anchorSolids = [];
    for (let attempt = 0; attempt < 2; attempt++) {
        const topSolidY = Math.max(goalY + 20, plat.y - limits.maxDy + attempt * 12);
        const topSolid = { x: W - rightW - 8, y: topSolidY, w: rightW, h: 12 };
        if (canReachPlatform(plat, topSolid)) {
            anchorSolids.push(topSolid);
            plat = topSolid;
            break;
        }
    }

    const goal = { x: W - goalW - 48, y: goalY, w: goalW, h: goalH };
    if (!canReachGoal(plat, goal)) {
        let ok = false;
        for (let gy = goalY; gy <= plat.y - 20; gy += 4) {
            for (let gx = goal.x; gx >= plat.x + plat.w + 8; gx -= 8) {
                const g = { x: gx, y: gy, w: goalW, h: goalH };
                if (canReachGoal(plat, g)) { goal.x = gx; goal.y = gy; ok = true; break; }
            }
            if (ok) break;
        }
        if (!ok) {
            for (let gy = plat.y - limits.maxDy; gy <= plat.y - 10; gy += 6) {
                for (let gx = plat.x + plat.w + 10; gx <= W - goalW - 20; gx += 16) {
                    const g = { x: gx, y: gy, w: goalW, h: goalH };
                    if (canReachGoal(plat, g)) {
                        goal.x = gx;
                        goal.y = gy;
                        ok = true;
                        break;
                    }
                }
                if (ok) break;
            }
        }
        if (!ok) throw new Error(`Cíl selhal: ${name}`);
    }
    return {
        name, lavaSpeed, lavaStartOffset,
        spawn: spawn ?? { x: 48, y: H - floorH - 15 },
        goal,
        solids: [
            { x: 0, y: H - floorH, w: leftW, h: floorH },
            { x: W - rightW, y: H - floorH, w: rightW, h: floorH },
            ...anchorSolids,
            ...extraSolids,
        ],
        crumble,
        spikes: spikes ?? [{ x: leftW, y: H - 18, w: W - leftW - rightW, h: 12 }],
        movers, pulses,
    };
}

function buildTowerSector(opts) {
    const { name, lavaSpeed, lavaStartOffset, diffKey, seed = 0, floorH = 32, movers = [], pulses = [] } = opts;
    const limits = LIMITS[diffKey];
    const cx = W / 2;
    const baseW = diffKey === 'easy' ? 120 : diffKey === 'medium' ? 100 : 88;
    let plat = { x: cx - baseW / 2, y: H - floorH, w: baseW, h: floorH };
    const crumble = [];
    const targetTopY = 80;
    const perStep = ((H - floorH) - targetTopY) / (limits.steps + 1);

    for (let i = 0; i < limits.steps + 1; i++) {
        const preferredDy = Math.min(limits.maxDy, Math.max(limits.minDy, Math.round(perStep)));
        const next = findNextPlatform(plat, limits, seed + i * 11, preferredDy);
        if (!next) break;
        const nw = Math.max(limits.platW[0], next.w - (i % 2) * 4);
        const nx = Math.round(cx - nw / 2 + (i % 3 === 0 ? -16 : i % 3 === 1 ? 16 : 0));
        const target = { x: nx, y: next.y, w: nw, h: 11 };
        if (canReachPlatform(plat, target)) {
            crumble.push({ x: target.x, y: target.y, w: target.w, h: 11 });
            plat = target;
        } else {
            crumble.push({ x: next.x, y: next.y, w: next.w, h: 11 });
            plat = next;
        }
    }
    const goal = { x: cx - 18, y: 36, w: 38, h: 36 };
    if (!canReachGoal(plat, goal)) { goal.y = Math.max(40, plat.y - limits.maxDy); goal.x = cx - 19; }
    return {
        name, lavaSpeed, lavaStartOffset,
        spawn: { x: cx - 6, y: H - floorH - 15 },
        goal,
        solids: [{ x: plat.x - 40, y: H - floorH, w: baseW + 80, h: floorH }],
        crumble,
        spikes: [
            { x: 0, y: H - 15, w: cx - baseW / 2 - 6, h: 12 },
            { x: cx + baseW / 2 + 6, y: H - 15, w: W - cx - baseW / 2 - 6, h: 12 },
        ],
        movers, pulses,
    };
}

function buildReverseSector(opts) {
    const { name, lavaSpeed, lavaStartOffset, diffKey, seed = 0, rightW = 200, floorH = 30, movers = [], pulses = [] } = opts;
    const limits = LIMITS[diffKey];
    let plat = { x: W - rightW, y: H - floorH, w: rightW, h: floorH };
    const crumble = [];
    for (let i = 0; i < limits.steps; i++) {
        const preferredDy = Math.min(limits.maxDy, Math.max(limits.minDy, Math.round(((H - floorH) - 100) / limits.steps)));
        const next = findNextPlatform(plat, limits, seed + i * 5, preferredDy);
        if (!next) throw new Error(`Reverse selhal: ${name} krok ${i + 1}`);
        const target = { x: Math.max(40, Math.min(next.x, plat.x - next.w - 12)), y: next.y, w: next.w, h: 11 };
        if (canReachPlatform(plat, target)) {
            crumble.push({ x: target.x, y: target.y, w: target.w, h: 11 });
            plat = target;
        } else {
            crumble.push({ x: next.x, y: next.y, w: next.w, h: 11 });
            plat = next;
        }
    }
    const goal = { x: 52, y: 68, w: 38, h: 36 };
    if (!canReachGoal(plat, goal)) { goal.y = Math.max(52, plat.y - limits.maxDy + 10); goal.x = Math.max(40, plat.x - 60); }
    return {
        name, lavaSpeed, lavaStartOffset,
        spawn: { x: W - rightW + 40, y: H - floorH - 15 },
        goal,
        solids: [{ x: W - rightW, y: H - floorH, w: rightW, h: floorH }],
        crumble,
        spikes: [{ x: 0, y: H - 14, w: W - rightW, h: 12 }],
        movers, pulses,
    };
}

const THEMES = {
    easy: { id: 'easy', label: 'Easy', tagline: 'Tréninková zóna — pomalá láva, široké plošiny', theme: { bg: '#0a1218', lavaTop: 'rgba(80,200,220,0.92)', lavaMid: 'rgba(30,120,160,0.88)', lavaBot: '#061018', lavaLine: 'rgba(160,240,255,0.55)', solid: '#1e3a48', solidStroke: '#3a6a7a', crumbleCool: '#6ab8c8', crumbleWarm: '#3a9aaa', crumbleHot: '#2a8898', spike: '#4a8898', mover: '#5ec8e8', moverGlow: '#40a0c0', pulseOn: 'rgba(80,220,255,0.7)', pulseOff: 'rgba(60,180,200,0.12)', pulseStrokeOn: 'rgba(140,240,255,0.85)', pulseStrokeOff: 'rgba(80,160,180,0.3)', goalFill: 'rgba(80,220,200,0.28)', goalStroke: '#5ec8b0', player: '#e8f8ff', playerStroke: '#1a2830', overlayAccent: '#5ec8e8', hudDanger: '#ff6b6b' } },
    medium: { id: 'medium', label: 'Medium', tagline: 'Ohnivá jáma — klasická obtížnost, křehké plošiny', theme: { bg: '#08080d', lavaTop: 'rgba(255,60,30,0.95)', lavaMid: 'rgba(180,20,10,0.9)', lavaBot: '#1a0505', lavaLine: 'rgba(255,200,80,0.5)', solid: '#2a2a38', solidStroke: '#4a4a5c', crumbleCool: '#b4642d', crumbleWarm: '#d05020', crumbleHot: '#ff3d1f', spike: '#c41e1e', mover: '#ff2244', moverGlow: '#ff0000', pulseOn: 'rgba(255,0,60,0.75)', pulseOff: 'rgba(60,255,120,0.15)', pulseStrokeOn: 'rgba(255,100,120,0.9)', pulseStrokeOff: 'rgba(100,200,140,0.35)', goalFill: 'rgba(80,220,160,0.25)', goalStroke: '#3ecf8e', player: '#f4f2ef', playerStroke: '#1a1a22', overlayAccent: '#ff2d2d', hudDanger: '#ff2d2d' } },
    hard: { id: 'hard', label: 'Hard', tagline: 'Temnota — rychlejší láva, úzké cesty, pulzní pasti', theme: { bg: '#0a0812', lavaTop: 'rgba(180,40,255,0.92)', lavaMid: 'rgba(100,10,160,0.88)', lavaBot: '#120818', lavaLine: 'rgba(220,140,255,0.5)', solid: '#2a2038', solidStroke: '#4a3860', crumbleCool: '#6a4088', crumbleWarm: '#8830a8', crumbleHot: '#b020d0', spike: '#9018a0', mover: '#d040ff', moverGlow: '#a020e0', pulseOn: 'rgba(200,60,255,0.78)', pulseOff: 'rgba(80,40,120,0.15)', pulseStrokeOn: 'rgba(240,140,255,0.9)', pulseStrokeOff: 'rgba(120,80,160,0.35)', goalFill: 'rgba(160,100,255,0.22)', goalStroke: '#a060e8', player: '#f0e8ff', playerStroke: '#1a1028', overlayAccent: '#b040ff', hudDanger: '#ff4080' } },
    hardcore: { id: 'hardcore', label: 'Hardcore', tagline: 'Inferno — minimální tolerance, kombinované pasti', theme: { bg: '#0c0606', lavaTop: 'rgba(255,20,0,0.97)', lavaMid: 'rgba(140,0,0,0.94)', lavaBot: '#180202', lavaLine: 'rgba(255,120,40,0.65)', solid: '#301818', solidStroke: '#502828', crumbleCool: '#883020', crumbleWarm: '#b82010', crumbleHot: '#ff1800', spike: '#e01010', mover: '#ff3010', moverGlow: '#ff0000', pulseOn: 'rgba(255,40,0,0.85)', pulseOff: 'rgba(80,20,10,0.18)', pulseStrokeOn: 'rgba(255,100,40,0.95)', pulseStrokeOff: 'rgba(120,40,20,0.4)', goalFill: 'rgba(255,120,40,0.2)', goalStroke: '#ff6020', player: '#fff0e8', playerStroke: '#220808', overlayAccent: '#ff2000', hudDanger: '#ff1800' } },
    bornForHell: { id: 'bornForHell', label: 'Born for Hell', tagline: 'Abaddon — bez slitování, maximální rychlost a chaos', theme: { bg: '#040404', lavaTop: 'rgba(255,255,255,0.95)', lavaMid: 'rgba(200,0,0,0.95)', lavaBot: '#0a0000', lavaLine: 'rgba(255,255,255,0.7)', solid: '#181818', solidStroke: '#303030', crumbleCool: '#404040', crumbleWarm: '#802020', crumbleHot: '#ff0000', spike: '#ffffff', mover: '#ff0000', moverGlow: '#ffffff', pulseOn: 'rgba(255,255,255,0.9)', pulseOff: 'rgba(60,0,0,0.2)', pulseStrokeOn: 'rgba(255,0,0,0.95)', pulseStrokeOff: 'rgba(80,0,0,0.45)', goalFill: 'rgba(255,0,0,0.25)', goalStroke: '#ff0000', player: '#ffffff', playerStroke: '#000000', overlayAccent: '#ffffff', hudDanger: '#ff0000' } },
};

const DIFFICULTIES = {
    easy: { ...THEMES.easy, sectors: [
        buildValidatedSector({ name: 'První krok', lavaSpeed: 14, lavaStartOffset: 130, diffKey: 'easy', seed: 1, leftW: 180 }),
        buildValidatedSector({ name: 'Bez spěchu', lavaSpeed: 16, lavaStartOffset: 120, diffKey: 'easy', seed: 3, leftW: 170 }),
        buildValidatedSector({ name: 'Široké mosty', lavaSpeed: 17, lavaStartOffset: 115, diffKey: 'easy', seed: 5, leftW: 165 }),
        buildValidatedSector({ name: 'Klidná stezka', lavaSpeed: 18, lavaStartOffset: 110, diffKey: 'easy', seed: 7, leftW: 160 }),
        buildValidatedSector({ name: 'První výšiny', lavaSpeed: 19, lavaStartOffset: 105, diffKey: 'easy', seed: 9, leftW: 155, movers: [{ x: 720, y: H - 260, w: 14, h: 14, amp: 22, spd: 0.7, phase: 0, axis: 'x' }] }),
        buildValidatedSector({ name: 'Slunce nad roklinou', lavaSpeed: 20, lavaStartOffset: 100, diffKey: 'easy', seed: 11, leftW: 175 }),
        buildValidatedSector({ name: 'Východ z pekla', lavaSpeed: 22, lavaStartOffset: 95, diffKey: 'easy', seed: 13, leftW: 168 }),
    ]},
    medium: { ...THEMES.medium, sectors: [
        buildValidatedSector({ name: 'Křehký rozjezd', lavaSpeed: 24, lavaStartOffset: 105, diffKey: 'medium', seed: 0, leftW: 160 }),
        buildValidatedSector({ name: 'Kyvadla', lavaSpeed: 27, lavaStartOffset: 90, diffKey: 'medium', seed: 2, leftW: 130, movers: [{ x: 738, y: H - 228, w: 16, h: 16, amp: 34, spd: 0.95, phase: 0, axis: 'x' }] }),
        buildValidatedSector({ name: 'Pulzní mříž', lavaSpeed: 30, lavaStartOffset: 78, diffKey: 'medium', seed: 4, leftW: 142, pulses: [{ x: 260, y: H - 198, w: 360, h: 7, period: 1.35, phase: 0 }] }),
        buildValidatedSector({ name: 'Vertikální řez', lavaSpeed: 32, lavaStartOffset: 72, diffKey: 'medium', seed: 6, leftW: 108, pulses: [{ x: 620, y: H - 285, w: 160, h: 6, period: 1.05, phase: 0 }] }),
        buildValidatedSector({ name: 'Ohnivý žlab', lavaSpeed: 36, lavaStartOffset: 62, diffKey: 'medium', seed: 11, leftW: 125, movers: [{ x: 680, y: H - 335, w: 16, h: 16, amp: 40, spd: 1.1, phase: 0, axis: 'x' }] }),
        buildValidatedSector({ name: 'Jádro', lavaSpeed: 40, lavaStartOffset: 55, diffKey: 'medium', seed: 13, leftW: 118, movers: [{ x: W / 2 - 125, y: H - 320, w: 16, h: 16, amp: 36, spd: 1.0, phase: 0, axis: 'x' }, { x: W / 2 + 108, y: H - 360, w: 16, h: 16, amp: 32, spd: 1.1, phase: 0.4, axis: 'y' }] }),
        buildValidatedSector({ name: 'Poslední brána', lavaSpeed: 42, lavaStartOffset: 50, diffKey: 'medium', seed: 8, leftW: 120, movers: [{ x: 700, y: H - 248, w: 16, h: 16, amp: 38, spd: 1.05, phase: 0.2, axis: 'x' }], pulses: [{ x: 200, y: H - 178, w: 280, h: 6, period: 1.2, phase: 0.3 }] }),
    ]},
    hard: { ...THEMES.hard, sectors: [
        buildValidatedSector({ name: 'Stínový průchod', lavaSpeed: 28, lavaStartOffset: 98, diffKey: 'hard', seed: 0, leftW: 128, pulses: [{ x: 280, y: H - 192, w: 320, h: 6, period: 1.25, phase: 0 }] }),
        buildValidatedSector({ name: 'Dvojité kyvadlo', lavaSpeed: 31, lavaStartOffset: 88, diffKey: 'hard', seed: 2, leftW: 118, movers: [{ x: 620, y: H - 220, w: 16, h: 16, amp: 36, spd: 1.05, phase: 0, axis: 'x' }, { x: 480, y: H - 268, w: 14, h: 14, amp: 30, spd: 1.15, phase: 0.5, axis: 'y' }] }),
        buildValidatedSector({ name: 'Fialová síť', lavaSpeed: 33, lavaStartOffset: 82, diffKey: 'hard', seed: 4, leftW: 112, pulses: [{ x: 180, y: H - 186, w: 260, h: 6, period: 1.1, phase: 0 }, { x: 520, y: H - 268, w: 200, h: 5, period: 0.95, phase: 0.4 }] }),
        buildValidatedSector({ name: 'Propast bez milosti', lavaSpeed: 35, lavaStartOffset: 76, diffKey: 'hard', seed: 11, leftW: 115, movers: [{ x: 660, y: H - 310, w: 16, h: 16, amp: 42, spd: 1.1, phase: 0, axis: 'x' }] }),
        buildValidatedSector({ name: 'Synchronní pulz', lavaSpeed: 37, lavaStartOffset: 70, diffKey: 'hard', seed: 6, leftW: 105, pulses: [{ x: 240, y: H - 180, w: 340, h: 6, period: 1.0, phase: 0 }, { x: 600, y: H - 298, w: 150, h: 5, period: 1.0, phase: 0 }] }),
        buildValidatedSector({ name: 'Úzké jádro', lavaSpeed: 40, lavaStartOffset: 64, diffKey: 'hard', seed: 13, leftW: 102, movers: [{ x: W / 2 - 118, y: H - 300, w: 16, h: 16, amp: 34, spd: 1.15, phase: 0, axis: 'x' }, { x: W / 2 + 100, y: H - 340, w: 16, h: 16, amp: 30, spd: 1.2, phase: 0.3, axis: 'y' }] }),
        buildValidatedSector({ name: 'Temnota končí', lavaSpeed: 44, lavaStartOffset: 58, diffKey: 'hard', seed: 9, leftW: 100, movers: [{ x: 640, y: H - 240, w: 16, h: 16, amp: 40, spd: 1.2, phase: 0.1, axis: 'x' }], pulses: [{ x: 160, y: H - 172, w: 240, h: 6, period: 0.95, phase: 0 }] }),
    ]},
    hardcore: { ...THEMES.hardcore, sectors: [
        buildValidatedSector({ name: 'Spalující start', lavaSpeed: 34, lavaStartOffset: 92, diffKey: 'hardcore', seed: 0, leftW: 115, movers: [{ x: 700, y: H - 260, w: 16, h: 16, amp: 38, spd: 1.15, phase: 0, axis: 'x' }] }),
        buildValidatedSector({ name: 'Krvavé kyvadlo', lavaSpeed: 37, lavaStartOffset: 84, diffKey: 'hardcore', seed: 2, leftW: 108, movers: [{ x: 580, y: H - 210, w: 16, h: 16, amp: 40, spd: 1.2, phase: 0, axis: 'x' }, { x: 350, y: H - 250, w: 14, h: 14, amp: 34, spd: 1.25, phase: 0.45, axis: 'y' }] }),
        buildValidatedSector({ name: 'Žhavá mříž', lavaSpeed: 40, lavaStartOffset: 76, diffKey: 'hardcore', seed: 4, leftW: 102, pulses: [{ x: 170, y: H - 178, w: 280, h: 6, period: 1.0, phase: 0 }, { x: 460, y: H - 260, w: 220, h: 5, period: 0.9, phase: 0.25 }] }),
        buildValidatedSector({ name: 'Vnitřní oheň', lavaSpeed: 43, lavaStartOffset: 68, diffKey: 'hardcore', seed: 11, leftW: 100, movers: [{ x: W / 2 - 110, y: H - 290, w: 16, h: 16, amp: 36, spd: 1.25, phase: 0, axis: 'x' }], pulses: [{ x: W / 2 - 80, y: H - 310, w: 160, h: 5, period: 0.88, phase: 0 }] }),
        buildValidatedSector({ name: 'Pekelný žlab', lavaSpeed: 46, lavaStartOffset: 62, diffKey: 'hardcore', seed: 13, leftW: 96, movers: [{ x: 640, y: H - 300, w: 16, h: 16, amp: 44, spd: 1.25, phase: 0, axis: 'x' }] }),
        buildValidatedSector({ name: 'Synchronní peklo', lavaSpeed: 49, lavaStartOffset: 56, diffKey: 'hardcore', seed: 6, leftW: 98, movers: [{ x: 620, y: H - 228, w: 16, h: 16, amp: 42, spd: 1.3, phase: 0, axis: 'x' }], pulses: [{ x: 150, y: H - 166, w: 220, h: 6, period: 0.85, phase: 0 }] }),
        buildValidatedSector({ name: 'Brána inferna', lavaSpeed: 52, lavaStartOffset: 50, diffKey: 'hardcore', seed: 9, leftW: 92, movers: [{ x: 600, y: H - 220, w: 16, h: 16, amp: 44, spd: 1.35, phase: 0.1, axis: 'x' }], pulses: [{ x: 130, y: H - 160, w: 200, h: 6, period: 0.82, phase: 0 }] }),
    ]},
    bornForHell: { ...THEMES.bornForHell, sectors: [
        buildValidatedSector({ name: 'Nulová tolerance', lavaSpeed: 42, lavaStartOffset: 88, diffKey: 'bornForHell', seed: 0, leftW: 105, movers: [{ x: 680, y: H - 280, w: 16, h: 16, amp: 42, spd: 1.35, phase: 0, axis: 'x' }] }),
        buildValidatedSector({ name: 'Bílý oheň', lavaSpeed: 46, lavaStartOffset: 80, diffKey: 'bornForHell', seed: 2, leftW: 100, movers: [{ x: 560, y: H - 200, w: 16, h: 16, amp: 44, spd: 1.4, phase: 0, axis: 'x' }], pulses: [{ x: 160, y: H - 158, w: 220, h: 6, period: 0.82, phase: 0 }] }),
        buildValidatedSector({ name: 'Absolutní propast', lavaSpeed: 50, lavaStartOffset: 72, diffKey: 'bornForHell', seed: 5, leftW: 98, movers: [{ x: W / 2 - 100, y: H - 280, w: 16, h: 16, amp: 38, spd: 1.45, phase: 0, axis: 'x' }], pulses: [{ x: W / 2 - 70, y: H - 300, w: 140, h: 5, period: 0.78, phase: 0 }] }),
        buildValidatedSector({ name: 'Krvavý labyrint', lavaSpeed: 54, lavaStartOffset: 64, diffKey: 'bornForHell', seed: 13, leftW: 94, movers: [{ x: 620, y: H - 280, w: 16, h: 16, amp: 46, spd: 1.45, phase: 0, axis: 'x' }] }),
        buildValidatedSector({ name: 'Synchronní smrt', lavaSpeed: 58, lavaStartOffset: 58, diffKey: 'bornForHell', seed: 6, leftW: 92, movers: [{ x: 590, y: H - 216, w: 16, h: 16, amp: 46, spd: 1.5, phase: 0, axis: 'x' }], pulses: [{ x: 130, y: H - 152, w: 190, h: 6, period: 0.75, phase: 0 }] }),
        buildValidatedSector({ name: 'Poslední dech', lavaSpeed: 62, lavaStartOffset: 52, diffKey: 'bornForHell', seed: 15, leftW: 90, movers: [{ x: W / 2 - 92, y: H - 270, w: 16, h: 16, amp: 40, spd: 1.55, phase: 0, axis: 'x' }] }),
        buildValidatedSector({ name: 'Abaddon', lavaSpeed: 68, lavaStartOffset: 46, diffKey: 'bornForHell', seed: 11, leftW: 88, movers: [{ x: 560, y: H - 200, w: 16, h: 16, amp: 48, spd: 1.6, phase: 0.05, axis: 'x' }], pulses: [{ x: 120, y: H - 146, w: 170, h: 6, period: 0.7, phase: 0 }] }),
    ]},
};

function validateAll() {
    for (const pack of Object.values(DIFFICULTIES)) {
        for (const sector of pack.sectors) {
            let plat = sector.solids[0];
            for (const step of sector.crumble) {
                if (!canReachPlatform(plat, step)) throw new Error(`FAIL ${sector.name} crumble`);
                plat = step;
            }
            if (!canReachGoal(plat, sector.goal)) throw new Error(`FAIL ${sector.name} goal`);
        }
    }
}

validateAll();
console.error('Generated and validated 35 sectors');

const out = `(function (global) {
    'use strict';
    const W = 880;
    const H = 520;
    const DIFFICULTIES = ${JSON.stringify(DIFFICULTIES, null, 4)};
    const DIFFICULTY_ORDER = ['easy', 'medium', 'hard', 'hardcore', 'bornForHell'];
    global.HC_LEVELS = { W, H, DIFFICULTIES, DIFFICULTY_ORDER };
})(typeof window !== 'undefined' ? window : globalThis);
`;

fs.writeFileSync(path.join(__dirname, 'levels.js'), out);
console.error('Written levels.js');
