(function () {
    'use strict';

    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    const overlay = document.getElementById('overlay');
    const ovTitle = document.getElementById('ovTitle');
    const ovText = document.getElementById('ovText');
    const startBtn = document.getElementById('startBtn');
    const sectorEl = document.getElementById('sectorEl');
    const sectorTotalEl = document.getElementById('sectorTotalEl');
    const deathsEl = document.getElementById('deathsEl');
    const timeEl = document.getElementById('timeEl');
    const cpEl = document.getElementById('cpEl');
    const diffEl = document.getElementById('diffEl');
    const menuPanel = document.getElementById('menuPanel');
    const sectorPanel = document.getElementById('sectorPanel');
    const sectorGrid = document.getElementById('sectorGrid');
    const sectorEmptyHint = document.getElementById('sectorEmptyHint');
    const sectorPanelTitle = document.getElementById('sectorPanelTitle');
    const sectorPanelSub = document.getElementById('sectorPanelSub');
    const sectorBackBtn = document.getElementById('sectorBackBtn');
    const sectorCampaignBtn = document.getElementById('sectorCampaignBtn');
    const gamePanel = document.getElementById('gamePanel');
    const diffButtons = document.querySelectorAll('.diff-btn[data-difficulty]');
    const keysHint = document.getElementById('keysHint');

    const { DIFFICULTIES, DIFFICULTY_ORDER } = window.HC_LEVELS;
    const PUBLISH = window.HC_PUBLISH_CONFIG || null;
    const PRIMARY_DIFF = PUBLISH?.modes?.[0] || 'easy';
    const CUSTOM_ID = window.HCUserPack ? HCUserPack.CUSTOM_ID : 'custom';

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

    let state = 'menu';
    let difficultyId = PRIMARY_DIFF;
    /** @type {object|null} */
    let customPack = null;
    /** Test z uživatelského editoru (custom=1 v URL) */
    let editorTestCustom = false;
    let sectorBlueprints = (DIFFICULTIES[PRIMARY_DIFF] || DIFFICULTIES.medium).sectors;
    let theme = (DIFFICULTIES[PRIMARY_DIFF] || DIFFICULTIES.medium).theme;
    let sectorIndex = 0;
    let runDeaths = 0;
    let runStart = 0;
    let sectorRunStart = 0;
    let sectorDeathsAtStart = 0;
    let sector = null;
    let lavaY = H + 80;
    let t = 0;
    let keys = Object.create(null);
    let activeEffects = HCPickupEffects.createEffectState();

    const player = {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        onGround: false,
        coyote: 0,
        buffer: 0,
        airJumpsLeft: 1,
        jumpHeldPrev: false,
    };

    function currentPack() {
        if (difficultyId === CUSTOM_ID && customPack) return customPack;
        return DIFFICULTIES[difficultyId] || DIFFICULTIES[PRIMARY_DIFF] || DIFFICULTIES.medium;
    }

    function musicPresetId() {
        if (difficultyId === CUSTOM_ID) return 'easy';
        return difficultyId;
    }

    function playModeMusic(mode = 'preview') {
        if (!window.HCMusic) return;
        const pack = currentPack();
        const music = pack.music;
        const preset = musicPresetId();
        const run = mode === 'start' ? HCMusic.start.bind(HCMusic) : HCMusic.preview.bind(HCMusic);
        if (music?.dataBase64) run(preset, music);
        else run(preset);
    }

    function applyCustomPack(packData) {
        customPack = HCUserPack.toGameDifficulty(packData);
        difficultyId = CUSTOM_ID;
        sectorBlueprints = customPack.sectors;
        theme = customPack.theme;
        HCPickupEffects.applyThemeDefaults(theme);
        applyThemeToUI();
    }

    async function loadCustomPackFile(file) {
        const packData = await HCPackGuard.loadUserPackFile(file);
        applyCustomPack(packData);
        updateSectorBackButton();
        showSectorPanel();
        playModeMusic('preview');
    }

    function tryLoadTestPackFromSession() {
        try {
            const raw = sessionStorage.getItem('hc_test_pack');
            if (!raw) return false;
            const parsed = HCPackGuard.parseJsonSafe(raw, HCPackGuard.LIMITS.maxJsonBytes);
            applyCustomPack(HCPackGuard.validateUserPack(parsed));
            return true;
        } catch {
            return false;
        }
    }

    function applyThemeToUI() {
        const root = document.documentElement;
        root.style.setProperty('--danger', theme.overlayAccent);
        root.style.setProperty('--accent', theme.goalStroke);
        if (diffEl) diffEl.textContent = currentPack().label;
        if (sectorTotalEl) sectorTotalEl.textContent = String(sectorBlueprints.length);
        document.body.dataset.difficulty = difficultyId;
        const menuTitle = document.querySelector('.menu-title');
        if (menuTitle) {
            const label = String(currentPack().label || difficultyId).toUpperCase();
            menuTitle.textContent = `${label} MODE`;
            menuTitle.style.color = theme.overlayAccent;
            menuTitle.style.textShadow = `0 0 24px ${theme.overlayAccent}99`;
        }
    }

    function cloneSector(bp) {
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

    function playerRect() {
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

    function solidRects() {
        const mods = HCPickupEffects.getPhysicsModifiers(activeEffects);
        return HCPlayerTouch.collectBlockingRects(sector, t, mods, touchHelpers());
    }

    function updateAllPlayerReacts(time) {
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

    function tryResolveX(dt) {
        player.x += player.vx * dt;
        const pr = playerRect();
        for (const r of solidRects()) {
            if (!overlap(pr, r)) continue;
            if (player.vx > 0) player.x = r.x - pr.w - 0.01;
            else if (player.vx < 0) player.x = r.x + r.w + 0.01;
            pr.x = player.x;
            player.vx = 0;
        }
    }

    function tryResolveY(dt) {
        player.y += player.vy * dt;
        const pr = playerRect();
        const mods = HCPickupEffects.getPhysicsModifiers(activeEffects);
        HCPickupEffects.resolveVerticalCollision(
            player, pr, solidRects(), pr.h, mods.flipGravity, CRUMBLE_TIME
        );
    }

    function loadSector(i) {
        sectorIndex = i;
        sector = cloneSector(sectorBlueprints[i]);
        lavaY = H + sector.lavaStartOffset;
        t = 0;
        player.x = sector.spawn.x;
        player.y = sector.spawn.y;
        player.vx = 0;
        player.vy = 0;
        player.onGround = false;
        player.coyote = 0;
        player.buffer = 0;
        player.airJumpsLeft = 1;
        player.jumpHeldPrev = false;
        player.w = PLAYER_W;
        player.h = PLAYER_H;
        activeEffects = HCPickupEffects.createEffectState();
        sectorEl.textContent = String(i + 1);
        cpEl.textContent = i === 0 ? 'Start' : sectorBlueprints[i - 1].name + ' ✓';
        sectorRunStart = performance.now();
        sectorDeathsAtStart = runDeaths;
    }

    function sectorRunElapsedSec() {
        return (performance.now() - sectorRunStart) / 1000;
    }

    function sectorRunDeathCount() {
        return runDeaths - sectorDeathsAtStart;
    }

    function recordCurrentSectorProgress() {
        if (!window.HCProgress) return;
        HCProgress.recordSectorComplete(
            difficultyId,
            sectorIndex,
            sectorRunElapsedSec(),
            sectorRunDeathCount()
        );
    }

    function die() {
        runDeaths++;
        deathsEl.textContent = String(runDeaths);
        HCPickupEffects.clearEffects(activeEffects);
        loadSector(sectorIndex);
    }

    function showMainMenu() {
        state = 'menu';
        menuPanel.classList.add('visible');
        sectorPanel.classList.remove('visible');
        gamePanel.classList.remove('visible');
        overlay.classList.remove('visible');
        if (window.HCMusic) playModeMusic('preview');
    }

    function showSectorPanel() {
        state = 'menu';
        menuPanel.classList.remove('visible');
        sectorPanel.classList.add('visible');
        gamePanel.classList.remove('visible');
        overlay.classList.remove('visible');
        const pack = currentPack();
        if (sectorPanelTitle) sectorPanelTitle.textContent = pack.label;
        if (sectorPanelSub) sectorPanelSub.textContent = pack.tagline || 'Vyber sektor';
        buildSectorGrid();
        if (window.HCMusic) playModeMusic('preview');
    }

    function launchSector(index) {
        const sectors = sectorBlueprints || [];
        if (index < 0 || index >= sectors.length) return;
        startGame(index);
    }

    function buildSectorGrid() {
        if (!sectorGrid) return;
        sectorGrid.innerHTML = '';
        const pack = currentPack();
        const sectors = pack.sectors || [];

        sectors.forEach((bp, i) => {
            const tileState = window.HCProgress
                ? HCProgress.getSectorTileState(difficultyId, i, bp, sectors)
                : { kind: 'unlocked' };
            const playable = tileState.kind === 'unlocked' || tileState.kind === 'completed';

            const tile = document.createElement('div');
            tile.className = 'sector-tile';
            tile.setAttribute('role', 'button');
            if (!playable) tile.setAttribute('aria-disabled', 'true');

            const thumbWrap = document.createElement('div');
            thumbWrap.className = 'sector-thumb-wrap';
            const thumb = document.createElement('canvas');
            thumb.width = 176;
            thumb.height = 104;
            if (window.HCSectorPreview) {
                HCSectorPreview.drawThumbnail(thumb, bp, pack.theme);
            }
            thumbWrap.appendChild(thumb);

            if (tileState.kind === 'coming_soon') {
                tile.classList.add('coming-soon');
                const ov = document.createElement('div');
                ov.className = 'sector-thumb-overlay';
                ov.innerHTML = '<strong>Coming soon</strong><span>Brzy k dispozici</span>';
                thumbWrap.appendChild(ov);
            } else if (tileState.kind === 'locked') {
                tile.classList.add('locked');
                const ov = document.createElement('div');
                ov.className = 'sector-thumb-overlay';
                ov.innerHTML = '<strong>🔒 Zamčeno</strong><span>Dokonči předchozí sektor</span>';
                thumbWrap.appendChild(ov);
            } else if (tileState.kind === 'completed') {
                tile.classList.add('completed');
            }

            const body = document.createElement('div');
            body.className = 'sector-tile-body';
            const num = document.createElement('span');
            num.className = 'sector-tile-num';
            num.textContent = `Sektor ${i + 1}`;
            const name = document.createElement('span');
            name.className = 'sector-tile-name';
            name.textContent = bp.name;
            body.appendChild(num);
            body.appendChild(name);

            const score = document.createElement('span');
            score.className = 'sector-tile-score';
            if (tileState.kind === 'completed' && tileState.bestTime != null) {
                score.textContent =
                    `★ ${tileState.bestTime.toFixed(1)} s · ${tileState.bestDeaths} smrtí`;
            } else if (tileState.kind === 'unlocked') {
                score.classList.add('muted');
                score.textContent = 'Ještě nedokončeno';
            } else if (tileState.kind === 'coming_soon') {
                score.classList.add('muted');
                score.textContent = 'Coming soon';
            } else {
                score.classList.add('muted');
                score.textContent = 'Zamčeno';
            }
            body.appendChild(score);

            tile.appendChild(thumbWrap);
            tile.appendChild(body);

            if (playable) {
                tile.tabIndex = 0;
                tile.addEventListener('click', () => launchSector(i));
                tile.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        launchSector(i);
                    }
                });
            }

            sectorGrid.appendChild(tile);
        });

        if (sectorCampaignBtn) {
            const startAt = window.HCProgress
                ? HCProgress.firstPlayableSectorIndex(difficultyId, sectors)
                : sectors.length > 0 ? 0 : -1;
            sectorCampaignBtn.disabled = startAt < 0;
            sectorCampaignBtn.title = startAt < 0
                ? 'Žádný dostupný sektor — publikuj alespoň jeden level v editoru'
                : '';
        }
        if (sectorEmptyHint) {
            const hasPlayable = sectors.some((bp, i) => {
                const st = window.HCProgress
                    ? HCProgress.getSectorTileState(difficultyId, i, bp, sectors)
                    : { kind: 'unlocked' };
                return st.kind === 'unlocked' || st.kind === 'completed';
            });
            if (!hasPlayable && sectors.length > 0) {
                sectorEmptyHint.hidden = false;
                sectorEmptyHint.textContent =
                    'V této obtížnosti zatím není žádný publikovaný sektor. V editoru zaškrtni „Veřejný level“, nebo zvol jinou obtížnost.';
            } else {
                sectorEmptyHint.hidden = true;
                sectorEmptyHint.textContent = '';
            }
        }
    }

    function returnToEditor() {
        if (window.HCMusic) HCMusic.stop();
        const editorPath = (editorTestCustom || difficultyId === CUSTOM_ID)
            ? 'user-editor.html'
            : (PUBLISH ? 'user-editor.html' : 'editor.html');
        if (window.opener && !window.opener.closed) {
            try { window.opener.focus(); } catch (_) { /* ignore */ }
            window.close();
            setTimeout(() => { location.href = editorPath; }, 150);
            return;
        }
        location.href = editorPath;
    }

    function showGameOverlay(title, text, btnLabel, showKeys) {
        overlay.classList.add('visible');
        ovTitle.textContent = title;
        ovText.textContent = text;
        startBtn.textContent = btnLabel;
        if (keysHint) keysHint.style.display = showKeys ? '' : 'none';
    }

    function selectDifficulty(id) {
        if (id === CUSTOM_ID) {
            if (!customPack) return;
            difficultyId = CUSTOM_ID;
        } else if (!DIFFICULTIES[id]) {
            return;
        } else {
            difficultyId = id;
        }
        const pack = currentPack();
        sectorBlueprints = pack.sectors;
        theme = pack.theme;
        HCPickupEffects.applyThemeDefaults(theme);
        applyThemeToUI();
        diffButtons.forEach((btn) => {
            btn.classList.toggle('selected', btn.dataset.difficulty === id);
        });
        if (window.HCMusic) playModeMusic('preview');
        updateSectorBackButton();
    }

    function updateSectorBackButton() {
        if (!sectorBackBtn) return;
        if (PUBLISH?.singleMode) {
            sectorBackBtn.style.display = difficultyId === CUSTOM_ID ? '' : 'none';
            return;
        }
        sectorBackBtn.style.display = '';
        sectorBackBtn.textContent = difficultyId === CUSTOM_ID ? '← Zpět do menu' : '← Zpět';
    }

    function showEasyCampaign() {
        selectDifficulty(PRIMARY_DIFF);
        updateSectorBackButton();
        showSectorPanel();
    }

    function win() {
        state = 'menu';
        menuPanel.classList.remove('visible');
        gamePanel.classList.add('visible');
        showGameOverlay(
            'PŘEŽITO',
            'Absolvoval jsi všech ' +
                sectorBlueprints.length +
                ' sektorů (' +
                currentPack().label +
                '). Čas běhu: ' +
                ((performance.now() - runStart) / 1000).toFixed(2) +
                ' s · smrtí: ' +
                runDeaths +
                '.',
            'Zpět na sektory',
            false
        );
        if (window.HCMusic) HCMusic.stop();
    }

    function sectorClear() {
        recordCurrentSectorProgress();
        if (sectorIndex >= sectorBlueprints.length - 1) {
            win();
            return;
        }
        loadSector(sectorIndex + 1);
    }

    function startGame(startAt = 0) {
        if (!sectorBlueprints || startAt < 0 || startAt >= sectorBlueprints.length) return;
        overlay.classList.remove('visible');
        menuPanel.classList.remove('visible');
        sectorPanel.classList.remove('visible');
        gamePanel.classList.add('visible');
        runDeaths = 0;
        deathsEl.textContent = '0';
        runStart = performance.now();
        loadSector(startAt);
        state = 'play';
        last = performance.now();
        if (window.HCMusic) {
            HCMusic.resume().then(() => playModeMusic('start')).catch(() => {});
        }
    }

    function update(dt) {
        if (state !== 'play') return;

        t += dt;
        HCPickupEffects.tickEffects(activeEffects, dt);
        const mods = HCPickupEffects.getPhysicsModifiers(activeEffects);
        HCPickupEffects.applyPlayerDimensions(player, mods, PLAYER_W, PLAYER_H);
        lavaY -= sector.lavaSpeed * mods.lavaSpeed * dt;

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

        tryResolveX(dt);
        tryResolveY(dt);
        HCPlayerTouch.clampPlayerToCanvas(player, W, H);

        updateAllPlayerReacts(t);

        HCCrumblePlatform.updateCrumbles(
            sector.crumble, dt, CRUMBLE_TIME, player, player.w, player.h, mods.flipGravity
        );

        if (player.onGround) player.airJumpsLeft = 1;

        const pr = playerRect();

        for (const pk of sector.pickups || []) {
            if (!pk.collected) {
                const base = { x: pk.x, y: pk.y, w: pk.w, h: pk.h };
                if (overlap(pr, HCPlayerReact.apply(pk, base))) {
                    HCPickupEffects.applyPickup(activeEffects, pk);
                    pk.collected = true;
                }
            }
        }

        if (!mods.shield && pr.y + pr.h > lavaY) {
            die();
            return;
        }

        if (!mods.shield && pr.y + pr.h >= H) {
            die();
            return;
        }

        if (HCPlayerTouch.checkPlayerDeath(sector, pr, t, mods, touchHelpers())) {
            die();
            return;
        }

        const goalBase = { x: sector.goal.x, y: sector.goal.y, w: sector.goal.w, h: sector.goal.h };
        if (overlap(pr, HCPlayerReact.apply(sector.goal, goalBase))) sectorClear();
    }

    function hexToRgb(hex) {
        const h = hex.replace('#', '');
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

    function parseCrumbleColor(heat) {
        if (heat >= 0.75) return theme.crumbleHot;
        const t = heat / 0.75;
        if (t < 0.5) return lerpHex(theme.crumbleCool, theme.crumbleWarm, t * 2);
        return lerpHex(theme.crumbleWarm, theme.crumbleHot, (t - 0.5) * 2);
    }

    function applyVis(el, base) {
        return HCPlayerReact.enabled(el) ? HCPlayerReact.apply(el, base) : base;
    }

    function draw() {
        if (!sector) return;

        const drawMods = HCPickupEffects.getPhysicsModifiers(activeEffects);
        const sceneFlipped = HCPickupEffects.beginSceneFlipDraw(ctx, H, drawMods.flipScene);

        ctx.fillStyle = theme.bg;
        ctx.fillRect(0, 0, W, H);

        const grad = ctx.createLinearGradient(0, lavaY, 0, H);
        grad.addColorStop(0, theme.lavaTop);
        grad.addColorStop(0.35, theme.lavaMid);
        grad.addColorStop(1, theme.lavaBot);
        ctx.fillStyle = grad;
        ctx.fillRect(0, lavaY, W, H - lavaY);

        ctx.strokeStyle = theme.lavaLine;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, lavaY);
        ctx.lineTo(W, lavaY);
        ctx.stroke();

        for (const r of sector.solids) {
            const base = { x: r.x, y: r.y, w: r.w, h: r.h };
            const dr = applyVis(r, base);
            ctx.fillStyle = theme.solid;
            ctx.strokeStyle = theme.solidStroke;
            ctx.lineWidth = 1;
            ctx.fillRect(dr.x, dr.y, dr.w, dr.h);
            ctx.strokeRect(dr.x + 0.5, dr.y + 0.5, dr.w - 1, dr.h - 1);
        }

        for (const c of sector.crumble) {
            if (c.broken) continue;
            const base = { x: c.x, y: c.y, w: c.w, h: c.h };
            const dr = applyVis(c, base);
            const remain = c.stress > 0 ? c.stress / CRUMBLE_TIME : 1;
            const heat = 1 - remain;
            ctx.fillStyle = parseCrumbleColor(heat);
            ctx.fillRect(dr.x, dr.y, dr.w, dr.h);
            ctx.strokeStyle = theme.lavaLine;
            ctx.strokeRect(dr.x + 0.5, dr.y + 0.5, dr.w - 1, dr.h - 1);
        }

        for (const sp of sector.spikes) {
            const base = { x: sp.x, y: sp.y, w: sp.w, h: sp.h };
            const dr = applyVis(sp, base);
            if (window.HCSpikeDraw) HCSpikeDraw.drawSpikeBlock(ctx, dr.x, dr.y, dr.w, dr.h, theme.spike);
            else { ctx.fillStyle = theme.spike; ctx.fillRect(dr.x, dr.y, dr.w, dr.h); }
        }

        for (const m of sector.movers) {
            const base = moverRect(m, t);
            const dr = applyVis(m, base);
            ctx.fillStyle = theme.mover;
            ctx.shadowColor = theme.moverGlow;
            ctx.shadowBlur = 12;
            ctx.fillRect(dr.x, dr.y, dr.w, dr.h);
            ctx.shadowBlur = 0;
        }

        for (const p of sector.pulses) {
            const base = pulseRect(p);
            const dr = applyVis(p, base);
            const on = pulseActive(p, t);
            ctx.fillStyle = on ? theme.pulseOn : theme.pulseOff;
            ctx.strokeStyle = on ? theme.pulseStrokeOn : theme.pulseStrokeOff;
            ctx.fillRect(dr.x, dr.y, dr.w, dr.h);
            ctx.strokeRect(dr.x + 0.5, dr.y + 0.5, dr.w - 1, dr.h - 1);
        }

        const gBase = { x: sector.goal.x, y: sector.goal.y, w: sector.goal.w, h: sector.goal.h };
        const g = applyVis(sector.goal, gBase);
        ctx.fillStyle = theme.goalFill;
        ctx.strokeStyle = theme.goalStroke;
        ctx.lineWidth = 2;
        ctx.fillRect(g.x, g.y, g.w, g.h);
        ctx.strokeRect(g.x + 0.5, g.y + 0.5, g.w - 1, g.h - 1);

        for (const pk of sector.pickups || []) {
            if (pk.collected) continue;
            const base = { x: pk.x, y: pk.y, w: pk.w, h: pk.h };
            const dr = applyVis(pk, base);
            const cx = dr.x + dr.w / 2;
            const cy = dr.y + dr.h / 2;
            const pulse = 0.85 + Math.sin(t * 6 + cx * 0.02) * 0.15;
            const pkColors = HCPickupEffects.getPickupColors(theme, pk.effectType || 'speed');
            ctx.fillStyle = pkColors.fill;
            ctx.shadowColor = pkColors.glow;
            ctx.shadowBlur = 14 * pulse;
            ctx.beginPath();
            ctx.arc(cx, cy, Math.min(pk.w, pk.h) * 0.45 * pulse, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.strokeStyle = pkColors.glow;
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }

        const primaryFx = HCPickupEffects.getPrimaryEffect(activeEffects);
        const pw = player.w ?? PLAYER_W;
        const ph = player.h ?? PLAYER_H;
        ctx.fillStyle = theme.player;
        ctx.fillRect(player.x, player.y, pw, ph);
        if (drawMods.shield) {
            const shieldColors = HCPickupEffects.getPickupColors(theme, 'shield');
            ctx.strokeStyle = shieldColors.glow;
            ctx.lineWidth = 2;
            ctx.shadowColor = shieldColors.glow;
            ctx.shadowBlur = 8;
        } else {
            ctx.strokeStyle = theme.playerStroke;
            ctx.lineWidth = 1;
            ctx.shadowBlur = 0;
        }
        ctx.strokeRect(player.x + 0.5, player.y + 0.5, pw - 1, ph - 1);
        ctx.shadowBlur = 0;

        ctx.fillStyle = 'rgba(255,255,255,0.04)';
        ctx.fillRect(0, 0, W, H);

        HCPickupEffects.endSceneFlipDraw(ctx, sceneFlipped);

        if (primaryFx && !drawMods.shield) {
            const fxDef = HCPickupEffects.PICKUP_EFFECTS[primaryFx.effectType];
            const fxColors = HCPickupEffects.getPickupColors(theme, primaryFx.effectType);
            ctx.fillStyle = fxColors.glow;
            ctx.font = '9px monospace';
            ctx.textAlign = 'center';
            const label = fxDef ? fxDef.label.slice(0, 3).toUpperCase() : '?';
            ctx.fillText(label, player.x + pw / 2, player.y - 4);
        } else if (primaryFx) {
            const fxColors = HCPickupEffects.getPickupColors(theme, primaryFx.effectType);
            ctx.fillStyle = fxColors.glow;
            ctx.font = '9px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`${primaryFx.remaining.toFixed(1)}s`, player.x + pw / 2, player.y - 4);
        }
    }

    let last = performance.now();
    function frame(now) {
        const raw = (now - last) / 1000;
        last = now;
        const dt = Math.min(raw, 0.05);
        if (state === 'play' && sector) {
            update(dt);
            timeEl.textContent = ((now - runStart) / 1000).toFixed(1);
            draw();
        } else if (sector && state === 'paused') {
            draw();
        }
        requestAnimationFrame(frame);
    }

    window.addEventListener('keydown', (e) => {
        const k = e.key.toLowerCase();
        keys[k] = true;
        if (e.code === 'Space') keys.space = true;
        if (k === 'p' && state === 'play') {
            state = 'paused';
            showGameOverlay('PAUZA', 'Stiskni P nebo Enter pro pokračování.', 'Pokračovat', true);
        } else if ((k === 'p' || e.key === 'Enter') && state === 'paused') {
            state = 'play';
            overlay.classList.remove('visible');
            last = performance.now();
        }
        if (k === 'escape' && (state === 'play' || state === 'paused')) {
            if (fromEditor) {
                returnToEditor();
            } else {
                if (window.HCMusic) HCMusic.stop();
                showSectorPanel();
            }
        }
        if (k === 'r' && state === 'play' && sector) {
            die();
        }
        if (e.key === ' ' || k === ' ') e.preventDefault();
    });

    window.addEventListener('keyup', (e) => {
        keys[e.key.toLowerCase()] = false;
        if (e.code === 'Space') keys.space = false;
    });

    startBtn.addEventListener('click', async () => {
        if (state === 'paused') {
            state = 'play';
            overlay.classList.remove('visible');
            last = performance.now();
            return;
        }
        if (overlay.classList.contains('visible') && ovTitle.textContent === 'PŘEŽITO') {
            showSectorPanel();
            return;
        }
        await (window.HCMusic && HCMusic.resume());
        startGame();
    });

    diffButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            selectDifficulty(btn.dataset.difficulty);
            showSectorPanel();
        });
    });

    if (sectorBackBtn) {
        sectorBackBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (PUBLISH?.singleMode && difficultyId === CUSTOM_ID) {
                showEasyCampaign();
                return;
            }
            showMainMenu();
        });
    }

    const loadCustomPackBtn = document.getElementById('loadCustomPackBtn');
    const loadCustomPackBtnSector = document.getElementById('loadCustomPackBtnSector');
    const customPackFile = document.getElementById('customPackFile');

    async function handleCustomPackPick(file) {
        if (!file) return;
        try {
            await loadCustomPackFile(file);
            updateSectorBackButton();
        } catch (err) {
            alert(err.message || String(err));
        }
    }

    if (customPackFile && window.HCPackGuard && window.HCUserPack) {
        const openCustomPackPicker = () => customPackFile.click();
        loadCustomPackBtn?.addEventListener('click', openCustomPackPicker);
        loadCustomPackBtnSector?.addEventListener('click', openCustomPackPicker);
        customPackFile.addEventListener('change', async () => {
            await handleCustomPackPick(customPackFile.files?.[0]);
            customPackFile.value = '';
        });
    }

    if (sectorCampaignBtn) {
        sectorCampaignBtn.addEventListener('click', () => {
            const sectors = currentPack().sectors || [];
            const startAt = window.HCProgress
                ? HCProgress.firstPlayableSectorIndex(difficultyId, sectors)
                : sectors.length > 0 ? 0 : -1;
            if (startAt < 0) return;
            launchSector(startAt);
        });
    }

    const musicToggle = document.getElementById('musicToggle');
    function syncMusicToggle() {
        if (!musicToggle || !window.HCMusic) return;
        const muted = !!HCMusic.muted;
        musicToggle.setAttribute('aria-pressed', muted ? 'true' : 'false');
        musicToggle.title = muted ? 'Zapnout hudbu' : 'Vypnout hudbu';
        musicToggle.setAttribute('aria-label', musicToggle.title);
    }
    if (musicToggle) {
        syncMusicToggle();
        musicToggle.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (!window.HCMusic) return;
            await HCMusic.resume();
            HCMusic.toggleMute();
            syncMusicToggle();
        });
    }

    selectDifficulty(PRIMARY_DIFF);
    applyThemeToUI();
    updateSectorBackButton();

    const urlParams = new URLSearchParams(window.location.search);
    const testDiff = urlParams.get('diff');
    const testSector = urlParams.get('sector');
    editorTestCustom = urlParams.get('custom') === '1';
    const testCustom = editorTestCustom;
    const fromEditor = urlParams.get('from') === 'editor';
    if (testCustom && tryLoadTestPackFromSession()) {
        const si = Math.max(0, Math.min(sectorBlueprints.length - 1, parseInt(testSector || '0', 10) || 0));
        menuPanel.classList.remove('visible');
        sectorPanel.classList.remove('visible');
        gamePanel.classList.add('visible');
        runDeaths = 0;
        deathsEl.textContent = '0';
        runStart = performance.now();
        loadSector(si);
        state = 'play';
        updateSectorBackButton();
        if (keysHint) {
            keysHint.textContent = 'WASD / šipky · mezerník skok + dvojskok · R restart · P pauza · Esc zpět do editoru';
        }
        const hintEl = document.getElementById('hint');
        if (hintEl) hintEl.textContent = 'Test z tvůrce map — Esc = zpět do editoru.';
        playModeMusic('start');
    } else if (testDiff && DIFFICULTIES[testDiff]) {
        selectDifficulty(testDiff);
        const si = Math.max(0, Math.min(sectorBlueprints.length - 1, parseInt(testSector || '0', 10) || 0));
        menuPanel.classList.remove('visible');
        gamePanel.classList.add('visible');
        runDeaths = 0;
        deathsEl.textContent = '0';
        runStart = performance.now();
        loadSector(si);
        state = 'play';
        if (keysHint) {
            keysHint.textContent = fromEditor
                ? 'WASD / šipky · mezerník skok + dvojskok · R restart · P pauza · Esc zpět do editoru'
                : keysHint.textContent;
        }
        const hintEl = document.getElementById('hint');
        if (fromEditor && hintEl) hintEl.textContent = 'Test z editoru — Esc = zpět do tvůrce úrovní.';
        playModeMusic('start');
    } else if (PUBLISH?.singleMode) {
        showSectorPanel();
    } else {
        showMainMenu();
    }

    requestAnimationFrame(frame);
})();
