(function (global) {
    'use strict';

    const SRC_W = 880;
    const SRC_H = 520;

    function drawThumbnail(canvas, sector, theme) {
        if (!canvas || !sector || !theme) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        const sx = w / SRC_W;
        const sy = h / SRC_H;

        ctx.setTransform(sx, 0, 0, sy, 0, 0);
        ctx.clearRect(0, 0, SRC_W, SRC_H);

        ctx.fillStyle = theme.bg;
        ctx.fillRect(0, 0, SRC_W, SRC_H);

        const lavaY = SRC_H - (sector.lavaStartOffset || 100);
        const grad = ctx.createLinearGradient(0, lavaY, 0, SRC_H);
        grad.addColorStop(0, theme.lavaTop);
        grad.addColorStop(0.35, theme.lavaMid);
        grad.addColorStop(1, theme.lavaBot);
        ctx.fillStyle = grad;
        ctx.fillRect(0, lavaY, SRC_W, SRC_H - lavaY);

        ctx.strokeStyle = theme.lavaLine;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, lavaY);
        ctx.lineTo(SRC_W, lavaY);
        ctx.stroke();

        for (const r of sector.solids || []) {
            ctx.fillStyle = theme.solid;
            ctx.strokeStyle = theme.solidStroke;
            ctx.lineWidth = 1;
            ctx.fillRect(r.x, r.y, r.w, r.h);
            ctx.strokeRect(r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1);
        }

        for (const c of sector.crumble || []) {
            ctx.fillStyle = theme.crumbleCool;
            ctx.fillRect(c.x, c.y, c.w, c.h);
        }

        for (const sp of sector.spikes || []) {
            if (global.HCSpikeDraw) {
                HCSpikeDraw.drawSpikeBlock(ctx, sp.x, sp.y, sp.w, sp.h, theme.spike);
            } else {
                ctx.fillStyle = theme.spike;
                ctx.fillRect(sp.x, sp.y, sp.w, sp.h);
            }
        }

        for (const m of sector.movers || []) {
            const ang = (m.phase || 0) * Math.PI * 2;
            const d = Math.sin(ang) * (m.amp || 0);
            const mx = m.axis === 'y' ? m.x : m.x + d;
            const my = m.axis === 'y' ? m.y + d : m.y;
            ctx.fillStyle = theme.mover;
            ctx.fillRect(mx, my, m.w, m.h);
        }

        for (const p of sector.pulses || []) {
            ctx.fillStyle = theme.pulseOff;
            ctx.strokeStyle = theme.pulseStrokeOff;
            ctx.fillRect(p.x, p.y, p.w, p.h);
            ctx.strokeRect(p.x + 0.5, p.y + 0.5, p.w - 1, p.h - 1);
        }

        if (sector.goal) {
            const g = sector.goal;
            ctx.fillStyle = theme.goalFill;
            ctx.strokeStyle = theme.goalStroke;
            ctx.lineWidth = 2;
            ctx.fillRect(g.x, g.y, g.w, g.h);
            ctx.strokeRect(g.x + 0.5, g.y + 0.5, g.w - 1, g.h - 1);
        }

        if (sector.spawn) {
            ctx.fillStyle = theme.player;
            ctx.fillRect(sector.spawn.x, sector.spawn.y, 11, 15);
        }

        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    global.HCSectorPreview = {
        drawThumbnail,
        SRC_W,
        SRC_H,
    };
})(typeof window !== 'undefined' ? window : globalThis);
