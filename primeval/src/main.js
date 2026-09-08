// Boot: pick a quality preset, build the world, hand over to the game loop.

import { QUALITY, loadQuality, saveQuality } from './config.js';
import { Hud } from './ui/hud.js';
import { Game } from './game.js';
import { installWorld } from './world/install.js';

const canvas = document.getElementById('gl');
const hud = new Hud();

let quality = loadQuality();
const setQualityButtons = () => {
  document.querySelectorAll('.qbtn').forEach(b => {
    b.classList.toggle('sel', b.dataset.q === quality.name);
    b.onclick = () => {
      quality = QUALITY[b.dataset.q];
      saveQuality(quality.name);
      setQualityButtons();
      if (game) location.reload();      // presets change GPU state wholesale
    };
  });
};
setQualityButtons();

let game = null;
let running = false;
let last = performance.now();

async function build() {
  game = new Game(canvas, quality, hud);
  installWorld(game);
  await game.load((p, s) => hud.progress(p, s));
  hud.hideLoading();
  const begin = document.getElementById('begin');
  begin.disabled = false;
  begin.textContent = 'ENTER THE STATION';
  begin.onclick = () => start();
  // Render one frame behind the title card so it is not sitting on black.
  game.render();
}

function start() {
  document.getElementById('title').classList.add('gone');
  hud.show();
  game.input.requestLock();
  running = true;
  last = performance.now();
  game.emit('start');
  requestAnimationFrame(loop);
}

function loop(now) {
  if (!running) return;
  requestAnimationFrame(loop);
  let dt = (now - last) / 1000;
  last = now;
  if (dt > 0.1) dt = 0.1;               // a tab-out must not teleport anything
  if (!game.paused) game.update(dt);
  game.render();
}

document.getElementById('respawn').onclick = () => {
  game.emit('respawn');
  hud.death(false);
  game.input.requestLock();
};

addEventListener('keydown', (e) => {
  if (e.code === 'Escape' && running) {
    game.paused = true;
    hud.paused(true);
  }
});
canvas.addEventListener('click', () => {
  if (running && game.paused) {
    game.paused = false;
    hud.paused(false);
    game.input.requestLock();
  }
});
document.getElementById('pause').addEventListener('click', (e) => {
  if (e.target.classList.contains('qbtn')) return;
  game.paused = false;
  hud.paused(false);
  game.input.requestLock();
});

build().catch(e => {
  const el = document.getElementById('fatal');
  el.style.display = 'flex';
  el.textContent = 'PRIMEVAL failed to start\n\n' + (e?.stack || String(e));
});
