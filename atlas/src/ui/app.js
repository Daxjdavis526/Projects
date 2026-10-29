// Boot, layout and hash routing. Each page module exports
// render(main, params) and may return a cleanup function.

import { h, clear, icon, LOGO, ring } from './dom.js';
import { app, init, subscribe } from './state.js';
import { levelOf, rankOf } from '../core/progress.js';
import { watchMath } from './fitmath.js';

const ROUTES = [
  [/^\/?$/, () => import('./pages/home.js')],
  [/^\/welcome$/, () => import('./pages/welcome.js')],
  [/^\/library(?:\/([\w-]+))?$/, () => import('./pages/library.js'), ['track']],
  [/^\/course\/([\w-]+)$/, () => import('./pages/course.js'), ['course']],
  [/^\/lesson\/([\w.-]+)$/, () => import('./pages/lesson.js'), ['lesson']],
  [/^\/review$/, () => import('./pages/review.js')],
  [/^\/daily$/, () => import('./pages/daily.js')],
  [/^\/boss\/([\w-]+)$/, () => import('./pages/boss.js'), ['course']],
  [/^\/diagnostic$/, () => import('./pages/diagnostic.js')],
  [/^\/map(?:\/([\w-]+))?$/, () => import('./pages/map.js'), ['course']],
  [/^\/gr$/, () => import('./pages/gr.js')],
  [/^\/progress$/, () => import('./pages/progress.js')],
  [/^\/manifest$/, () => import('./pages/manifest.js')],
  [/^\/lab$/, () => import('./pages/codelab.js')],
  [/^\/explore(?:\/([\w-]+))?$/, () => import('./pages/explore.js'), ['sim']],
  [/^\/settings$/, () => import('./pages/settings.js')],
];

const NAV = [
  ['/', 'Home', 'home'],
  ['/library', 'Library', 'book'],
  ['/map', 'Skill map', 'map'],
  ['/review', 'Review', 'review'],
  ['/gr', 'Road to Einstein', 'orbit'],
  ['/progress', 'Progress', 'trophy'],
  null,
  ['/explore', 'Simulations', 'atom'],
  ['/lab', 'Code lab', 'code'],
  ['/manifest', 'Coverage', 'list'],
  ['/settings', 'Settings', 'gear'],
];
const TABS = [['/', 'Home', 'home'], ['/library', 'Library', 'book'], ['/review', 'Review', 'review'], ['/gr', 'Einstein', 'orbit'], ['/progress', 'Progress', 'trophy']];

let root, main, side, topbar, tabbar;
let cleanup = null;
let currentPath = null;

export const path = () => (location.hash.replace(/^#/, '') || '/').split('?')[0];
export const go = (p) => { if (path() === p) route(); else location.hash = p; };

function chrome() {
  root = document.getElementById('app');
  clear(root);
  side = h('aside.side', { 'aria-label': 'Main navigation' });
  topbar = h('header.topbar');
  main = h('main.main#main', { tabindex: '-1' });
  tabbar = h('nav.tabbar', { 'aria-label': 'Main navigation' });
  root.append(side, h('div', topbar, main), tabbar);
  watchMath(main);
  root.removeAttribute('aria-busy');
  paintChrome();
}

function paintChrome() {
  const p = path();
  const dueCount = app.st ? app.st.due.length : 0;
  const active = (href) => (href === '/' ? p === '/' : p === href || p.startsWith(href + '/') || (href === '/library' && (p.startsWith('/course') || p.startsWith('/lesson') || p.startsWith('/boss'))));
  clear(side);
  side.append(
    h('a.brand', { href: '#/', html: `${LOGO}<div><b>The Physics Atlas</b><span>Algebra to Einstein</span></div>` }),
    h('nav.nav', NAV.map((n) => (n ? h('a', { href: '#' + n[0], 'aria-current': active(n[0]) ? 'page' : null, html: `${icon(n[2])}<span>${n[1]}</span>${n[0] === '/review' && dueCount ? `<span class="count">${dueCount}</span>` : ''}` }) : h('div.nav-sep')))),
  );
  const lv = levelOf(app.st?.xp ?? 0);
  side.append(h('div.side-foot', h('a.lvl', { href: '#/progress', style: { color: 'inherit', textDecoration: 'none' }, html: `${ring(lv.into / lv.span, { size: 42, stroke: 4, label: String(lv.level) })}<div><b>${rankOf(lv.level)}</b><small>${(app.st?.xp ?? 0).toLocaleString()} XP · ${(lv.next - (app.st?.xp ?? 0)).toLocaleString()} to level ${lv.level + 1}</small></div>` })));
  clear(topbar);
  topbar.append(h('a.brand', { href: '#/', html: `${LOGO}<div><b>The Physics Atlas</b></div>` }), h('span.spacer'),
    h('a.icon-btn', { href: '#/explore', 'aria-label': 'Simulations', html: icon('atom') }),
    // everything the five tabs leave out: on a phone this menu is the only way to it
    h('details.more-menu',
      h('summary.icon-btn', { 'aria-label': 'More' , html: icon('more') }),
      h('nav.menu', { 'aria-label': 'More pages' }, NAV.filter((n) => n && !TABS.some((t) => t[0] === n[0])).map((n) =>
        h('a', { href: '#' + n[0], 'aria-current': active(n[0]) ? 'page' : null, html: `${icon(n[2])}<span>${n[1]}</span>` })))));
  clear(tabbar);
  tabbar.append(...TABS.map((t) => h('a', { href: '#' + t[0], 'aria-current': active(t[0]) ? 'page' : null, html: `${icon(t[2])}<span>${t[1]}</span>${t[0] === '/review' && dueCount ? `<span class="count">${dueCount}</span>` : ''}` })));
}

async function route() {
  const p = path();
  // first visit: offer onboarding (never forced — "Skip" is always there)
  if (!app.profile && p === '/' && !sessionStorage.getItem('atlas:skipWelcome')) { location.replace('#/welcome'); return; }
  for (const [re, load, names = []] of ROUTES) {
    const m = re.exec(p);
    if (!m) continue;
    const params = Object.fromEntries(names.map((n, i) => [n, m[i + 1] ? decodeURIComponent(m[i + 1]) : undefined]));
    if (cleanup) { try { cleanup(); } catch (e) { console.error(e); } cleanup = null; }
    const samePage = currentPath === p;
    currentPath = p;
    paintChrome();
    let mod;
    try { mod = await load(); } catch (e) { showError(e); return; }
    if (currentPath !== p) return;                 // the user navigated away while loading
    clear(main);
    try {
      cleanup = (await mod.render(main, params)) || null;
    } catch (e) { showError(e); return; }
    if (!samePage) { window.scrollTo(0, 0); main.focus({ preventScroll: true }); }
    document.title = (main.querySelector('h1')?.textContent ? main.querySelector('h1').textContent + ' · ' : '') + 'The Physics Atlas';
    return;
  }
  clear(main);
  main.append(h('div.page.narrow', h('h1', 'Not found'), h('p.muted', 'That page is not in the Atlas.'), h('a.btn', { href: '#/' }, 'Home')));
}

function showError(e) {
  console.error(e);
  clear(main);
  main.append(h('div.page.narrow', h('h1', 'Something went wrong'), h('p.muted', String(e?.message || e)), h('a.btn', { href: '#/' }, 'Home')));
}

// Android and desktop Chrome offer to install the app; keep the offer so Settings
// can show an Install button (iPhone has no such event: Settings explains Share →
// Add to Home Screen instead)
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); window.atlasInstall = e; });

async function boot() {
  // the service worker keeps every file it fetches, so the app opens offline (sw.js)
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('sw.js').catch((e) => console.warn('service worker:', e));
  chrome();
  await init();
  paintChrome();
  subscribe(() => paintChrome());
  window.addEventListener('hashchange', route);
  // a tap anywhere outside the More menu closes it
  document.addEventListener('click', (e) => { for (const d of document.querySelectorAll('details.more-menu[open]')) if (!d.contains(e.target)) d.open = false; });
  route();
}

boot();
