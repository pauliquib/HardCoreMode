(function (global) {
    'use strict';

    /** Spiky blok — jeden souvislý obrys se zuby po celém obvodu včetně rohů. */
    function drawSpikeBlock(ctx, x, y, w, h, color) {
        const step = 12;
        const tip = 9;
        const cr = tip * 0.72;

        ctx.fillStyle = color;

        if (w < 6 || h < 6) {
            ctx.fillRect(x, y, w, h);
            return;
        }

        ctx.beginPath();
        ctx.moveTo(x, y);

        for (let t = 0; t < w; t += step) {
            const a = x + t;
            const b = Math.min(x + t + step, x + w);
            const m = (a + b) / 2;
            ctx.lineTo(a, y);
            ctx.lineTo(m, y - tip);
            ctx.lineTo(b, y);
        }

        ctx.lineTo(x + w + cr, y - cr);
        ctx.lineTo(x + w, y);

        for (let t = 0; t < h; t += step) {
            const a = y + t;
            const b = Math.min(y + t + step, y + h);
            const m = (a + b) / 2;
            ctx.lineTo(x + w, a);
            ctx.lineTo(x + w + tip, m);
            ctx.lineTo(x + w, b);
        }

        ctx.lineTo(x + w + cr, y + h + cr);
        ctx.lineTo(x + w, y + h);

        for (let t = 0; t < w; t += step) {
            const a = x + w - t;
            const b = Math.max(x + w - t - step, x);
            const m = (a + b) / 2;
            ctx.lineTo(a, y + h);
            ctx.lineTo(m, y + h + tip);
            ctx.lineTo(b, y + h);
        }

        ctx.lineTo(x - cr, y + h + cr);
        ctx.lineTo(x, y + h);

        for (let t = 0; t < h; t += step) {
            const a = y + h - t;
            const b = Math.max(y + h - t - step, y);
            const m = (a + b) / 2;
            ctx.lineTo(x, a);
            ctx.lineTo(x - tip, m);
            ctx.lineTo(x, b);
        }

        ctx.lineTo(x - cr, y - cr);
        ctx.closePath();
        ctx.fill();
    }

    global.HCSpikeDraw = { drawSpikeBlock };
})(typeof window !== 'undefined' ? window : globalThis);
