// Every DOM read/write in the game funnels through here.

const $ = (id) => document.getElementById(id);

export class Hud {
  constructor() {
    this.el = {
      hud: $('hud'), cross: $('cross'),
      hpNum: $('hpNum'), hpFill: $('hpFill'),
      hgNum: $('hgNum'), hgFill: $('hgFill'),
      stNum: $('stNum'), stFill: $('stFill'),
      brWrap: $('brWrap'), brNum: $('brNum'), brFill: $('brFill'),
      wName: $('wName'), wSub: $('wSub'), wBig: $('wBig'),
      heatFill: $('heatFill'), weapon: $('weapon'),
      objTag: $('objTag'), objText: $('objText'), objHint: $('objHint'),
      stTime: $('stTime'), stBiome: $('stBiome'), stAlt: $('stAlt'),
      stTemp: $('stTemp'), stGrid: $('stGrid'), status: $('status'),
      prompt: $('prompt'), promptKey: $('promptKey'), promptTxt: $('promptTxt'),
      log: $('log'), subtitle: $('subtitle'),
      scanner: $('scanner'), scName: $('scName'), scClass: $('scClass'),
      scRows: $('scRows'), scDesc: $('scDesc'),
      shipHud: $('shipHud'), mechHud: $('mechHud'),
      compassInner: $('compassInner'),
      inv: $('inv'), invGrid: $('invGrid'),
      cine: $('cine'), cineText: $('cineText'),
      death: $('death'), deathReason: $('deathReason'),
      pause: $('pause'), fps: $('fps'),
      loadFill: $('loadFill'), loadStep: $('loadStep'), loading: $('loading'),
      title: $('title'), begin: $('begin'),
      shAlt: $('shAlt'), shSpd: $('shSpd'), shThrPct: $('shThrPct'), throttleFill: $('throttleFill'),
      shMode: $('shMode'), shGear: $('shGear'), shFuel: $('shFuel'), shHull: $('shHull'),
      shHeat: $('shHeat'), shTgt: $('shTgt'), shRange: $('shRange'), shAtt: $('shAtt'),
      shipMsg: $('shipMsg'),
      mcArmor: $('mcArmor'), mcArmorFill: $('mcArmorFill'),
      mcEnergy: $('mcEnergy'), mcEnergyFill: $('mcEnergyFill'),
      mcBoost: $('mcBoost'), mcBoostFill: $('mcBoostFill'),
      mcHeat: $('mcHeat'), mcHeatFill: $('mcHeatFill'),
    };
    this._logs = [];
    this._subTimer = 0;
    this._compassBuilt = false;
    this._lastVit = {};
    this.buildCompass();
  }

  show() { this.el.hud.classList.add('on'); }
  hide() { this.el.hud.classList.remove('on'); }

  progress(p, step) {
    this.el.loadFill.style.width = (p * 100).toFixed(0) + '%';
    if (step) this.el.loadStep.textContent = step;
  }
  hideLoading() { this.el.loading.classList.add('gone'); }

  setBar(fillEl, numEl, value, max) {
    const t = Math.max(0, Math.min(1, value / max));
    fillEl.style.transform = `scaleX(${t})`;
    if (numEl) numEl.textContent = Math.round(value);
  }

  vitals(p) {
    this.setBar(this.el.hpFill, this.el.hpNum, p.health, 100);
    this.setBar(this.el.hgFill, this.el.hgNum, p.hunger, 100);
    this.setBar(this.el.stFill, this.el.stNum, p.stamina, 100);
    const showBreath = (p.breath ?? 100) < 99.5;
    this.el.brWrap.classList.toggle('on', showBreath);
    if (showBreath) this.setBar(this.el.brFill, this.el.brNum, p.breath, 100);
  }

  weapon({ name, sub, big, small, heat = 0, overheat = false, hidden = false }) {
    this.el.weapon.style.display = hidden ? 'none' : '';
    if (hidden) return;
    this.el.wName.textContent = name;
    this.el.wSub.textContent = sub;
    this.el.wBig.innerHTML = small ? `${big}<small> ${small}</small>` : big;
    this.el.heatFill.style.transform = `scaleX(${Math.max(0, Math.min(1, heat))})`;
    this.el.weapon.classList.toggle('overheat', overheat);
  }

  objective(tag, text, hint = '') {
    this.el.objTag.textContent = tag;
    this.el.objText.textContent = text;
    this.el.objHint.textContent = hint;
  }

  status({ time, biome, alt, temp, grid }) {
    this.el.stTime.textContent = time;
    this.el.stBiome.textContent = biome;
    this.el.stAlt.textContent = alt;
    this.el.stTemp.textContent = temp;
    this.el.stGrid.textContent = grid;
  }

  prompt(key, text) {
    if (!text) { this.el.prompt.classList.remove('on'); return; }
    this.el.promptKey.textContent = key;
    this.el.promptTxt.textContent = text;
    this.el.prompt.classList.add('on');
  }

  log(text, kind = '') {
    const d = document.createElement('div');
    if (kind) d.className = kind;
    d.textContent = text;
    this.el.log.appendChild(d);
    const entry = { el: d, t: performance.now() };
    this._logs.push(entry);
    if (this._logs.length > 5) {
      const old = this._logs.shift();
      old.el.remove();
    }
  }

  tickLogs(now) {
    while (this._logs.length && now - this._logs[0].t > 7200) {
      const e = this._logs.shift();
      e.el.style.transition = 'opacity .6s';
      e.el.style.opacity = '0';
      setTimeout(() => e.el.remove(), 650);
    }
  }

  subtitle(text, seconds = 3) {
    if (!text) { this.el.subtitle.classList.remove('on'); return; }
    this.el.subtitle.textContent = text;
    this.el.subtitle.classList.add('on');
    this._subTimer = seconds;
  }

  tickSubtitle(dt) {
    if (this._subTimer > 0) {
      this._subTimer -= dt;
      if (this._subTimer <= 0) this.el.subtitle.classList.remove('on');
    }
  }

  crosshair(visible, hostile = false) {
    this.el.cross.classList.toggle('hidden', !visible);
    this.el.cross.classList.toggle('hostile', hostile);
  }

  scan(data) {
    if (!data) { this.el.scanner.classList.remove('on'); return; }
    this.el.scanner.classList.add('on');
    this.el.scName.textContent = data.name;
    this.el.scClass.textContent = data.klass;
    this.el.scRows.innerHTML = data.rows.map(([k, v, danger]) =>
      `<div class="srow"><span class="k">${k}</span><span class="${danger ? 'danger' : ''}">${v}</span></div>`
    ).join('');
    this.el.scDesc.textContent = data.desc;
  }

  buildCompass() {
    if (this._compassBuilt) return;
    const inner = this.el.compassInner;
    const cards = { 0: 'N', 45: 'NE', 90: 'E', 135: 'SE', 180: 'S', 225: 'SW', 270: 'W', 315: 'NW' };
    // Three copies so the strip can wrap without a seam.
    for (let rep = -1; rep <= 1; rep++) {
      for (let a = 0; a < 360; a += 15) {
        const d = document.createElement('div');
        const isCard = cards[a] !== undefined;
        d.className = 'ctick' + (isCard ? ' card' : '');
        d.textContent = isCard ? cards[a] : String(a).padStart(3, '0');
        d.style.left = ((rep * 360 + a) * 2.6) + 'px';
        inner.appendChild(d);
      }
    }
    this._compassBuilt = true;
  }

  compass(yawDeg, marks = []) {
    const w = this.el.compassInner.parentElement.clientWidth;
    this.el.compassInner.style.transform = `translateX(${w / 2 - yawDeg * 2.6}px)`;
    // Bearing marks (ship, base, waypoints) ride the same strip.
    if (this._markEls) for (const m of this._markEls) m.remove();
    this._markEls = marks.map(m => {
      const d = document.createElement('div');
      d.className = 'cmark';
      d.textContent = m.label;
      d.style.left = (m.bearing * 2.6) + 'px';
      d.style.color = m.color || 'var(--amber)';
      this.el.compassInner.appendChild(d);
      return d;
    });
  }

  vehicle(which) {
    this.el.shipHud.classList.toggle('on', which === 'ship');
    this.el.mechHud.classList.toggle('on', which === 'mech');
    this.el.status.style.display = which === 'ship' ? 'none' : '';
  }

  ship(d) {
    this.el.shAlt.textContent = d.alt;
    this.el.shSpd.textContent = d.speed;
    this.el.shThrPct.textContent = d.throttlePct;
    this.el.throttleFill.style.transform = `scaleX(${d.throttle})`;
    this.el.shMode.textContent = d.mode;
    this.el.shGear.textContent = d.gear;
    this.el.shFuel.textContent = d.fuel;
    this.el.shHull.textContent = d.hull;
    this.el.shHeat.textContent = d.skin;
    this.el.shTgt.textContent = d.target;
    this.el.shRange.textContent = d.range;
    this.el.shAtt.textContent = d.att;
  }
  shipMessage(t) { this.el.shipMsg.textContent = t || ''; }

  mech(d) {
    this.el.mcArmor.textContent = Math.round(d.armor);
    this.el.mcArmorFill.style.transform = `scaleX(${d.armor / d.armorMax})`;
    this.el.mcEnergy.textContent = Math.round(d.energy);
    this.el.mcEnergyFill.style.transform = `scaleX(${d.energy / 100})`;
    this.el.mcBoost.textContent = Math.round(d.boost);
    this.el.mcBoostFill.style.transform = `scaleX(${d.boost / 100})`;
    this.el.mcHeat.textContent = Math.round(d.heat);
    this.el.mcHeatFill.style.transform = `scaleX(${d.heat / 100})`;
  }

  inventory(open, items, onUse) {
    this.el.inv.classList.toggle('on', open);
    if (!open) return;
    this.el.invGrid.innerHTML = '';
    if (!items.length) {
      this.el.invGrid.innerHTML = '<div class="slot"><div class="n">Empty</div><div class="d">Nothing but the suit you stand in.</div></div>';
      return;
    }
    for (const it of items) {
      const d = document.createElement('div');
      d.className = 'slot' + (it.usable ? ' use' : '');
      d.innerHTML = `<div class="n">${it.name}</div><div class="q">×${it.count}${it.tag ? ' · ' + it.tag : ''}</div><div class="d">${it.desc}</div>`;
      if (it.usable) d.addEventListener('click', () => onUse(it.id));
      this.el.invGrid.appendChild(d);
    }
  }

  cinematic(on, text = '') {
    this.el.cine.classList.toggle('on', on);
    if (text) {
      this.el.cineText.textContent = text;
      this.el.cineText.classList.add('on');
    } else {
      this.el.cineText.classList.remove('on');
    }
  }

  death(on, reason = '') {
    this.el.death.classList.toggle('on', on);
    if (reason) this.el.deathReason.textContent = reason;
  }

  paused(on) { this.el.pause.classList.toggle('on', on); }
  fps(text) { this.el.fps.textContent = text; }
}
