(function (global) {
    'use strict';

    /** @type {Record<string, {bpm:number, masterVol:number, bassNotes:number[], leadNotes:number[], style:'ambient'|'drive'|'dark'|'inferno'|'hell'}>} */
    const PRESETS = {
        easy: {
            bpm: 88,
            masterVol: 0.16,
            bassNotes: [65.41, 73.42, 82.41, 73.42, 65.41, 55, 65.41, 73.42],
            leadNotes: [261.63, 293.66, 329.63, 293.66, 261.63, 246.94, 261.63, 293.66],
            style: 'ambient',
        },
        medium: {
            bpm: 112,
            masterVol: 0.2,
            bassNotes: [55, 55, 73.42, 55, 82.41, 55, 73.42, 65.41],
            leadNotes: [220, 220, 277.18, 220, 329.63, 220, 277.18, 246.94],
            style: 'drive',
        },
        hard: {
            bpm: 128,
            masterVol: 0.22,
            bassNotes: [41.2, 49, 55, 49, 41.2, 36.71, 41.2, 49],
            leadNotes: [196, 233.08, 261.63, 233.08, 196, 174.61, 196, 233.08],
            style: 'dark',
        },
        hardcore: {
            bpm: 148,
            masterVol: 0.24,
            bassNotes: [36.71, 36.71, 49, 36.71, 55, 36.71, 49, 43.65],
            leadNotes: [164.81, 164.81, 196, 164.81, 220, 164.81, 196, 174.61],
            style: 'inferno',
        },
        bornForHell: {
            bpm: 168,
            masterVol: 0.26,
            bassNotes: [32.7, 36.71, 32.7, 43.65, 32.7, 36.71, 49, 36.71],
            leadNotes: [138.59, 146.83, 138.59, 155.56, 138.59, 146.83, 164.81, 146.83],
            style: 'hell',
        },
    };

    const HCMusic = {
        ctx: null,
        master: null,
        running: false,
        muted: (() => {
            try { return localStorage.getItem('hc_music_muted') === '1'; }
            catch (_) { return false; }
        })(),
        difficultyId: 'medium',
        nextBeat: 0,
        stepIndex: 0,
        _timer: null,
        _customAudio: null,
        _customBlobUrl: null,
        _customConfig: null,
        _usingCustom: false,

        init() {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return;
            this.ctx = new AC();
            this.master = this.ctx.createGain();
            this.master.gain.value = 0;
            this.master.connect(this.ctx.destination);
        },

        _targetVol() {
            if (this.muted || !this.running) return 0;
            if (this._usingCustom && this._customAudio) {
                return this._customConfig?.volume ?? 0.45;
            }
            return this._preset().masterVol;
        },

        _stopCustom() {
            if (this._customAudio) {
                this._customAudio.pause();
                this._customAudio.src = '';
                this._customAudio = null;
            }
            if (this._customBlobUrl) {
                URL.revokeObjectURL(this._customBlobUrl);
                this._customBlobUrl = null;
            }
            this._customConfig = null;
            this._usingCustom = false;
        },

        async _startCustom(musicConfig) {
            if (!musicConfig?.dataBase64) return false;
            this._stopCustom();
            this._stopProcedural();
            try {
                const binary = atob(musicConfig.dataBase64);
                const bytes = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
                const blob = new Blob([bytes], { type: musicConfig.mime || 'audio/mpeg' });
                this._customBlobUrl = URL.createObjectURL(blob);
                this._customAudio = new Audio(this._customBlobUrl);
                this._customAudio.loop = true;
                this._customAudio.volume = this.muted ? 0 : (musicConfig.volume ?? 0.45);
                this._customConfig = musicConfig;
                this._usingCustom = true;
                this.running = true;
                await this._customAudio.play();
                return true;
            } catch (_) {
                this._stopCustom();
                return false;
            }
        },

        _stopProcedural() {
            this.running = false;
            if (this._timer) {
                clearTimeout(this._timer);
                this._timer = null;
            }
            this._applyGain(0.06);
        },

        _applyGain(ramp = 0.06) {
            if (!this.master || !this.ctx) return;
            this.master.gain.setTargetAtTime(this._targetVol(), this.ctx.currentTime, ramp);
        },

        setMuted(on) {
            this.muted = !!on;
            try {
                localStorage.setItem('hc_music_muted', this.muted ? '1' : '0');
            } catch (_) { /* ignore */ }
            if (this._usingCustom && this._customAudio) {
                this._customAudio.volume = this.muted ? 0 : (this._customConfig?.volume ?? 0.45);
            }
            this._applyGain(0.05);
            return this.muted;
        },

        toggleMute() {
            return this.setMuted(!this.muted);
        },

        async resume() {
            if (!this.ctx) this.init();
            if (this.ctx && this.ctx.state === 'suspended') {
                await this.ctx.resume();
            }
        },

        _preset() {
            return PRESETS[this.difficultyId] || PRESETS.medium;
        },

        _kick(when, vol) {
            const c = this.ctx;
            const g = c.createGain();
            const o = c.createOscillator();
            o.type = 'sine';
            o.frequency.setValueAtTime(72, when);
            o.frequency.exponentialRampToValueAtTime(36, when + 0.07);
            g.gain.setValueAtTime(vol, when);
            g.gain.exponentialRampToValueAtTime(0.001, when + 0.2);
            o.connect(g);
            g.connect(this.master);
            o.start(when);
            o.stop(when + 0.22);
        },

        _hat(when, vol) {
            const c = this.ctx;
            const dur = 0.035;
            const buf = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate);
            const data = buf.getChannelData(0);
            for (let i = 0; i < data.length; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (data.length * 0.22));
            }
            const src = c.createBufferSource();
            src.buffer = buf;
            const bp = c.createBiquadFilter();
            bp.type = 'bandpass';
            bp.frequency.value = 8000;
            bp.Q.value = 0.6;
            const g = c.createGain();
            g.gain.setValueAtTime(vol, when);
            g.gain.exponentialRampToValueAtTime(0.001, when + dur);
            src.connect(bp);
            bp.connect(g);
            g.connect(this.master);
            src.start(when);
            src.stop(when + dur + 0.01);
        },

        _bass(when, freq, style) {
            const c = this.ctx;
            const o = c.createOscillator();
            o.type = style === 'ambient' ? 'sine' : style === 'hell' ? 'square' : 'triangle';
            o.frequency.setValueAtTime(freq, when);
            const g = c.createGain();
            const peak = style === 'ambient' ? 0.18 : style === 'hell' ? 0.32 : 0.26;
            g.gain.setValueAtTime(0, when);
            g.gain.linearRampToValueAtTime(peak, when + 0.015);
            g.gain.exponentialRampToValueAtTime(0.001, when + (style === 'hell' ? 0.12 : 0.22));
            o.connect(g);
            g.connect(this.master);
            o.start(when);
            o.stop(when + 0.25);
        },

        _lead(when, freq, style) {
            const c = this.ctx;
            const o = c.createOscillator();
            o.type = style === 'ambient' ? 'sine' : style === 'hell' ? 'sawtooth' : 'square';
            o.frequency.setValueAtTime(freq, when);
            const g = c.createGain();
            const peak = style === 'ambient' ? 0.06 : style === 'hell' ? 0.14 : 0.1;
            g.gain.setValueAtTime(0, when);
            g.gain.linearRampToValueAtTime(peak, when + 0.01);
            g.gain.exponentialRampToValueAtTime(0.001, when + 0.15);
            o.connect(g);
            g.connect(this.master);
            o.start(when);
            o.stop(when + 0.18);
        },

        _schedule() {
            if (!this.ctx || !this.running) return;
            const p = this._preset();
            const beat = 60 / p.bpm;
            const look = 0.25;

            while (this.nextBeat < this.ctx.currentTime + look) {
                const when = this.nextBeat;
                const step = this.stepIndex % 8;
                const style = p.style;

                if (style === 'ambient') {
                    if (step % 2 === 0) this._kick(when, 0.35);
                    if (step % 4 === 2) this._hat(when, 0.12);
                    this._bass(when, p.bassNotes[step], style);
                    if (step % 2 === 1) this._lead(when, p.leadNotes[step], style);
                } else if (style === 'drive') {
                    if (step % 2 === 0) this._kick(when, 0.55);
                    this._hat(when, step % 4 === 2 ? 0.28 : 0.18);
                    this._bass(when, p.bassNotes[step], style);
                    if (step % 2 === 0) this._lead(when, p.leadNotes[step], style);
                } else if (style === 'dark') {
                    if (step % 2 === 0) this._kick(when, 0.6);
                    this._hat(when, 0.22);
                    this._bass(when, p.bassNotes[step], style);
                    if (step % 2 === 1) this._lead(when, p.leadNotes[step], style);
                } else if (style === 'inferno') {
                    this._kick(when, step % 2 === 0 ? 0.75 : 0.45);
                    this._hat(when, 0.32);
                    this._bass(when, p.bassNotes[step], style);
                    this._lead(when, p.leadNotes[step], style);
                } else {
                    this._kick(when, 0.85);
                    this._hat(when, 0.38);
                    this._bass(when, p.bassNotes[step], style);
                    this._lead(when, p.leadNotes[step], style);
                    if (step % 4 === 0) this._lead(when, p.leadNotes[step] * 1.5, style);
                }

                this.nextBeat += beat / 2;
                this.stepIndex++;
            }

            this._timer = setTimeout(() => this._schedule(), 80);
        },

        setDifficulty(id) {
            this.difficultyId = id in PRESETS ? id : 'medium';
            this._applyGain(0.08);
        },

        async start(id, musicConfig) {
            await this.resume();
            if (musicConfig?.dataBase64) {
                const ok = await this._startCustom(musicConfig);
                if (ok) return;
            }
            this._stopCustom();
            if (!this.ctx) return;
            this.setDifficulty(id || this.difficultyId);
            if (this.running) return;
            this.running = true;
            this.nextBeat = this.ctx.currentTime + 0.05;
            this.stepIndex = 0;
            this._applyGain(0.05);
            this._schedule();
        },

        stop() {
            this._stopCustom();
            this._stopProcedural();
        },

        preview(id, musicConfig) {
            this.stop();
            this.start(id, musicConfig);
        },
    };

    global.HCMusic = HCMusic;
})(typeof window !== 'undefined' ? window : globalThis);
