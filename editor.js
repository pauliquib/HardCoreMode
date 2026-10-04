(function () {
    'use strict';

    const EDITOR_CFG = window.HC_EDITOR_CONFIG || { mode: 'full' };
    const IS_USER = EDITOR_CFG.mode === 'user';
    const USER_DRAFT_KEY = 'hc_user_editor_draft_v1';
    const CUSTOM_KEY = HCUserPack.CUSTOM_ID;

    const W = HCLevelStore.W;
    const H = HCLevelStore.H;

    const canvas = document.getElementById('editor');
    const ctx = canvas.getContext('2d');
    const diffSelect = document.getElementById('diffSelect');
    const sectorList = document.getElementById('sectorList');
    const statusBar = document.getElementById('statusBar');
    const validationList = document.getElementById('validationList');
    const selectionPanel = document.getElementById('selectionPanel');
    const propName = document.getElementById('propName');
    const propLavaSpeed = document.getElementById('propLavaSpeed');
    const propLavaOffset = document.getElementById('propLavaOffset');
    const propPublic = document.getElementById('propPublic');
    const themePalette = document.getElementById('themePalette');
    const btnPlay = document.getElementById('btnPlay');
    const btnCopy = document.getElementById('btnCopy');
    const btnPaste = document.getElementById('btnPaste');
    const projectNameInput = document.getElementById('projectName');
    const musicFileInput = document.getElementById('musicFile');
    const musicFileName = document.getElementById('musicFileName');
    const btnPreviewMusic = document.getElementById('btnPreviewMusic');
    const btnRemoveMusic = document.getElementById('btnRemoveMusic');

    let pack;
    let userProjectName = 'Můj projekt';
    if (IS_USER) {
        try {
            const draft = localStorage.getItem(USER_DRAFT_KEY);
            if (draft) {
                const parsed = HCPackGuard.parseJsonSafe(draft, HCPackGuard.LIMITS.maxJsonBytes);
                const validated = HCPackGuard.validateUserPack(parsed);
                userProjectName = validated.projectName;
                pack = { [CUSTOM_KEY]: HCUserPack.toDifficultyData(validated) };
            }
        } catch {
            /* ignore invalid draft */
        }
        if (!pack) {
            const empty = HCUserPack.createEmpty(userProjectName);
            pack = { [CUSTOM_KEY]: HCUserPack.toDifficultyData(empty) };
        }
    } else {
        pack = HCLevelStore.getDifficulties();
    }
    migratePackThemes(pack);
    let diffKey = IS_USER ? CUSTOM_KEY : 'medium';
    let sectorIndex = 0;
    let tool = 'select';
    let selected = null;
    let drag = null;
    let dirty = false;
    /** @type {{kind:string, data:object}|null} */
    let clipboard = null;
    /** @type {FileSystemFileHandle|null} */
    let projectFileHandle = null;
    const HISTORY_LIMIT = 80;
    /** @type {ReturnType<typeof captureHistory>[]} */
    const undoStack = [];
    /** @type {ReturnType<typeof captureHistory>[]} */
    const redoStack = [];
    let historyLocked = false;

    let previewPlaying = false;
    let previewLast = 0;
    /** @type {number|null} */
    let previewRafId = null;
    /** @type {ReturnType<typeof HCSectorSim.resetPlay>|null} */
    let playState = null;

    const PASTE_OFFSET = 16;
    const HANDLE_DRAW = 5;
    const HANDLE_HIT = 8;
    const MIN_ELEM_SIZE = 4;

    function elementBaseRect(kind, ref, simTime) {
        if (kind === 'mover' && previewPlaying && playState) {
            return HCSectorSim.moverRect(ref, simTime);
        }
        if (kind === 'spawn') return { x: ref.x, y: ref.y, w: 11, h: 15 };
        return { x: ref.x, y: ref.y, w: ref.w || 11, h: ref.h || 15 };
    }

    function elementWorldRect(kind, ref) {
        const simTime = playState?.t ?? 0;
        const base = elementBaseRect(kind, ref, simTime);
        if (previewPlaying && playState && HCPlayerReact.enabled(ref)) {
            return HCPlayerReact.apply(ref, base);
        }
        return base;
    }

    function drawReactAnchor(baseRect) {
        ctx.strokeStyle = 'rgba(255, 180, 96, 0.55)';
        ctx.setLineDash([4, 3]);
        ctx.strokeRect(baseRect.x + 0.5, baseRect.y + 0.5, baseRect.w - 1, baseRect.h - 1);
        ctx.setLineDash([]);
    }

    function drawMoverMotionGuide(m, th) {
        const amp = m.amp || 0;
        if (amp <= 0) return;
        const horizontal = m.axis !== 'y';
        ctx.save();
        ctx.strokeStyle = th.moverGlow || 'rgba(94, 200, 232, 0.55)';
        ctx.fillStyle = th.mover;
        ctx.globalAlpha = 0.35;
        ctx.setLineDash([5, 4]);
        ctx.lineWidth = 1.5;
        const cx = m.x + m.w / 2;
        const cy = m.y + m.h / 2;
        ctx.beginPath();
        if (horizontal) {
            ctx.moveTo(m.x - amp + m.w / 2, cy);
            ctx.lineTo(m.x + amp + m.w / 2, cy);
        } else {
            ctx.moveTo(cx, m.y - amp + m.h / 2);
            ctx.lineTo(cx, m.y + amp + m.h / 2);
        }
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 0.18;
        if (horizontal) {
            ctx.fillRect(m.x - amp, m.y, m.w, m.h);
            ctx.fillRect(m.x + amp, m.y, m.w, m.h);
        } else {
            ctx.fillRect(m.x, m.y - amp, m.w, m.h);
            ctx.fillRect(m.x, m.y + amp, m.w, m.h);
        }
        ctx.restore();
    }

    function playerTouchPanelHtml(r, kind) {
        if (kind === 'spawn') return '';
        HCPlayerTouch.applyDefaults(r, kind);
        const blocks = HCPlayerTouch.blocksPlayer(r, kind);
        const kills = HCPlayerTouch.killOnContact(r, kind);
        return `
            <div class="field-group">
                <p class="hint">Interakce s hráčem</p>
                <div class="field">
                    <label class="checkbox-label"><input type="checkbox" id="selBlocksPlayer" ${blocks ? 'checked' : ''}> Pevná kolize (lze po ní chodit)</label>
                </div>
                <div class="field">
                    <label class="checkbox-label"><input type="checkbox" id="selKillOnContact" ${kills ? 'checked' : ''}> Smrt při dotyku</label>
                </div>
                <p class="hint">Vypnutá kolize = hráč prvek prochází. Zapnutá smrt = dotyk eliminuje hráče. Kyvadlo s pevnou kolizí je pohyblivá plošina (stání nahoře nezabíjí).</p>
            </div>`;
    }

    function bindPlayerTouchFields(r, kind) {
        if (kind === 'spawn') return;
        const blocksCb = document.getElementById('selBlocksPlayer');
        const killCb = document.getElementById('selKillOnContact');
        if (blocksCb) {
            blocksCb.addEventListener('change', () => {
                beginEdit();
                r.blocksPlayer = blocksCb.checked;
                markDirty();
                draw();
            });
        }
        if (killCb) {
            killCb.addEventListener('change', () => {
                beginEdit();
                r.killOnContact = killCb.checked;
                markDirty();
                draw();
            });
        }
    }

    function playerReactPanelHtml(r) {
        return `
            <div class="field">
                <label class="checkbox-label"><input type="checkbox" id="selReactPlayer" ${r.reactPlayer ? 'checked' : ''}> Pohyb podle hráče</label>
            </div>
            <div id="reactPlayerFields" style="display:${r.reactPlayer ? 'block' : 'none'}">
                <p class="hint">Přibližování hráče se zrcadlí v pohybu prvku — prvek se nehýbe, dokud se hráč nepohne.</p>
                <div class="field-row">
                    <div class="field"><label>Násobek</label><input type="number" step="0.1" id="selReactMult" value="${r.reactMult ?? 1}"></div>
                    <div class="field"><label>Směr</label><select id="selReactDir"><option value="toward">Ke hráči</option><option value="away">Od hráče</option></select></div>
                </div>
                <div class="field-row">
                    <div class="field"><label>Režim</label><select id="selReactMode"><option value="mirror">Zrcadlení</option><option value="position">Pozice</option></select></div>
                    <div class="field"><label>Osa</label><select id="selReactAxis"><option value="both">Obě</option><option value="x">X</option><option value="y">Y</option></select></div>
                </div>
                <div class="field-row">
                    <div class="field"><label>Výchylka X</label><input type="number" id="selReactOffsetX" value="${r.reactOffsetX ?? 0}"></div>
                    <div class="field"><label>Výchylka Y</label><input type="number" id="selReactOffsetY" value="${r.reactOffsetY ?? 0}"></div>
                </div>
                <div class="field-row">
                    <div class="field"><label>Kolmá vých.</label><input type="number" id="selReactPerpAmp" value="${r.reactPerpAmp ?? 0}"></div>
                    <div class="field"><label>Kolmá frekv.</label><input type="number" step="0.01" id="selReactPerpFreq" value="${r.reactPerpFreq ?? 0.05}"></div>
                </div>
                <div class="field-row">
                    <div class="field"><label>Max. dosah</label><input type="number" id="selReactMaxDist" value="${r.reactMaxDist ?? 120}"></div>
                    <div class="field"><label>Min. vzdál.</label><input type="number" id="selReactMinDist" value="${r.reactMinDist ?? 0}"></div>
                </div>
                <div class="field-row">
                    <div class="field"><label>Dosah reakce</label><input type="number" id="selReactRange" value="${r.reactRange ?? 0}" title="0 = bez limitu"></div>
                    <div class="field"><label>Kolmá fáze</label><input type="number" step="0.05" id="selReactPerpPhase" value="${r.reactPerpPhase ?? 0}"></div>
                </div>
            </div>`;
    }

    function bindPlayerReactFields(r) {
        const reactCb = document.getElementById('selReactPlayer');
        if (reactCb) {
            reactCb.addEventListener('change', () => {
                beginEdit();
                r.reactPlayer = reactCb.checked;
                if (r.reactPlayer) HCPlayerReact.applyDefaults(r);
                markDirty();
                renderSelectionPanel();
                draw();
            });
        }
        const bind = (id, key, parseFn) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.addEventListener('change', () => {
                beginEdit();
                r[key] = parseFn(el.value);
                markDirty();
                draw();
            });
        };
        bind('selReactMult', 'reactMult', Number);
        bind('selReactOffsetX', 'reactOffsetX', Number);
        bind('selReactOffsetY', 'reactOffsetY', Number);
        bind('selReactPerpAmp', 'reactPerpAmp', Number);
        bind('selReactPerpFreq', 'reactPerpFreq', Number);
        bind('selReactPerpPhase', 'reactPerpPhase', Number);
        bind('selReactMaxDist', 'reactMaxDist', Number);
        bind('selReactMinDist', 'reactMinDist', Number);
        bind('selReactRange', 'reactRange', Number);
        const dirEl = document.getElementById('selReactDir');
        if (dirEl) {
            dirEl.value = r.reactDir || 'toward';
            dirEl.addEventListener('change', () => { beginEdit(); r.reactDir = dirEl.value; markDirty(); });
        }
        const modeEl = document.getElementById('selReactMode');
        if (modeEl) {
            modeEl.value = r.reactMode || 'mirror';
            modeEl.addEventListener('change', () => { beginEdit(); r.reactMode = modeEl.value; markDirty(); });
        }
        const axisEl = document.getElementById('selReactAxis');
        if (axisEl) {
            axisEl.value = r.reactAxis || 'both';
            axisEl.addEventListener('change', () => { beginEdit(); r.reactAxis = axisEl.value; markDirty(); });
        }
    }

    const RESIZE_CURSORS = {
        nw: 'nwse-resize',
        se: 'nwse-resize',
        ne: 'nesw-resize',
        sw: 'nesw-resize',
    };

    const THEME_COLOR_FIELDS = [
        { key: 'bg', label: 'Pozadí' },
        { key: 'lavaTop', label: 'Láva — vrch' },
        { key: 'lavaMid', label: 'Láva — střed' },
        { key: 'lavaBot', label: 'Láva — spodek' },
        { key: 'lavaLine', label: 'Láva — obrys' },
        { key: 'solid', label: 'Pevná plošina' },
        { key: 'solidStroke', label: 'Pevná — obrys' },
        { key: 'crumbleCool', label: 'Křehká — chladná' },
        { key: 'crumbleWarm', label: 'Křehká — teplá' },
        { key: 'crumbleHot', label: 'Křehká — žhavá' },
        { key: 'spike', label: 'Spiky' },
        { key: 'mover', label: 'Kyvadlo' },
        { key: 'moverGlow', label: 'Kyvadlo — glow' },
        { key: 'reactor', label: 'Reaktor' },
        { key: 'reactorGlow', label: 'Reaktor — glow' },
        { key: 'pulseOn', label: 'Pulz — zapnuto' },
        { key: 'pulseOff', label: 'Pulz — vypnuto' },
        { key: 'pulseStrokeOn', label: 'Pulz obrys — on' },
        { key: 'pulseStrokeOff', label: 'Pulz obrys — off' },
        { key: 'goalFill', label: 'Cíl — výplň' },
        { key: 'goalStroke', label: 'Cíl — obrys' },
        ...HCPickupEffects.getThemeColorFields(),
        { key: 'player', label: 'Hráč' },
        { key: 'playerStroke', label: 'Hráč — obrys' },
        { key: 'overlayAccent', label: 'Overlay akcent' },
        { key: 'hudDanger', label: 'HUD nebezpečí' },
    ];

    function parseCssColor(css) {
        const s = String(css || '#ffffff').trim();
        if (s.startsWith('#')) {
            let h = s.slice(1);
            if (h.length === 3) h = h.split('').map((c) => c + c).join('');
            if (h.length >= 6) return { hex: `#${h.slice(0, 6).toLowerCase()}`, a: 1 };
        }
        const m = s.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+))?\s*\)/i);
        if (m) {
            const hex = '#' + [m[1], m[2], m[3]].map((n) => {
                const v = Math.max(0, Math.min(255, Math.round(+n)));
                return v.toString(16).padStart(2, '0');
            }).join('');
            const a = m[4] !== undefined ? Math.max(0, Math.min(1, +m[4])) : 1;
            return { hex, a };
        }
        return { hex: '#ffffff', a: 1 };
    }

    function formatCssColor(hex, a) {
        if (a >= 0.995) return hex;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        const alpha = Math.round(a * 100) / 100;
        return `rgba(${r},${g},${b},${alpha})`;
    }

    function buildThemePalette() {
        const th = theme();
        themePalette.innerHTML = '';
        for (const field of THEME_COLOR_FIELDS) {
            const parsed = parseCssColor(th[field.key] ?? '#ffffff');
            const row = document.createElement('div');
            row.className = 'color-row';
            row.innerHTML = `
                <label>${field.label}</label>
                <input type="color" data-key="${field.key}" value="${parsed.hex}" title="${field.label}">
                <div class="alpha-wrap">
                    <span>α ${Math.round(parsed.a * 100)}%</span>
                    <input type="range" min="0" max="100" step="1" data-alpha="${field.key}" value="${Math.round(parsed.a * 100)}">
                </div>`;
            themePalette.appendChild(row);
        }

        let themeHistoryCaptured = false;
        const startThemeGesture = () => { themeHistoryCaptured = false; };
        const captureThemeHistory = () => {
            if (!themeHistoryCaptured) {
                beginEdit();
                themeHistoryCaptured = true;
            }
        };

        themePalette.querySelectorAll('input[type="color"]').forEach((el) => {
            el.addEventListener('pointerdown', startThemeGesture);
            el.addEventListener('focus', startThemeGesture);
            el.addEventListener('input', () => {
                captureThemeHistory();
                const key = el.dataset.key;
                const alphaEl = themePalette.querySelector(`input[data-alpha="${key}"]`);
                const a = alphaEl ? +alphaEl.value / 100 : 1;
                theme()[key] = formatCssColor(el.value, a);
                markDirty();
                draw();
            });
        });
        themePalette.querySelectorAll('input[type="range"]').forEach((el) => {
            el.addEventListener('pointerdown', startThemeGesture);
            el.addEventListener('focus', startThemeGesture);
            el.addEventListener('input', () => {
                captureThemeHistory();
                const key = el.dataset.alpha;
                const colorEl = themePalette.querySelector(`input[type="color"][data-key="${key}"]`);
                const a = +el.value / 100;
                const span = el.previousElementSibling;
                if (span) span.textContent = `α ${Math.round(a * 100)}%`;
                theme()[key] = formatCssColor(colorEl.value, a);
                markDirty();
                draw();
            });
        });
    }

    function resetThemeColors() {
        beginEdit();
        currentDiff().theme = HCLevelStore.getThemeDefaults(diffKey);
        markDirty();
        buildThemePalette();
        draw();
        setStatus('Barvy obtížnosti obnoveny na výchozí', 'ok');
    }

    function currentDiff() {
        let diff = pack?.[diffKey];
        if (!diff && pack && typeof pack === 'object') {
            // Uložený diffKey nemusí v packu existovat (jiný publish režim,
            // neúplný import) — přepnout na první dostupnou obtížnost.
            const keys = Object.keys(pack);
            if (keys.length) {
                diffKey = keys[0];
                diff = pack[diffKey];
            }
        }
        if (!diff || typeof diff !== 'object') {
            // Zcela prázdný pack — vytvořit minimální obtížnost, aby editor naběhl.
            diff = pack[diffKey] = { label: diffKey, tagline: '', sectors: [] };
        }
        if (!diff.theme || typeof diff.theme !== 'object') {
            diff.theme = HCLevelStore.getThemeDefaults(diffKey);
        }
        if (!Array.isArray(diff.sectors) || !diff.sectors.length) {
            diff.sectors = [HCLevelStore.createSectorTemplate(IS_USER ? 'easy' : diffKey, 0)];
        }
        return diff;
    }

    function currentSector() {
        const sectors = currentDiff().sectors;
        sectorIndex = Math.max(0, Math.min(sectorIndex, sectors.length - 1));
        return sectors[sectorIndex];
    }

    function configureEditorMode() {
        const title = document.querySelector('.bar h1');
        if (IS_USER) {
            if (title) title.textContent = 'TVŮRCE MAP';
            document.getElementById('btnSave')?.classList.add('hidden');
            document.getElementById('btnSaveProject')?.classList.add('hidden');
            document.getElementById('btnReset')?.classList.add('hidden');
            document.getElementById('userProjectField')?.classList.remove('hidden');
            document.getElementById('diffHeading')?.classList.add('hidden');
            document.getElementById('diffSelectField')?.classList.add('hidden');
            document.getElementById('diffTagline')?.classList.add('hidden');
            document.getElementById('propPublicField')?.classList.add('hidden');
            const exportBtn = document.getElementById('btnExport');
            if (exportBtn) exportBtn.textContent = 'Uložit do PC';
            const importBtn = document.getElementById('btnImport');
            if (importBtn) importBtn.textContent = 'Načíst z PC';
            if (projectNameInput) projectNameInput.value = userProjectName;
        }
    }

    function saveUserDraft() {
        if (!IS_USER) return;
        try {
            const data = HCUserPack.fromDifficulty(currentDiff(), userProjectName);
            localStorage.setItem(USER_DRAFT_KEY, HCUserPack.toJson(data));
        } catch {
            /* ignore quota errors */
        }
    }

    function syncMusicUI() {
        const music = currentDiff().music;
        if (!musicFileName) return;
        musicFileName.textContent = music?.name
            ? `Aktivní: ${music.name}`
            : 'Žádná vlastní hudba — použije se procedurální hudba';
    }

    async function applyMusicFile(file) {
        if (!file) return;
        try {
            const music = await HCPackGuard.fileToMusic(file);
            beginEdit();
            currentDiff().music = music;
            markDirty();
            syncMusicUI();
            setStatus(`Hudba načtena: ${music.name}`, 'ok');
        } catch (err) {
            alert(err.message || String(err));
        }
        if (musicFileInput) musicFileInput.value = '';
    }

    function removeMusic() {
        if (!currentDiff().music) return;
        beginEdit();
        currentDiff().music = null;
        markDirty();
        syncMusicUI();
        if (window.HCMusic) HCMusic.stop();
        setStatus('Vlastní hudba odstraněna', 'ok');
    }

    function previewMusic() {
        if (!window.HCMusic) return;
        const music = currentDiff().music;
        if (music?.dataBase64) {
            HCMusic.preview(diffKey, music);
            setStatus('Přehrávám vlastní hudbu', 'ok');
            return;
        }
        HCMusic.preview(IS_USER ? 'easy' : diffKey);
        setStatus('Přehrávám procedurální hudbu', 'ok');
    }

    function exportCurrentPackJson() {
        if (IS_USER) return HCUserPack.toJson(HCUserPack.fromDifficulty(currentDiff(), userProjectName));
        return HCLevelStore.exportJson();
    }

    function downloadUserPack() {
        const data = HCUserPack.fromDifficulty(currentDiff(), userProjectName);
        HCUserPack.download(data);
        dirty = false;
        saveUserDraft();
        setStatus('Sada levelů uložena do PC', 'ok');
    }

    function setStatus(msg, type) {
        statusBar.textContent = msg;
        statusBar.className = type || '';
    }

    function markDirty() {
        dirty = true;
        setStatus('Neuložené změny', 'warn');
    }

    function captureHistory() {
        return {
            pack: HCLevelStore.deepClone(pack),
            diffKey,
            sectorIndex,
            selected: selected ? { kind: selected.kind, index: selected.index } : null,
            dirty,
        };
    }

    function beginEdit() {
        if (historyLocked) return;
        const snap = captureHistory();
        const last = undoStack[undoStack.length - 1];
        if (last && last.diffKey === snap.diffKey && JSON.stringify(last.pack) === JSON.stringify(snap.pack)) {
            return;
        }
        undoStack.push(snap);
        if (undoStack.length > HISTORY_LIMIT) undoStack.shift();
        redoStack.length = 0;
    }

    function resolveSelection(sel) {
        if (!sel) return null;
        const s = currentSector();
        if (!s) return null;
        if (sel.kind === 'spawn') return s.spawn ? { kind: 'spawn', index: 0, ref: s.spawn } : null;
        if (sel.kind === 'goal') return s.goal ? { kind: 'goal', index: 0, ref: s.goal } : null;
        const lists = {
            solid: s.solids,
            crumble: s.crumble,
            spike: s.spikes,
            mover: s.movers,
            pulse: s.pulses,
            pickup: s.pickups,
        };
        const arr = lists[sel.kind];
        const ref = arr && arr[sel.index];
        if (!ref) return null;
        return { kind: sel.kind, index: sel.index, ref };
    }

    function applyHistory(snap) {
        historyLocked = true;
        pack = HCLevelStore.deepClone(snap.pack);
        migratePackThemes(pack);
        diffKey = snap.diffKey;
        const maxIdx = Math.max(0, (pack[diffKey]?.sectors?.length || 1) - 1);
        sectorIndex = Math.max(0, Math.min(snap.sectorIndex, maxIdx));
        dirty = snap.dirty;
        selected = resolveSelection(snap.selected);
        drag = null;
        buildDiffSelect();
        buildSectorList();
        syncSectorProps();
        draw();
        historyLocked = false;
    }

    function undoEdit() {
        if (previewPlaying) return false;
        if (!undoStack.length) {
            setStatus('Není co vrátit zpět', 'warn');
            return false;
        }
        redoStack.push(captureHistory());
        applyHistory(undoStack.pop());
        setStatus(dirty ? 'Zpět — neuložené změny' : 'Zpět', dirty ? 'warn' : 'ok');
        return true;
    }

    function redoEdit() {
        if (previewPlaying) return false;
        if (!redoStack.length) {
            setStatus('Není co zopakovat', 'warn');
            return false;
        }
        undoStack.push(captureHistory());
        applyHistory(redoStack.pop());
        setStatus(dirty ? 'Vpřed — neuložené změny' : 'Vpřed', dirty ? 'warn' : 'ok');
        return true;
    }

    function save() {
        if (IS_USER) {
            saveUserDraft();
            dirty = false;
            setStatus('Koncept uložen v prohlížeči', 'ok');
            return;
        }
        HCLevelStore.saveDifficulties(pack);
        dirty = false;
        setStatus('Uloženo do prohlížeče (localStorage)', 'ok');
    }

    function downloadLevelsPack(js) {
        const blob = new Blob([js], { type: 'text/javascript;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'levels-pack.js';
        a.click();
        URL.revokeObjectURL(url);
    }

    async function writeWithFilePicker(js) {
        if (!window.showSaveFilePicker) return false;
        if (!projectFileHandle) {
            projectFileHandle = await window.showSaveFilePicker({
                suggestedName: 'levels-pack.js',
                types: [{
                    description: 'Levels pack',
                    accept: { 'text/javascript': ['.js'] },
                }],
            });
        }
        const writable = await projectFileHandle.createWritable();
        await writable.write(js);
        await writable.close();
        return true;
    }

    async function saveToProject() {
        save();
        const js = HCLevelStore.buildLevelsPackJs(pack);
        setStatus('Ukládám do projektu…', 'warn');

        try {
            const res = await fetch('/api/save-levels', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pack),
            });
            if (res.ok) {
                const data = await res.json().catch(() => ({ ok: true }));
                if (typeof window !== 'undefined') window.HC_LEVELS_PACK = HCLevelStore.deepClone(pack);
                setStatus(`Uloženo do projektu (${data.path || 'levels-pack.js'})`, 'ok');
                return;
            }
        } catch {
            /* dev-server není k dispozici — fallback */
        }

        try {
            const ok = await writeWithFilePicker(js);
            if (ok) {
                if (typeof window !== 'undefined') window.HC_LEVELS_PACK = HCLevelStore.deepClone(pack);
                setStatus('Uloženo do levels-pack.js (File System Access)', 'ok');
                return;
            }
        } catch (err) {
            if (err && err.name === 'AbortError') {
                setStatus('Uložení do projektu zrušeno', 'warn');
                return;
            }
            projectFileHandle = null;
        }

        downloadLevelsPack(js);
        if (typeof window !== 'undefined') window.HC_LEVELS_PACK = HCLevelStore.deepClone(pack);
        setStatus('Stažen levels-pack.js — ulož ho do složky projektu', 'warn');
    }

    function migratePackThemes(p) {
        for (const diff of Object.values(p)) {
            if (diff?.theme) HCPickupEffects.applyThemeDefaults(diff.theme);
        }
    }

    function theme() {
        const th = currentDiff().theme;
        HCPickupEffects.applyThemeDefaults(th);
        return th;
    }

    function buildDiffSelect() {
        if (IS_USER) return;
        diffSelect.innerHTML = '';
        // Pořadí podle exportu hry; chybějící klíče přeskočit a klíče navíc
        // (importovaný pack) přidat na konec — pack se může lišit od výchozího.
        const order = HCLevelStore.getLevelsExport().DIFFICULTY_ORDER;
        const keys = [
            ...order.filter((k) => pack[k]),
            ...Object.keys(pack).filter((k) => !order.includes(k)),
        ];
        for (const key of keys) {
            const opt = document.createElement('option');
            opt.value = key;
            opt.textContent = pack[key].label || key;
            diffSelect.appendChild(opt);
        }
        diffSelect.value = diffKey;
        const taglineEl = document.getElementById('diffTagline');
        if (taglineEl) taglineEl.textContent = currentDiff().tagline;
    }

    function buildSectorList() {
        sectorList.innerHTML = '';
        currentDiff().sectors.forEach((s, i) => {
            const li = document.createElement('li');
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'sector-btn' + (i === sectorIndex ? ' active' : '');
            const pub = IS_USER ? true : HCLevelStore.isSectorPublic(s);
            btn.textContent = `${i + 1}. ${s.name}${pub ? '' : ' 🔒'}`;
            btn.addEventListener('click', () => {
                stopPreview();
                sectorIndex = i;
                selected = null;
                buildSectorList();
                syncSectorProps();
                draw();
            });
            const up = document.createElement('button');
            up.type = 'button';
            up.className = 'mini';
            up.textContent = '↑';
            up.disabled = i === 0;
            up.addEventListener('click', (e) => {
                e.stopPropagation();
                beginEdit();
                const arr = currentDiff().sectors;
                [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
                sectorIndex = i - 1;
                markDirty();
                buildSectorList();
                draw();
            });
            const del = document.createElement('button');
            del.type = 'button';
            del.className = 'mini danger';
            del.textContent = '×';
            del.addEventListener('click', (e) => {
                e.stopPropagation();
                if (currentDiff().sectors.length <= 1) return;
                if (!confirm(`Smazat sektor „${s.name}“?`)) return;
                beginEdit();
                currentDiff().sectors.splice(i, 1);
                sectorIndex = Math.min(sectorIndex, currentDiff().sectors.length - 1);
                selected = null;
                markDirty();
                buildSectorList();
                syncSectorProps();
                draw();
            });
            li.appendChild(btn);
            li.appendChild(up);
            li.appendChild(del);
            sectorList.appendChild(li);
        });
    }

    function syncSectorProps() {
        const s = currentSector();
        propName.value = s.name;
        propLavaSpeed.value = s.lavaSpeed;
        propLavaOffset.value = s.lavaStartOffset;
        if (!IS_USER) propPublic.checked = HCLevelStore.isSectorPublic(s);
        buildThemePalette();
        renderSelectionPanel();
        syncMusicUI();
        runValidation(false);
    }

    function canvasPos(e) {
        const rect = canvas.getBoundingClientRect();
        const sx = canvas.width / rect.width;
        const sy = canvas.height / rect.height;
        return {
            x: Math.round((e.clientX - rect.left) * sx),
            y: Math.round((e.clientY - rect.top) * sy),
        };
    }

    function getElementDrawRect(kind, ref) {
        return elementWorldRect(kind, ref);
    }

    function resetPlayRun() {
        const deaths = playState?.deaths ?? 0;
        playState = HCSectorSim.resetPlay(currentSector(), H);
        playState.deaths = deaths;
    }

    function stopPreview() {
        if (!previewPlaying) return;
        previewPlaying = false;
        playState = null;
        if (previewRafId !== null) {
            cancelAnimationFrame(previewRafId);
            previewRafId = null;
        }
        if (btnPlay) {
            btnPlay.classList.remove('active');
            btnPlay.textContent = '▶';
            btnPlay.title = 'Spustit test hratelnosti';
            btnPlay.setAttribute('aria-label', 'Spustit test');
        }
        canvas.style.cursor = 'crosshair';
        draw();
    }

    function startPreview() {
        stopPreview();
        previewPlaying = true;
        playState = HCSectorSim.resetPlay(currentSector(), H);
        previewLast = performance.now();
        drag = null;
        if (btnPlay) {
            btnPlay.classList.add('active');
            btnPlay.textContent = '■';
            btnPlay.title = 'Ukončit test hratelnosti';
            btnPlay.setAttribute('aria-label', 'Ukončit test');
        }
        setStatus('Test hratelnosti — WASD/šipky · mezerník skok · R restart · Stop ukončit', 'ok');
        previewLoop();
    }

    function togglePreview() {
        if (previewPlaying) stopPreview();
        else startPreview();
    }

    function previewLoop() {
        if (!previewPlaying || !playState) return;
        previewRafId = requestAnimationFrame((now) => {
            if (!previewPlaying || !playState) return;
            const dt = Math.min((now - previewLast) / 1000, 0.05);
            previewLast = now;
            const result = HCSectorSim.update(playState, dt);
            if (result.died) {
                HCPickupEffects.clearEffects(playState.activeEffects);
                playState.deaths++;
                const deaths = playState.deaths;
                resetPlayRun();
                setStatus(`Smrt (${deaths}) — R restart · Stop ukončit`, 'warn');
            } else if (result.won) {
                const deaths = playState.deaths;
                resetPlayRun();
                setStatus(`Cíl dosažen! Smrtí: ${deaths} — R restart · Stop ukončit`, 'ok');
            }
            draw();
            previewLoop();
        });
    }

    function handlePlayKeyboard(e) {
        if (!previewPlaying || !playState) return;
        if (e.type === 'keydown') {
            const k = e.key.toLowerCase();
            if (k === 'escape') {
                e.preventDefault();
                stopPreview();
                setStatus('Test ukončen', 'ok');
                return;
            }
            if (k === 'r') {
                e.preventDefault();
                resetPlayRun();
                setStatus('Restart — WASD/šipky · mezerník skok · Stop ukončit', 'ok');
                return;
            }
            playState.keys[k] = true;
            if (e.code === 'Space') playState.keys.space = true;
            if (e.key === ' ' || k === ' ') e.preventDefault();
        } else {
            playState.keys[e.key.toLowerCase()] = false;
            if (e.code === 'Space') playState.keys.space = false;
        }
    }

    function elementHasRect(kind) {
        return kind !== 'spawn';
    }

    function getSelectedRect() {
        if (!selected || !selected.ref) return null;
        const r = selected.ref;
        return {
            x: r.x,
            y: r.y,
            w: r.w || 11,
            h: r.h || 15,
        };
    }

    function getCornerPoints(rect) {
        const { x, y, w, h } = rect;
        return [
            { id: 'nw', cx: x, cy: y },
            { id: 'ne', cx: x + w, cy: y },
            { id: 'sw', cx: x, cy: y + h },
            { id: 'se', cx: x + w, cy: y + h },
        ];
    }

    function getHandleDrawRect(corner) {
        const s = HANDLE_DRAW;
        const { id, cx, cy } = corner;
        if (id === 'nw') return { x: cx - s, y: cy - s, w: s, h: s };
        if (id === 'ne') return { x: cx, y: cy - s, w: s, h: s };
        if (id === 'sw') return { x: cx - s, y: cy, w: s, h: s };
        return { x: cx, y: cy, w: s, h: s };
    }

    function drawSelectionOutline(rect) {
        const { x, y, w, h } = rect;
        ctx.strokeStyle = 'rgba(255, 160, 96, 0.85)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 2]);
        ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
        ctx.setLineDash([]);
    }

    function hitTestResizeHandle(x, y) {
        if (!selected || !elementHasRect(selected.kind)) return null;
        const rect = getSelectedRect();
        const hit = HANDLE_HIT;
        for (const c of getCornerPoints(rect)) {
            if (x >= c.cx - hit && x <= c.cx + hit && y >= c.cy - hit && y <= c.cy + hit) {
                return c.id;
            }
        }
        return null;
    }

    function clampRectToCanvas(rect) {
        let { x, y, w, h } = rect;
        w = Math.max(MIN_ELEM_SIZE, Math.min(w, W));
        h = Math.max(MIN_ELEM_SIZE, Math.min(h, H));
        x = Math.max(0, Math.min(x, W - w));
        y = Math.max(0, Math.min(y, H - h));
        return { x, y, w, h };
    }

    function applyResize(handle, orig, dx, dy) {
        let x = orig.x;
        let y = orig.y;
        let w = orig.w;
        let h = orig.h;

        if (handle.includes('e')) {
            w = Math.max(MIN_ELEM_SIZE, orig.w + dx);
        }
        if (handle.includes('w')) {
            const newW = Math.max(MIN_ELEM_SIZE, orig.w - dx);
            x = orig.x + orig.w - newW;
            w = newW;
        }
        if (handle.includes('s')) {
            h = Math.max(MIN_ELEM_SIZE, orig.h + dy);
        }
        if (handle.includes('n')) {
            const newH = Math.max(MIN_ELEM_SIZE, orig.h - dy);
            y = orig.y + orig.h - newH;
            h = newH;
        }

        return clampRectToCanvas({
            x: Math.round(x),
            y: Math.round(y),
            w: Math.round(w),
            h: Math.round(h),
        });
    }

    function drawResizeHandles(rect) {
        ctx.fillStyle = 'rgba(255, 160, 96, 0.9)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.lineWidth = 1;
        for (const c of getCornerPoints(rect)) {
            const r = getHandleDrawRect(c);
            ctx.fillRect(r.x, r.y, r.w, r.h);
            ctx.strokeRect(r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1);
        }
    }

    function updateCanvasCursor(p) {
        if (drag) return;
        if (tool === 'select' && selected && elementHasRect(selected.kind)) {
            const handle = hitTestResizeHandle(p.x, p.y);
            if (handle) {
                canvas.style.cursor = RESIZE_CURSORS[handle];
                return;
            }
            if (hitTest(p.x, p.y) === selected) {
                canvas.style.cursor = 'move';
                return;
            }
        }
        canvas.style.cursor = 'crosshair';
    }

    function normalizeRect(x0, y0, x1, y1) {
        return {
            x: Math.min(x0, x1),
            y: Math.min(y0, y1),
            w: Math.max(1, Math.abs(x1 - x0)),
            h: Math.max(1, Math.abs(y1 - y0)),
        };
    }

    /** @returns {{kind:string, index:number, ref:object}|null} */
    function hitTest(x, y) {
        const s = currentSector();
        const pt = { x, y, w: 1, h: 1 };

        function hitRect(r) {
            return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
        }

        if (s.spawn && hitRect({ x: s.spawn.x, y: s.spawn.y, w: 11, h: 15 })) {
            return { kind: 'spawn', index: 0, ref: s.spawn };
        }
        if (s.goal && hitRect(s.goal)) return { kind: 'goal', index: 0, ref: s.goal };

        for (let i = s.movers.length - 1; i >= 0; i--) {
            const m = s.movers[i];
            if (hitRect(m)) return { kind: 'mover', index: i, ref: m };
        }
        for (let i = s.pulses.length - 1; i >= 0; i--) {
            const p = s.pulses[i];
            if (hitRect(p)) return { kind: 'pulse', index: i, ref: p };
        }
        for (let i = (s.pickups || []).length - 1; i >= 0; i--) {
            const pk = s.pickups[i];
            if (hitRect(pk)) return { kind: 'pickup', index: i, ref: pk };
        }
        for (let i = s.spikes.length - 1; i >= 0; i--) {
            if (hitRect(s.spikes[i])) return { kind: 'spike', index: i, ref: s.spikes[i] };
        }
        for (let i = s.crumble.length - 1; i >= 0; i--) {
            if (hitRect(s.crumble[i])) return { kind: 'crumble', index: i, ref: s.crumble[i] };
        }
        for (let i = s.solids.length - 1; i >= 0; i--) {
            if (hitRect(s.solids[i])) return { kind: 'solid', index: i, ref: s.solids[i] };
        }
        return null;
    }

    function defaultSize(kind) {
        if (kind === 'spawn') return { w: 11, h: 15 };
        if (kind === 'goal') return { w: 44, h: 40 };
        if (kind === 'mover') return { w: 16, h: 16 };
        if (kind === 'pulse') return { w: 120, h: 6 };
        if (kind === 'pickup') return { w: 14, h: 14 };
        if (kind === 'crumble') return { w: 56, h: 11 };
        if (kind === 'spike') return { w: 80, h: 12 };
        return { w: 80, h: 40 };
    }

    function addElement(kind, rect) {
        beginEdit();
        const s = currentSector();
        const base = { ...rect };
        if (kind === 'spawn') {
            s.spawn = { x: base.x, y: base.y };
        } else if (kind === 'goal') {
            const el = { x: base.x, y: base.y, w: base.w, h: base.h };
            HCPlayerTouch.applyDefaults(el, 'goal');
            s.goal = el;
        } else if (kind === 'solid') {
            const el = { x: base.x, y: base.y, w: base.w, h: base.h };
            HCPlayerTouch.applyDefaults(el, 'solid');
            s.solids.push(el);
            selected = { kind: 'solid', index: s.solids.length - 1, ref: s.solids.at(-1) };
        } else if (kind === 'crumble') {
            const el = { x: base.x, y: base.y, w: base.w, h: base.h };
            HCPlayerTouch.applyDefaults(el, 'crumble');
            HCCrumblePlatform.applyDefaults(el);
            s.crumble.push(el);
            selected = { kind: 'crumble', index: s.crumble.length - 1, ref: s.crumble.at(-1) };
        } else if (kind === 'spike') {
            const el = { x: base.x, y: base.y, w: base.w, h: base.h };
            HCPlayerTouch.applyDefaults(el, 'spike');
            s.spikes.push(el);
            selected = { kind: 'spike', index: s.spikes.length - 1, ref: s.spikes.at(-1) };
        } else if (kind === 'mover') {
            const el = {
                x: base.x, y: base.y, w: base.w, h: base.h,
                amp: 30, spd: 1, phase: 0,
                axis: base.w >= base.h ? 'x' : 'y',
            };
            HCPlayerTouch.applyDefaults(el, 'mover');
            s.movers.push(el);
            selected = { kind: 'mover', index: s.movers.length - 1, ref: s.movers.at(-1) };
        } else if (kind === 'pulse') {
            const el = { x: base.x, y: base.y, w: base.w, h: base.h, period: 1.2, phase: 0 };
            HCPlayerTouch.applyDefaults(el, 'pulse');
            s.pulses.push(el);
            selected = { kind: 'pulse', index: s.pulses.length - 1, ref: s.pulses.at(-1) };
        } else if (kind === 'pickup') {
            if (!s.pickups) s.pickups = [];
            const defFx = HCPickupEffects.PICKUP_EFFECTS.speed;
            const el = {
                x: base.x, y: base.y, w: base.w, h: base.h,
                effectType: 'speed',
                strength: defFx.defaultStrength,
                duration: defFx.defaultDuration,
            };
            HCPlayerTouch.applyDefaults(el, 'pickup');
            s.pickups.push(el);
            selected = { kind: 'pickup', index: s.pickups.length - 1, ref: s.pickups.at(-1) };
        }
        markDirty();
        renderSelectionPanel();
        draw();
    }

    function cloneElementData(kind, ref) {
        const d = HCLevelStore.deepClone(ref);
        delete d.broken;
        delete d.stress;
        delete d.occupied;
        delete d.collected;
        return d;
    }

    function selectElement(kind, index, ref) {
        selected = { kind, index, ref };
        renderSelectionPanel();
    }

    function insertElementFromData(kind, data, offsetX, offsetY) {
        beginEdit();
        const s = currentSector();
        const ox = offsetX ?? 0;
        const oy = offsetY ?? 0;
        const d = cloneElementData(kind, data);
        d.x = Math.round(d.x + ox);
        d.y = Math.round(d.y + oy);

        if (kind === 'spawn') {
            s.spawn = { x: d.x, y: d.y };
            selectElement('spawn', 0, s.spawn);
        } else if (kind === 'goal') {
            s.goal = d;
            selectElement('goal', 0, s.goal);
        } else if (kind === 'solid') {
            s.solids.push(d);
            HCPlayerTouch.applyDefaults(d, 'solid');
            selectElement('solid', s.solids.length - 1, s.solids.at(-1));
        } else if (kind === 'crumble') {
            s.crumble.push(d);
            HCPlayerTouch.applyDefaults(d, 'crumble');
            HCCrumblePlatform.applyDefaults(d);
            selectElement('crumble', s.crumble.length - 1, s.crumble.at(-1));
        } else if (kind === 'spike') {
            s.spikes.push(d);
            HCPlayerTouch.applyDefaults(d, 'spike');
            selectElement('spike', s.spikes.length - 1, s.spikes.at(-1));
        } else if (kind === 'mover') {
            s.movers.push(d);
            HCPlayerTouch.applyDefaults(d, 'mover');
            selectElement('mover', s.movers.length - 1, s.movers.at(-1));
        } else if (kind === 'pulse') {
            s.pulses.push(d);
            HCPlayerTouch.applyDefaults(d, 'pulse');
            selectElement('pulse', s.pulses.length - 1, s.pulses.at(-1));
        } else if (kind === 'pickup') {
            if (!s.pickups) s.pickups = [];
            s.pickups.push(d);
            HCPlayerTouch.applyDefaults(d, 'pickup');
            selectElement('pickup', s.pickups.length - 1, s.pickups.at(-1));
        }
        markDirty();
        draw();
    }

    function copySelected() {
        if (!selected) return false;
        clipboard = {
            kind: selected.kind,
            data: cloneElementData(selected.kind, selected.ref),
        };
        setStatus(`Zkopírováno: ${selected.kind}`, 'ok');
        return true;
    }

    function pasteClipboard() {
        if (!clipboard) {
            setStatus('Schránka je prázdná', 'warn');
            return false;
        }
        insertElementFromData(clipboard.kind, clipboard.data, PASTE_OFFSET, PASTE_OFFSET);
        setStatus(`Vloženo: ${clipboard.kind}`, 'ok');
        return true;
    }

    function cutSelected() {
        if (!selected) return false;
        if (!copySelected()) return false;
        const kind = selected.kind;
        if (kind === 'goal') {
            setStatus('Cíl zkopírován (smazat nelze)', 'warn');
            return true;
        }
        deleteSelected();
        setStatus(`Vyjmuto: ${kind}`, 'ok');
        return true;
    }

    function duplicateSelected() {
        if (!selected) return false;
        insertElementFromData(selected.kind, selected.ref, PASTE_OFFSET, PASTE_OFFSET);
        setStatus(`Duplikováno: ${selected.kind}`, 'ok');
        return true;
    }

    function isTypingTarget(el) {
        if (!el) return false;
        const tag = el.tagName;
        return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
    }

    function inputHasTextSelection(el) {
        if (!el) return false;
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            return el.selectionStart != null && el.selectionEnd != null && el.selectionStart !== el.selectionEnd;
        }
        return false;
    }

    function canHandleObjectShortcut(e) {
        if (!e.ctrlKey && !e.metaKey) return false;
        const key = e.key.toLowerCase();
        if (!['c', 'v', 'x', 'd'].includes(key)) return false;
        if (isTypingTarget(document.activeElement) && inputHasTextSelection(document.activeElement)) return false;
        if (key === 'v') return true;
        return !!selected;
    }

    function handleObjectShortcut(e) {
        const key = e.key.toLowerCase();
        e.preventDefault();
        if (key === 'c') copySelected();
        else if (key === 'v') pasteClipboard();
        else if (key === 'x') cutSelected();
        else if (key === 'd') duplicateSelected();
    }

    function handleKeyboard(e) {
        if (previewPlaying) {
            if (e.ctrlKey || e.metaKey) {
                const key = e.key.toLowerCase();
                if (key === 's') {
                    e.preventDefault();
                    if (e.shiftKey) saveToProject();
                    else save();
                    return;
                }
                if (key === 'z' || key === 'y') {
                    e.preventDefault();
                    return;
                }
            }
            handlePlayKeyboard(e);
            return;
        }

        if (e.ctrlKey || e.metaKey) {
            const key = e.key.toLowerCase();
            if (key === 's') {
                e.preventDefault();
                if (e.shiftKey) saveToProject();
                else save();
                return;
            }
            if (!isTypingTarget(document.activeElement)) {
                if (key === 'z' && !e.shiftKey) {
                    e.preventDefault();
                    undoEdit();
                    return;
                }
                if (key === 'y' || (key === 'z' && e.shiftKey)) {
                    e.preventDefault();
                    redoEdit();
                    return;
                }
            }
            if (canHandleObjectShortcut(e)) {
                handleObjectShortcut(e);
                return;
            }
        }

        if (isTypingTarget(document.activeElement)) return;

        if (e.key === 'Delete' || e.key === 'Backspace') {
            if (selected) {
                e.preventDefault();
                const kind = selected.kind;
                if (kind === 'goal') {
                    setStatus('Cíl nelze smazat', 'warn');
                    return;
                }
                deleteSelected();
                setStatus(kind === 'spawn' ? 'Spawn resetován na výchozí' : `Smazáno: ${kind}`, 'ok');
            }
            return;
        }
    }

    function deleteSelected() {
        if (!selected) return;
        const s = currentSector();
        const { kind, index } = selected;
        if (kind === 'goal') return;
        beginEdit();
        if (kind === 'spawn') s.spawn = { x: 48, y: H - 55 };
        else if (kind === 'solid' && s.solids.length > 1) s.solids.splice(index, 1);
        else if (kind === 'crumble') s.crumble.splice(index, 1);
        else if (kind === 'spike') s.spikes.splice(index, 1);
        else if (kind === 'mover') s.movers.splice(index, 1);
        else if (kind === 'pulse') s.pulses.splice(index, 1);
        else if (kind === 'pickup') (s.pickups || []).splice(index, 1);
        selected = null;
        markDirty();
        renderSelectionPanel();
        draw();
    }

    function renderSelectionPanel() {
        if (!selected) {
            selectionPanel.innerHTML = '<p class="hint">Klikni na prvek, táhni pro přesun nebo za roh pro změnu velikosti.</p>';
            return;
        }
        const r = selected.ref;
        const kind = selected.kind;
        let extra = '';
        if (kind === 'mover') {
            const moverAxis = r.axis === 'y' ? 'y' : 'x';
            extra = `
                <div class="field-row">
                    <div class="field"><label>Amp</label><input type="number" id="selAmp" value="${r.amp}"></div>
                    <div class="field"><label>Spd</label><input type="number" step="0.05" id="selSpd" value="${r.spd}"></div>
                </div>
                <div class="field-row">
                    <div class="field"><label>Phase</label><input type="number" step="0.05" id="selPhase" value="${r.phase}"></div>
                    <div class="field">
                        <label>Směr pohybu</label>
                        <select id="selAxis">
                            <option value="x"${moverAxis === 'x' ? ' selected' : ''}>Vodorovně</option>
                            <option value="y"${moverAxis === 'y' ? ' selected' : ''}>Svisle</option>
                        </select>
                    </div>
                </div>
                <p class="hint">Vodorovně = pohyb do stran, svisle = pohyb nahoru a dolů. Čárkovaná čára v editoru ukazuje rozsah.</p>`;
        }
        if (kind === 'pulse') {
            extra = `
                <div class="field-row">
                    <div class="field"><label>Perioda (s)</label><input type="number" step="0.05" id="selPeriod" value="${r.period}"></div>
                    <div class="field"><label>Phase</label><input type="number" step="0.05" id="selPhase" value="${r.phase}"></div>
                </div>`;
        }
        if (kind === 'crumble') {
            HCCrumblePlatform.applyDefaults(r);
            const when = r.crumbleWhen || 'touch';
            extra = `
                <div class="field">
                    <label>Rozpad</label>
                    <select id="selCrumbleWhen">
                        <option value="touch"${when === 'touch' ? ' selected' : ''}>Od dotyku (při dopadu)</option>
                        <option value="leave"${when === 'leave' ? ' selected' : ''}>Po opuštění</option>
                    </select>
                </div>
                <p class="hint">Od dotyku: odpočítávání začne při dopadu. Po opuštění: plošina drží, rozpadne se až když hráče opustí.</p>`;
        }
        if (kind === 'pickup') {
            const fxOpts = HCPickupEffects.EFFECT_ORDER.map((id) => {
                const fx = HCPickupEffects.PICKUP_EFFECTS[id];
                const sel = (r.effectType || 'speed') === id ? ' selected' : '';
                return `<option value="${id}"${sel}>${fx.label}</option>`;
            }).join('');
            const fxDef = HCPickupEffects.PICKUP_EFFECTS[r.effectType || 'speed'];
            const isFlip = (r.effectType || 'speed') === 'flip_scene';
            const isSize = (r.effectType || 'speed') === 'player_size';
            extra = `
                <p class="hint">${fxDef?.desc || 'Dočasný efekt po sebrání.'}</p>
                <div class="field">
                    <label>Typ efektu</label>
                    <select id="selEffectType">${fxOpts}</select>
                </div>
                <div class="field-row">
                    <div class="field"><label>Síla</label><input type="number" step="0.05" min="0.05" id="selStrength" value="${r.strength ?? fxDef?.defaultStrength ?? 1}"></div>
                    <div class="field"><label>Trvání (s)</label><input type="number" step="0.1" min="0.1" id="selDuration" value="${r.duration ?? fxDef?.defaultDuration ?? 3}"></div>
                </div>
                ${isSize ? '<p class="hint">Síla = násobitel velikosti (0.5 = poloviční, 1.5 = o 50&nbsp;% větší).</p>' : ''}
                ${isFlip ? `
                <div class="field">
                    <label class="checkbox-label"><input type="checkbox" id="selFlipGravity" ${r.flipGravity !== false ? 'checked' : ''}> Obrátit i gravitaci</label>
                </div>
                <p class="hint">Vypnuto = scéna je jen vizuálně převrácená, pohyb zůstane normální.</p>` : ''}`;
        }

        const hasRect = kind !== 'spawn';
        selectionPanel.innerHTML = `
            <p class="hint">Typ: <strong>${kind}</strong></p>
            ${hasRect ? `
            <div class="field-row">
                <div class="field"><label>X</label><input type="number" id="selX" value="${Math.round(r.x)}"></div>
                <div class="field"><label>Y</label><input type="number" id="selY" value="${Math.round(r.y)}"></div>
            </div>
            <div class="field-row">
                <div class="field"><label>Šířka</label><input type="number" id="selW" value="${Math.round(r.w || 11)}" min="1"></div>
                <div class="field"><label>Výška</label><input type="number" id="selH" value="${Math.round(r.h || 15)}" min="1"></div>
            </div>` : `
            <div class="field-row">
                <div class="field"><label>X</label><input type="number" id="selX" value="${Math.round(r.x)}"></div>
                <div class="field"><label>Y</label><input type="number" id="selY" value="${Math.round(r.y)}"></div>
            </div>`}
            ${extra}
            ${playerTouchPanelHtml(r, kind)}
            ${playerReactPanelHtml(r)}
            <button type="button" class="danger" id="selDelete">Smazat prvek</button>`;

        const bind = (id, key, parseFn) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.addEventListener('change', () => {
                beginEdit();
                r[key] = parseFn(el.value);
                markDirty();
                draw();
            });
        };
        bind('selX', 'x', Number);
        bind('selY', 'y', Number);
        if (hasRect) {
            bind('selW', 'w', Number);
            bind('selH', 'h', Number);
        }
        bind('selAmp', 'amp', Number);
        bind('selSpd', 'spd', Number);
        bind('selPhase', 'phase', Number);
        bind('selPeriod', 'period', Number);
        bind('selStrength', 'strength', Number);
        bind('selDuration', 'duration', Number);
        bindPlayerTouchFields(r, kind);
        bindPlayerReactFields(r);
        const crumbleWhenEl = document.getElementById('selCrumbleWhen');
        if (crumbleWhenEl) {
            crumbleWhenEl.addEventListener('change', () => {
                beginEdit();
                r.crumbleWhen = crumbleWhenEl.value;
                markDirty();
                draw();
            });
        }
        const effectTypeEl = document.getElementById('selEffectType');
        if (effectTypeEl) {
            effectTypeEl.addEventListener('change', () => {
                beginEdit();
                r.effectType = effectTypeEl.value;
                const fx = HCPickupEffects.PICKUP_EFFECTS[r.effectType];
                if (fx && r.strength == null) r.strength = fx.defaultStrength;
                if (fx && r.duration == null) r.duration = fx.defaultDuration;
                if (r.effectType === 'flip_scene' && r.flipGravity == null) r.flipGravity = true;
                markDirty();
                renderSelectionPanel();
                draw();
            });
        }
        const flipGravityEl = document.getElementById('selFlipGravity');
        if (flipGravityEl) {
            flipGravityEl.addEventListener('change', () => {
                beginEdit();
                r.flipGravity = flipGravityEl.checked;
                markDirty();
                draw();
            });
        }
        const axisEl = document.getElementById('selAxis');
        if (axisEl) {
            axisEl.addEventListener('change', () => {
                beginEdit();
                r.axis = axisEl.value;
                markDirty();
                draw();
            });
        }
        document.getElementById('selDelete')?.addEventListener('click', deleteSelected);
    }

    function draw() {
        const s = previewPlaying && playState ? playState.sector : currentSector();
        const th = theme();
        const previewMods = previewPlaying && playState
            ? HCPickupEffects.getPhysicsModifiers(playState.activeEffects)
            : null;
        const sceneFlipped = HCPickupEffects.beginSceneFlipDraw(ctx, H, !!previewMods?.flipScene);

        ctx.fillStyle = th.bg;
        ctx.fillRect(0, 0, W, H);

        const lavaY = previewPlaying && playState
            ? playState.lavaY
            : H + currentSector().lavaStartOffset - 80;
        const grad = ctx.createLinearGradient(0, lavaY, 0, H);
        grad.addColorStop(0, th.lavaTop);
        grad.addColorStop(0.35, th.lavaMid);
        grad.addColorStop(1, th.lavaBot);
        ctx.fillStyle = grad;
        ctx.fillRect(0, lavaY, W, H - lavaY);
        ctx.strokeStyle = th.lavaLine;
        ctx.lineWidth = previewPlaying ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(0, lavaY);
        ctx.lineTo(W, lavaY);
        ctx.stroke();
        ctx.lineWidth = 1;

        for (const r of s.solids) {
            const base = { x: r.x, y: r.y, w: r.w, h: r.h };
            if (!previewPlaying && HCPlayerReact.enabled(r)) drawReactAnchor(base);
            const dr = previewPlaying && playState && HCPlayerReact.enabled(r)
                ? HCPlayerReact.apply(r, base) : base;
            ctx.fillStyle = th.solid;
            ctx.strokeStyle = th.solidStroke;
            ctx.fillRect(dr.x, dr.y, dr.w, dr.h);
            ctx.strokeRect(dr.x + 0.5, dr.y + 0.5, dr.w - 1, dr.h - 1);
        }
        for (const r of s.crumble) {
            if (previewPlaying && r.broken) continue;
            const base = { x: r.x, y: r.y, w: r.w, h: r.h };
            if (!previewPlaying && HCPlayerReact.enabled(r)) drawReactAnchor(base);
            const dr = previewPlaying && playState && HCPlayerReact.enabled(r)
                ? HCPlayerReact.apply(r, base) : base;
            if (previewPlaying && r.stress > 0) {
                const remain = r.stress / HCCrumblePlatform.CRUMBLE_TIME;
                const heat = 1 - remain;
                ctx.fillStyle = HCSectorSim.parseCrumbleColor(th, heat);
            } else {
                ctx.fillStyle = th.crumbleCool;
            }
            ctx.fillRect(dr.x, dr.y, dr.w, dr.h);
            ctx.strokeStyle = th.lavaLine;
            ctx.strokeRect(dr.x + 0.5, dr.y + 0.5, dr.w - 1, dr.h - 1);
        }
        for (const r of s.spikes) {
            const base = { x: r.x, y: r.y, w: r.w, h: r.h };
            if (!previewPlaying && HCPlayerReact.enabled(r)) drawReactAnchor(base);
            const dr = previewPlaying && playState && HCPlayerReact.enabled(r)
                ? HCPlayerReact.apply(r, base) : base;
            if (window.HCSpikeDraw) HCSpikeDraw.drawSpikeBlock(ctx, dr.x, dr.y, dr.w, dr.h, th.spike);
            else { ctx.fillStyle = th.spike; ctx.fillRect(dr.x, dr.y, dr.w, dr.h); }
        }
        for (const m of s.movers) {
            if (!previewPlaying) drawMoverMotionGuide(m, th);
            const base = previewPlaying && playState
                ? HCSectorSim.moverRect(m, playState.t)
                : { x: m.x, y: m.y, w: m.w, h: m.h };
            if (!previewPlaying && HCPlayerReact.enabled(m)) drawReactAnchor(base);
            const dr = previewPlaying && playState && HCPlayerReact.enabled(m)
                ? HCPlayerReact.apply(m, base) : base;
            ctx.fillStyle = th.mover;
            if (previewPlaying) {
                ctx.shadowColor = th.moverGlow;
                ctx.shadowBlur = 12;
            }
            ctx.fillRect(dr.x, dr.y, dr.w, dr.h);
            ctx.shadowBlur = 0;
        }
        for (const p of s.pulses) {
            const base = { x: p.x, y: p.y, w: p.w, h: p.h };
            if (!previewPlaying && HCPlayerReact.enabled(p)) drawReactAnchor(base);
            const dr = previewPlaying && playState && HCPlayerReact.enabled(p)
                ? HCPlayerReact.apply(p, base) : base;
            const on = previewPlaying && playState && HCSectorSim.pulseActive(p, playState.t);
            ctx.fillStyle = on ? th.pulseOn : th.pulseOff;
            ctx.strokeStyle = on ? th.pulseStrokeOn : th.pulseStrokeOff;
            ctx.fillRect(dr.x, dr.y, dr.w, dr.h);
            ctx.strokeRect(dr.x + 0.5, dr.y + 0.5, dr.w - 1, dr.h - 1);
        }
        for (const pk of s.pickups || []) {
            if (previewPlaying && pk.collected) continue;
            const base = { x: pk.x, y: pk.y, w: pk.w, h: pk.h };
            if (!previewPlaying && HCPlayerReact.enabled(pk)) drawReactAnchor(base);
            const dr = previewPlaying && playState && HCPlayerReact.enabled(pk)
                ? HCPlayerReact.apply(pk, base) : base;
            const cx = dr.x + dr.w / 2;
            const cy = dr.y + dr.h / 2;
            const pulseT = previewPlaying && playState ? playState.t : 0;
            const pulse = 0.85 + Math.sin(pulseT * 6 + cx * 0.02) * 0.15;
            const pkColors = HCPickupEffects.getPickupColors(th, pk.effectType || 'speed');
            ctx.fillStyle = pkColors.fill;
            ctx.shadowColor = pkColors.glow;
            ctx.shadowBlur = previewPlaying ? 14 * pulse : 8;
            ctx.beginPath();
            ctx.arc(cx, cy, Math.min(pk.w, pk.h) * 0.45 * pulse, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.strokeStyle = pkColors.glow;
            ctx.stroke();
            if (!previewPlaying) {
                const fx = HCPickupEffects.PICKUP_EFFECTS[pk.effectType || 'speed'];
                ctx.fillStyle = 'rgba(255,255,255,0.85)';
                ctx.font = '8px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(fx ? fx.label.slice(0, 4) : '?', cx, cy + 3);
            }
        }
        if (s.goal) {
            const gBase = { x: s.goal.x, y: s.goal.y, w: s.goal.w, h: s.goal.h };
            if (!previewPlaying && HCPlayerReact.enabled(s.goal)) drawReactAnchor(gBase);
            const g = previewPlaying && playState && HCPlayerReact.enabled(s.goal)
                ? HCPlayerReact.apply(s.goal, gBase) : gBase;
            ctx.fillStyle = th.goalFill;
            ctx.strokeStyle = th.goalStroke;
            ctx.lineWidth = 2;
            ctx.fillRect(g.x, g.y, g.w, g.h);
            ctx.strokeRect(g.x + 0.5, g.y + 0.5, g.w - 1, g.h - 1);
        }
        if (previewPlaying && playState) {
            const p = playState.player;
            const pw = p.w ?? HCSectorSim.PLAYER_W;
            const ph = p.h ?? HCSectorSim.PLAYER_H;
            ctx.fillStyle = th.player;
            ctx.fillRect(p.x, p.y, pw, ph);
            if (previewMods.shield) {
                const shieldColors = HCPickupEffects.getPickupColors(th, 'shield');
                ctx.strokeStyle = shieldColors.glow;
                ctx.lineWidth = 2;
                ctx.shadowColor = shieldColors.glow;
                ctx.shadowBlur = 8;
            } else {
                ctx.strokeStyle = th.playerStroke;
                ctx.lineWidth = 1;
            }
            ctx.strokeRect(p.x + 0.5, p.y + 0.5, pw - 1, ph - 1);
            ctx.shadowBlur = 0;
        } else if (s.spawn) {
            ctx.fillStyle = th.player;
            ctx.fillRect(s.spawn.x, s.spawn.y, 11, 15);
            ctx.strokeStyle = th.playerStroke;
            ctx.strokeRect(s.spawn.x + 0.5, s.spawn.y + 0.5, 10, 14);
        }

        if (previewPlaying) {
            ctx.fillStyle = 'rgba(255,255,255,0.04)';
            ctx.fillRect(0, 0, W, H);
        }

        HCPickupEffects.endSceneFlipDraw(ctx, sceneFlipped);

        if (previewPlaying && playState) {
            const primaryFx = HCPickupEffects.getPrimaryEffect(playState.activeEffects);
            if (primaryFx) {
                const p = playState.player;
                const pw = p.w ?? HCSectorSim.PLAYER_W;
                const fxColors = HCPickupEffects.getPickupColors(th, primaryFx.effectType);
                ctx.fillStyle = fxColors.glow;
                ctx.font = '9px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(`${primaryFx.remaining.toFixed(1)}s`, p.x + pw / 2, p.y - 4);
            }
        }

        if (selected && selected.ref && !previewPlaying) {
            const dr = getElementDrawRect(selected.kind, selected.ref);
            drawSelectionOutline(dr);
            if (elementHasRect(selected.kind) && !previewPlaying) {
                drawResizeHandles(dr);
            }
        }

        if (drag && drag.preview) {
            ctx.strokeStyle = 'rgba(255, 160, 96, 0.65)';
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 2]);
            ctx.strokeRect(drag.preview.x + 0.5, drag.preview.y + 0.5, drag.preview.w - 1, drag.preview.h - 1);
            ctx.setLineDash([]);
        }
    }

    function runValidation(showAlert) {
        const result = HC_JUMP.validateSectorDetailed(currentSector());
        validationList.innerHTML = '';
        for (const step of result.chain) {
            const li = document.createElement('li');
            li.className = step.ok ? 'pass' : 'fail';
            li.textContent = `${step.ok ? '✓' : '✗'} ${step.label} — mezera ${step.gapX}px, ↑${step.dy}px`;
            validationList.appendChild(li);
        }
        if (result.ok) {
            setStatus(result.reason, 'ok');
        } else {
            setStatus(result.reason, 'err');
            if (showAlert) alert(result.reason);
        }
        return result.ok;
    }

    canvas.addEventListener('mousedown', (e) => {
        if (previewPlaying) return;
        canvas.focus({ preventScroll: true });
        const p = canvasPos(e);
        if (tool === 'delete') {
            selected = hitTest(p.x, p.y);
            if (selected) deleteSelected();
            return;
        }
        if (tool === 'select') {
            if (selected && elementHasRect(selected.kind)) {
                const handle = hitTestResizeHandle(p.x, p.y);
                if (handle) {
                    const rect = getSelectedRect();
                    drag = { mode: 'resize', handle, start: p, orig: { ...rect } };
                    draw();
                    return;
                }
            }
            selected = hitTest(p.x, p.y);
            if (selected) {
                drag = { mode: 'move', start: p, orig: { ...selected.ref } };
            }
            renderSelectionPanel();
            draw();
            return;
        }
        if (tool === 'spawn') {
            addElement('spawn', { x: p.x, y: p.y, w: 11, h: 15 });
            selected = { kind: 'spawn', index: 0, ref: currentSector().spawn };
            return;
        }
        drag = { mode: 'create', kind: tool, start: p, preview: null };
    });

    canvas.addEventListener('mousemove', (e) => {
        const p = canvasPos(e);
        if (previewPlaying) {
            canvas.style.cursor = 'default';
            return;
        }
        if (!drag) {
            updateCanvasCursor(p);
            return;
        }
        if (drag.mode === 'create') {
            const def = defaultSize(drag.kind);
            drag.preview = normalizeRect(drag.start.x, drag.start.y, p.x, p.y);
            if (drag.preview.w < 4 && drag.preview.h < 4) {
                drag.preview.w = def.w;
                drag.preview.h = def.h;
            }
            draw();
        } else if (drag.mode === 'resize' && selected) {
            const dx = p.x - drag.start.x;
            const dy = p.y - drag.start.y;
            const newRect = applyResize(drag.handle, drag.orig, dx, dy);
            if (!drag.historyPushed) {
                beginEdit();
                drag.historyPushed = true;
            }
            Object.assign(selected.ref, newRect);
            markDirty();
            renderSelectionPanel();
            draw();
        } else if (drag.mode === 'move' && selected) {
            const dx = p.x - drag.start.x;
            const dy = p.y - drag.start.y;
            const nx = Math.round(drag.orig.x + dx);
            const ny = Math.round(drag.orig.y + dy);
            if (nx === selected.ref.x && ny === selected.ref.y) return;
            if (!drag.historyPushed) {
                beginEdit();
                drag.historyPushed = true;
            }
            selected.ref.x = nx;
            selected.ref.y = ny;
            markDirty();
            renderSelectionPanel();
            draw();
        }
    });

    canvas.addEventListener('mouseup', (e) => {
        if (!drag) return;
        if (drag.mode === 'create') {
            const p = canvasPos(e);
            let rect = normalizeRect(drag.start.x, drag.start.y, p.x, p.y);
            const def = defaultSize(drag.kind);
            if (rect.w < 8 && rect.h < 8) {
                rect = { x: drag.start.x, y: drag.start.y, w: def.w, h: def.h };
            }
            addElement(drag.kind, rect);
        } else if (drag.mode === 'move' || drag.mode === 'resize') {
            markDirty();
        }
        drag = null;
        draw();
    });

    canvas.addEventListener('mouseleave', () => {
        if (!drag) canvas.style.cursor = 'crosshair';
    });

    document.getElementById('toolBar').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-tool]');
        if (!btn) return;
        stopPreview();
        tool = btn.dataset.tool;
        document.querySelectorAll('#toolBar button').forEach((b) => b.classList.toggle('active', b === btn));
    });

    diffSelect?.addEventListener('change', () => {
        stopPreview();
        diffKey = diffSelect.value;
        sectorIndex = 0;
        selected = null;
        const taglineEl = document.getElementById('diffTagline');
        if (taglineEl) taglineEl.textContent = currentDiff().tagline;
        buildSectorList();
        syncSectorProps();
        draw();
    });

    propName?.addEventListener('change', () => { beginEdit(); currentSector().name = propName.value; markDirty(); buildSectorList(); });
    propLavaSpeed?.addEventListener('change', () => { beginEdit(); currentSector().lavaSpeed = +propLavaSpeed.value; markDirty(); draw(); });
    propLavaOffset?.addEventListener('change', () => { beginEdit(); currentSector().lavaStartOffset = +propLavaOffset.value; markDirty(); draw(); });
    propPublic?.addEventListener('change', () => {
        beginEdit();
        currentSector().public = propPublic.checked;
        markDirty();
        buildSectorList();
    });

    document.getElementById('btnSave')?.addEventListener('click', save);
    document.getElementById('btnSaveProject')?.addEventListener('click', () => { saveToProject(); });
    document.getElementById('btnResetTheme')?.addEventListener('click', resetThemeColors);
    document.getElementById('btnValidate')?.addEventListener('click', () => runValidation(true));
    document.getElementById('btnTest')?.addEventListener('click', () => {
        stopPreview();
        if (dirty && !confirm('Uložit neuložené změny před testem?')) return;
        save();
        if (IS_USER) {
            const data = HCUserPack.fromDifficulty(currentDiff(), userProjectName);
            sessionStorage.setItem('hc_test_pack', HCUserPack.toJson(data));
            window.open(`index.html?custom=1&sector=${sectorIndex}&from=editor`, '_blank');
            return;
        }
        window.open(`index.html?diff=${diffKey}&sector=${sectorIndex}&from=editor`, '_blank');
    });
    document.getElementById('btnAddSector')?.addEventListener('click', () => {
        stopPreview();
        beginEdit();
        const n = currentDiff().sectors.length;
        currentDiff().sectors.push(HCLevelStore.createSectorTemplate(IS_USER ? 'easy' : diffKey, n));
        sectorIndex = n;
        selected = null;
        markDirty();
        buildSectorList();
        syncSectorProps();
        draw();
    });

    const modal = document.getElementById('jsonModal');
    const jsonArea = document.getElementById('jsonArea');
    document.getElementById('btnExport')?.addEventListener('click', () => {
        if (IS_USER) {
            downloadUserPack();
            return;
        }
        jsonArea.value = exportCurrentPackJson();
        document.getElementById('modalTitle').textContent = 'Export JSON — zkopíruj obsah';
        modal.classList.add('visible');
    });
    document.getElementById('btnImport')?.addEventListener('click', () => {
        if (IS_USER) {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json,.hc-pack.json,application/json';
            input.addEventListener('change', async () => {
                const file = input.files?.[0];
                if (!file) return;
                try {
                    stopPreview();
                    const imported = await HCPackGuard.loadUserPackFile(file);
                    beginEdit();
                    userProjectName = imported.projectName;
                    pack = { [CUSTOM_KEY]: HCUserPack.toDifficultyData(imported) };
                    diffKey = CUSTOM_KEY;
                    sectorIndex = 0;
                    selected = null;
                    if (projectNameInput) projectNameInput.value = userProjectName;
                    markDirty();
                    buildSectorList();
                    syncSectorProps();
                    draw();
                    saveUserDraft();
                    setStatus('Sada levelů načtena', 'ok');
                } catch (err) {
                    alert(err.message || String(err));
                }
            });
            input.click();
            return;
        }
        jsonArea.value = '';
        document.getElementById('modalTitle').textContent = 'Import JSON — vlož data a klikni Použít';
        modal.classList.add('visible');
    });
    document.getElementById('modalClose')?.addEventListener('click', () => modal?.classList.remove('visible'));
    document.getElementById('modalApply')?.addEventListener('click', () => {
        try {
            stopPreview();
            const imported = HCLevelStore.importJson(jsonArea.value);
            beginEdit();
            pack = imported;
            migratePackThemes(pack);
            markDirty();
            buildDiffSelect();
            buildSectorList();
            syncSectorProps();
            draw();
            save();
            modal.classList.remove('visible');
            setStatus('Import úspěšný', 'ok');
        } catch (err) {
            alert('Neplatný JSON: ' + err.message);
        }
    });

    document.getElementById('btnReset')?.addEventListener('click', () => {
        stopPreview();
        if (!confirm('Obnovit všechny obtížnosti na výchozí? Uložené úpravy se smažou.')) return;
        beginEdit();
        pack = HCLevelStore.resetToDefaults();
        diffKey = 'medium';
        sectorIndex = 0;
        selected = null;
        dirty = false;
        buildDiffSelect();
        buildSectorList();
        syncSectorProps();
        draw();
        setStatus('Obnoveno výchozí nastavení', 'ok');
    });

    btnPlay?.addEventListener('click', togglePreview);

    btnCopy?.addEventListener('click', () => {
        if (previewPlaying) return;
        if (!selected) {
            setStatus('Nic není vybráno', 'warn');
            return;
        }
        copySelected();
    });

    btnPaste?.addEventListener('click', () => {
        if (previewPlaying) return;
        pasteClipboard();
    });

    function setSidebarPanel(panelId) {
        document.querySelectorAll('.sidebar-tab').forEach((tab) => {
            const active = tab.dataset.sidebarPanel === panelId;
            tab.classList.toggle('active', active);
            tab.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        document.querySelectorAll('.sidebar-panel').forEach((panel) => {
            panel.classList.toggle('active', panel.id === `sidebar${panelId.charAt(0).toUpperCase()}${panelId.slice(1)}`);
        });
    }

    document.querySelectorAll('.sidebar-tab').forEach((tab) => {
        tab.addEventListener('click', () => setSidebarPanel(tab.dataset.sidebarPanel));
    });

    window.addEventListener('keydown', handleKeyboard);
    window.addEventListener('keyup', handlePlayKeyboard);

    window.addEventListener('beforeunload', (e) => {
        if (dirty) {
            e.preventDefault();
            e.returnValue = '';
        }
    });

    projectNameInput?.addEventListener('change', () => {
        if (!IS_USER) return;
        beginEdit();
        userProjectName = HCPackGuard.sanitizeText(projectNameInput.value || 'Můj projekt', 80);
        projectNameInput.value = userProjectName;
        currentDiff().label = userProjectName;
        markDirty();
        setStatus('Název projektu upraven', 'ok');
    });

    musicFileInput?.addEventListener('change', () => {
        const file = musicFileInput.files?.[0];
        applyMusicFile(file);
    });
    btnPreviewMusic?.addEventListener('click', previewMusic);
    btnRemoveMusic?.addEventListener('click', removeMusic);

    configureEditorMode();
    buildDiffSelect();
    buildSectorList();
    syncSectorProps();
    draw();
    setStatus(
        IS_USER
            ? 'Tvůrce map připraven — Uložit do PC stáhne sadu · Načíst z PC otevře soubor'
            : 'Editor připraven — Ctrl+S uložit · Ctrl+Z zpět · Ctrl+Y vpřed · Ctrl+C/V/X/D · Delete smazat výběr',
        'ok'
    );
})();
