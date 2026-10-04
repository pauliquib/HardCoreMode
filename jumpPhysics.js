(function (global) {
    'use strict';

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
        for (const holdDir of [-1, 0, 1]) {
            for (let sx = fromPlat.x; sx <= fromPlat.x + fromPlat.w - PLAYER_W; sx += 2) {
                for (let pre = 0; pre <= 120; pre += 3) {
                    let x = sx;
                    let y = fromPlat.y - PLAYER_H;
                    let vx = 0;
                    let vy = 0;
                    let t = 0;
                    let usedDouble = false;

                    for (let i = 0; i < pre; i++) {
                        vx += holdDir * MOVE * 8 * DT;
                        if (holdDir === 0) vx *= Math.exp(-14 * DT);
                        vx = Math.max(-MAX_X, Math.min(MAX_X, vx));
                        x += vx * DT;
                        if (x + PLAYER_W > fromPlat.x + fromPlat.w) {
                            x = fromPlat.x + fromPlat.w - PLAYER_W;
                        }
                        if (x < fromPlat.x) x = fromPlat.x;
                    }

                    vy = JUMP;

                    while (t < 2.5) {
                        t += DT;
                        if (!usedDouble && t >= 0.2) {
                            vy = JUMP_AIR;
                            usedDouble = true;
                        }
                        vx += holdDir * MOVE * 8 * DT;
                        if (holdDir === 0) vx *= Math.exp(-14 * DT);
                        vx = Math.max(-MAX_X, Math.min(MAX_X, vx));
                        vy += GRAV * DT;
                        vy = Math.min(vy, 880);
                        x += vx * DT;
                        y += vy * DT;

                        if (
                            vy > 0 &&
                            y + PLAYER_H >= toPlat.y &&
                            y + PLAYER_H <= toPlat.y + toPlat.h + 6 &&
                            x + PLAYER_W > toPlat.x + 2 &&
                            x + 2 < toPlat.x + toPlat.w
                        ) {
                            return true;
                        }
                        if (y + PLAYER_H > fromPlat.y + 450) break;
                    }
                }
            }
        }
        return false;
    }

    function canReachGoal(fromPlat, goal) {
        for (const holdDir of [-1, 0, 1]) {
            for (let sx = fromPlat.x; sx <= fromPlat.x + fromPlat.w - PLAYER_W; sx += 2) {
                for (let pre = 0; pre <= 120; pre += 3) {
                    let x = sx;
                    let y = fromPlat.y - PLAYER_H;
                    let vx = 0;
                    let vy = 0;
                    let t = 0;
                    let usedDouble = false;

                    for (let i = 0; i < pre; i++) {
                        vx += holdDir * MOVE * 8 * DT;
                        if (holdDir === 0) vx *= Math.exp(-14 * DT);
                        vx = Math.max(-MAX_X, Math.min(MAX_X, vx));
                        x += vx * DT;
                        if (x + PLAYER_W > fromPlat.x + fromPlat.w) {
                            x = fromPlat.x + fromPlat.w - PLAYER_W;
                        }
                        if (x < fromPlat.x) x = fromPlat.x;
                    }

                    vy = JUMP;

                    while (t < 2.5) {
                        t += DT;
                        if (!usedDouble && t >= 0.2) {
                            vy = JUMP_AIR;
                            usedDouble = true;
                        }
                        vx += holdDir * MOVE * 8 * DT;
                        if (holdDir === 0) vx *= Math.exp(-14 * DT);
                        vx = Math.max(-MAX_X, Math.min(MAX_X, vx));
                        vy += GRAV * DT;
                        vy = Math.min(vy, 880);
                        x += vx * DT;
                        y += vy * DT;

                        if (overlap({ x, y, w: PLAYER_W, h: PLAYER_H }, goal)) {
                            return true;
                        }
                        if (y + PLAYER_H > fromPlat.y + 450) break;
                    }
                }
            }
        }
        return false;
    }

    function validateSector(sector) {
        let plat = sector.solids[0];
        const steps = [...sector.crumble].sort((a, b) => a.x - b.x);

        for (let i = 0; i < steps.length; i++) {
            const target = steps[i];
            if (!canReachPlatform(plat, target)) {
                return {
                    ok: false,
                    step: i + 1,
                    reason: `Sektor „${sector.name}“: krok ${i + 1} není dosažitelný`,
                };
            }
            plat = target;
        }

        if (!canReachGoal(plat, sector.goal)) {
            return { ok: false, step: steps.length + 1, reason: `Sektor „${sector.name}“: cíl není dosažitelný` };
        }

        return { ok: true };
    }

    function validateSectorDetailed(sector) {
        const chain = [];
        let plat = sector.solids[0];
        if (!plat) {
            return { ok: false, chain, reason: 'Chybí startovní pevná plošina (solids[0])' };
        }

        const steps = [...(sector.crumble || [])].sort((a, b) => a.x - b.x);
        for (let i = 0; i < steps.length; i++) {
            const target = steps[i];
            const ok = canReachPlatform(plat, target);
            chain.push({
                step: i + 1,
                type: 'crumble',
                label: `Křehká plošina ${i + 1}`,
                from: { x: plat.x, y: plat.y, w: plat.w, h: plat.h },
                to: { x: target.x, y: target.y, w: target.w, h: target.h },
                ok,
                gapX: target.x - (plat.x + plat.w),
                dy: plat.y - target.y,
            });
            if (!ok) {
                return {
                    ok: false,
                    chain,
                    reason: `Krok ${i + 1} není dosažitelný (mezera ${target.x - (plat.x + plat.w)} px, výška ${plat.y - target.y} px)`,
                };
            }
            plat = target;
        }

        const goalOk = canReachGoal(plat, sector.goal);
        chain.push({
            step: steps.length + 1,
            type: 'goal',
            label: 'Cíl',
            from: { x: plat.x, y: plat.y, w: plat.w, h: plat.h },
            to: { ...sector.goal },
            ok: goalOk,
            gapX: sector.goal.x - (plat.x + plat.w),
            dy: plat.y - sector.goal.y,
        });

        if (!goalOk) {
            return { ok: false, chain, reason: 'Cíl není dosažitelný z poslední plošiny' };
        }

        return { ok: true, chain, reason: 'Všechny skoky jsou možné (včetně dvojskoku)' };
    }

    global.HC_JUMP = {
        canReachPlatform,
        canReachGoal,
        validateSector,
        validateSectorDetailed,
    };
})(typeof window !== 'undefined' ? window : globalThis);
