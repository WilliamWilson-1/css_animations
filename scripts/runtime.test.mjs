import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { parseHTML } from 'linkedom';

const root = path.resolve(import.meta.dirname, '..');
const read = name => readFileSync(path.join(root, name), 'utf8');
const catalogue = JSON.parse(read('catalog.json'));
function runtime(id, { reduced = false } = {}) {
  const item = catalogue.items.find(item => item.id === id);
  const { window, document } = parseHTML(read(item.path));
  const rootElement = document.documentElement;
  const listeners = {}, callbacks = new Map();
  const media = { matches: reduced, addEventListener(type, fn) { this.change = fn; } };
  let serial = 0;
  document.hidden = false;
  document.getAnimations = () => [];
  const parent = { postMessage() {} };
  const context = vm.createContext({
    window, document, parent, location: { origin: 'http://localhost', protocol: 'http:', search: '' },
    URLSearchParams, matchMedia: () => media, innerWidth: 400, innerHeight: 280,
    getComputedStyle: () => ({ background: '#111' }),
    addEventListener: (name, fn) => { listeners[name] = fn; },
    requestAnimationFrame: fn => { callbacks.set(++serial, fn); return serial; },
    cancelAnimationFrame: id => callbacks.delete(id)
  });
  vm.runInContext(read('assets/demo.js'), context);
  const state = data => listeners.message({ source: parent, origin: 'http://localhost', data: { type: 'css-animations:state', paused: false, rate: 1, allowMotion: true, ...data } });
  const step = now => { const batch = [...callbacks.values()]; callbacks.clear(); batch.forEach(fn => fn(now)); };
  return { document, root: rootElement, listeners, parent, media, state, step, callbacks };
}

test('counter advances by elapsed time, pauses, resumes and respects speed', () => {
  const app = runtime(76);
  app.step(0); app.step(1500);
  assert.equal(app.document.querySelector('.number').textContent, '25');
  app.state({ paused: true }); app.step(9000);
  assert.equal(app.document.querySelector('.number').textContent, '25');
  assert.ok(app.root.hasAttribute('data-paused'));
  assert.equal(app.callbacks.size, 0);
  app.state({ rate: 2 }); app.step(10000); app.step(11500);
  assert.equal(app.document.querySelector('.number').textContent, '75');
  app.step(13000); assert.equal(app.document.querySelector('.number').textContent, '100');
  assert.equal(app.callbacks.size, 0, 'completed counter stops scheduling frames');
});
test('reduced motion starts paused until a deliberate play action', () => {
  const app = runtime(76, { reduced: true });
  app.step(0); app.step(6000);
  assert.equal(app.document.querySelector('.number').textContent, '0');
  assert.ok(app.root.hasAttribute('data-paused'));
  app.state({ allowMotion: false }); assert.equal(app.callbacks.size, 0);
  app.state({ allowMotion: true }); app.step(0); app.step(3000);
  assert.equal(app.document.querySelector('.number').textContent, '50');
});
test('background tabs freeze counters without jumping on return', () => {
  const app = runtime(87); app.step(0); app.step(2000);
  assert.equal(app.document.querySelector('.count').textContent, '25%');
  app.document.hidden = true; app.document.dispatchEvent(new app.document.defaultView.Event('visibilitychange'));
  assert.equal(app.callbacks.size, 0);
  assert.ok(app.root.hasAttribute('data-paused'));
  app.document.hidden = false; app.document.dispatchEvent(new app.document.defaultView.Event('visibilitychange'));
  app.step(20000); app.step(22000);
  assert.equal(app.document.querySelector('.count').textContent, '50%');
});
test('unrelated windows and origins cannot change playback', () => {
  const app = runtime(76);
  const data = { type: 'css-animations:state', paused: true };
  app.listeners.message({ source: {}, origin: 'http://localhost', data });
  assert.ok(!app.root.hasAttribute('data-paused'));
  app.listeners.message({ source: app.parent, origin: 'https://elsewhere.invalid', data });
  assert.ok(!app.root.hasAttribute('data-paused'));
});
test('scene completion and counter reveal happen at the intended time', () => {
  const app = runtime(60); app.step(0); app.step(1700);
  assert.ok(!app.document.querySelector('.preloader').classList.contains('complete'));
  app.step(1800); assert.ok(app.document.querySelector('.preloader').classList.contains('complete'));
  const counter = runtime(105); counter.step(0); counter.step(6000);
  assert.equal(counter.document.querySelector('.counter').textContent, '100');
  assert.ok(counter.document.querySelector('.counter').classList.contains('hide'));
  assert.ok(counter.document.querySelector('.preloader').classList.contains('active'));
});

function gallery(search = '', reduced = false) {
  const { window, document } = parseHTML(read('index.html'));
  const media = { matches: reduced, addEventListener() {} };
  document.hidden = false;
  const dialog = document.querySelector('dialog');
  dialog.showModal = () => { dialog.open = true; };
  dialog.close = () => { dialog.open = false; dialog.dispatchEvent(new window.Event('close')); };
  let observer;
  const urls = [];
  const location = { origin: 'http://localhost', pathname: '/', search };
  const context = vm.createContext({ window, document, location, URLSearchParams,
    history: { replaceState: (a, b, url) => urls.push(url) },
    matchMedia: () => media, addEventListener() {},
    IntersectionObserver: class { constructor(fn) { this.fn = fn; this.targets = []; observer = this; } observe(target) { this.targets.push(target); } disconnect() { this.targets = []; } }
  });
  window.ANIMATION_CATALOG = catalogue;
  vm.runInContext(read('assets/gallery.js'), context);
  const $ = selector => document.querySelector(selector);
  const click = selector => $(selector).dispatchEvent(new window.Event('click'));
  const input = value => { $('#search').value = value; $('#search').dispatchEvent(new window.Event('input')); };
  return { $, document, window, click, input, observer, urls };
}
test('gallery filters by category, number and tags and restores URL state', () => {
  const app = gallery(); assert.equal(app.document.querySelectorAll('.card').length, 12);
  assert.ok(app.$('#results-count').textContent.includes('107'));
  app.click('[data-category="svg"]'); assert.equal(app.document.querySelectorAll('.card').length, 4);
  app.input('40'); assert.equal(app.document.querySelectorAll('.card').length, 1);
  assert.equal(app.$('.preview-button').dataset.id, '40');
  app.input('does-not-exist'); assert.equal(app.$('#empty').hidden, false);
  app.click('#reset'); assert.equal(app.document.querySelectorAll('.card').length, 12);
  app.input('补全'); assert.equal(app.document.querySelectorAll('.card').length, 6);
  const linked = gallery('?category=geometry&q=波浪&page=99');
  assert.ok(linked.$('#results-count').textContent.includes('几何'));
  assert.equal(linked.$('#page-info').textContent, '01 / 01');
});
test('previews are lazy and detail replay replaces its frame', () => {
  const app = gallery(); assert.equal(app.document.querySelectorAll('iframe').length, 0);
  app.observer.fn([{ target: app.$('.preview-button'), isIntersecting: true }]);
  assert.equal(app.document.querySelectorAll('iframe').length, 1);
  app.click('.preview-button'); const frame = app.$('#detail-preview iframe');
  assert.ok(frame); assert.ok(app.$('#detail').open);
  assert.equal(app.$('#open-css').getAttribute('href'), 'source.html?demo=1&file=css');
  app.click('#detail-toggle'); assert.equal(app.$('#play-toggle').textContent, '播放动效');
  app.click('#replay'); assert.notEqual(app.$('#detail-preview iframe'), frame);
  app.click('#close-detail'); assert.equal(app.$('#detail-preview iframe'), null);
});
test('reduced-motion preference is visible and can be overridden', () => {
  const app = gallery('', true);
  assert.equal(app.$('#play-toggle').textContent, '播放动效');
  assert.ok(app.document.documentElement.hasAttribute('data-paused'));
  assert.equal(app.$('#motion-note').hidden, false);
  app.click('#play-toggle'); assert.equal(app.$('#play-toggle').textContent, '暂停动效');
  assert.equal(app.$('#motion-note').hidden, true);
});
