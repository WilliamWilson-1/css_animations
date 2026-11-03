(() => {
  'use strict';
  const root = document.documentElement;
  const stage = document.querySelector('.demo-stage');
  const id = Number(root.dataset.demo);
  const width = Number(root.dataset.width), height = Number(root.dataset.height);
  const params = new URLSearchParams(location.search);
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = params.has('paused') || media.matches;
  let explicitMotion = false;
  let rate = 1, elapsed = 0, previous = null, raf = null;
  root.style.setProperty('--canvas-width', `${width}px`);
  root.style.setProperty('--canvas-height', `${height}px`);
  function resize() {
    root.style.setProperty('--canvas-scale', Math.min(innerWidth / width, innerHeight / height));
  }
  resize();
  addEventListener('resize', resize);
  const background = getComputedStyle(stage);
  document.body.style.background = background.background;
  // Avoid a flash of the unscaled canvas during initial layout.
  root.toggleAttribute('data-paused', paused);
  const scripted = [60, 76, 87, 105].includes(id);
  const duration = id === 87 ? 8000 : 6000;
  const counter = document.querySelector('[data-counter], .counter, .count');
  const progress = document.querySelector('[data-progress]') || (id === 87 && document.querySelector('.loader'));
  function render() {
    if (id === 60) {
      document.querySelector('.preloader').classList.toggle('complete', elapsed >= 1800);
      return;
    }
    const value = Math.min(100, Math.floor(elapsed / duration * 100));
    if (counter) counter.textContent = id === 87 ? `${value}%` : String(value);
    if (progress) progress.style.transform = `scaleX(${value / 100})`;
    if (id === 105) {
      counter.classList.toggle('hide', value === 100);
      document.querySelector('.preloader').classList.toggle('active', value === 100);
    }
  }
  function tick(now) {
    if (!paused && !document.hidden) {
      if (previous !== null) elapsed += (now - previous) * rate;
      render();
    }
    previous = now;
    raf = !paused && !document.hidden && elapsed < (id === 60 ? 2000 : duration) ? requestAnimationFrame(tick) : null;
  }
  function run() {
    if (raf !== null) cancelAnimationFrame(raf);
    previous = null;
    if (scripted && !paused && !document.hidden) raf = requestAnimationFrame(tick);
  }
  function setState(state) {
    paused = Boolean(state.paused);
    rate = Number(state.rate) || 1;
    explicitMotion = Boolean(state.allowMotion);
    root.dataset.motion = explicitMotion ? 'allow' : 'system';
    paused = paused || (media.matches && !explicitMotion);
    root.toggleAttribute('data-paused', paused || document.hidden);
    // Web Animations API includes CSS animations on pseudo-elements.
    document.getAnimations().forEach(animation => {
      animation.updatePlaybackRate(rate);
      if (typeof CSSTransition !== 'undefined' && animation instanceof CSSTransition) {
        if (paused || document.hidden) animation.pause();
        else animation.play();
      }
    });
    run();
  }
  addEventListener('message', event => {
    if (event.source !== parent || event.data?.type !== 'css-animations:state') return;
    if (event.origin !== location.origin && !(location.protocol === 'file:' && event.origin === 'null')) return;
    setState(event.data);
  });
  document.addEventListener('visibilitychange', () => {
    root.toggleAttribute('data-paused', paused || document.hidden);
    run();
  });
  media.addEventListener('change', () => {
    if (!explicitMotion) setState({ paused: media.matches, rate, allowMotion: false });
  });
  if (scripted) { render(); run(); }
  if (parent !== window) parent.postMessage({ type: 'css-animations:ready', id }, location.origin === 'null' ? '*' : location.origin);
})();
