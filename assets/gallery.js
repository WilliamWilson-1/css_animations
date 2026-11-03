(() => {
  'use strict';
  const { categories, items } = window.ANIMATION_CATALOG;
  const $ = selector => document.querySelector(selector);
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const state = { category: 'all', query: '', page: 1, paused: media.matches, allowMotion: false, rate: 1 };
  const size = 12;
  let active = null, detailFrame = null, trigger = null;
  const grid = $('#grid'), dialog = $('#detail');
  const visibleFrames = new Set();
  const loadedFrames = new Set();
  const categoryName = id => categories.find(category => category.id === id).label;
  function urlFor(item, paused = false) {
    return item.path + (paused ? '?paused=1' : '');
  }
  function send(frame, paused = state.paused) {
    if (!frame.contentWindow) return;
    frame.contentWindow.postMessage({ type: 'css-animations:state', paused: paused || document.hidden, rate: state.rate, allowMotion: state.allowMotion }, location.origin === 'null' ? '*' : location.origin);
  }
  function updatePlayback() {
    document.documentElement.toggleAttribute('data-paused', state.paused || document.hidden);
    document.documentElement.dataset.motion = state.allowMotion ? 'allow' : 'system';
    for (const selector of ['#play-toggle', '#detail-toggle']) {
      $(selector).textContent = state.paused ? '播放动效' : '暂停动效';
      $(selector).setAttribute('aria-pressed', String(state.paused));
    }
    for (const option of document.querySelectorAll('#speed option, #detail-speed option')) option.selected = Number(option.value) === state.rate;
    $('#motion-note').hidden = !media.matches || state.allowMotion;
    loadedFrames.forEach(frame => send(frame, state.paused || dialog.open || !visibleFrames.has(frame)));
    if (detailFrame) send(detailFrame);
  }
  function makeFrame(item, paused) {
    const frame = document.createElement('iframe');
    frame.title = `${String(item.id).padStart(3, '0')} ${item.title} 动画预览`;
    frame.tabIndex = -1;
    frame.setAttribute('aria-hidden', 'true');
    frame.src = urlFor(item, paused);
    frame.addEventListener('load', () => send(frame, state.paused || (frame !== detailFrame && (dialog.open || !visibleFrames.has(frame)))));
    return frame;
  }
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const button = entry.target;
      let frame = button.querySelector('iframe');
      if (entry.isIntersecting) {
        if (!frame) {
          const item = items.find(item => item.id === Number(button.dataset.id));
          frame = makeFrame(item, state.paused || dialog.open);
          button.append(frame);
          loadedFrames.add(frame);
        }
        visibleFrames.add(frame);
        send(frame, state.paused || dialog.open);
      } else if (frame) {
        visibleFrames.delete(frame);
        send(frame, true);
      }
    }
  }, { threshold: 0.01 });
  function syncURL() {
    const params = new URLSearchParams();
    if (state.category !== 'all') params.set('category', state.category);
    if (state.query) params.set('q', state.query);
    if (state.page !== 1) params.set('page', state.page);
    try { history.replaceState(null, '', location.pathname + (params.size ? `?${params}` : '')); } catch { /* file:// fallback */ }
  }
  function render() {
    const query = state.query.toLocaleLowerCase().trim();
    const filtered = items.filter(item => (state.category === 'all' || item.category === state.category) &&
      [item.title, item.original, item.id, String(item.id).padStart(3, '0'), item.category, ...item.tags].join(' ').toLocaleLowerCase().includes(query));
    const pages = Math.max(1, Math.ceil(filtered.length / size));
    state.page = Math.min(pages, Math.max(1, state.page));
    observer.disconnect();
    loadedFrames.clear(); visibleFrames.clear(); grid.replaceChildren();
    for (const item of filtered.slice((state.page - 1) * size, state.page * size)) {
      const card = document.createElement('article'); card.className = 'card';
      const preview = document.createElement('button'); preview.type = 'button'; preview.className = 'preview-button';
      preview.dataset.id = item.id; preview.setAttribute('aria-label', `预览 ${String(item.id).padStart(3, '0')} ${item.title}`);
      preview.addEventListener('click', () => openDetail(item, preview));
      const meta = document.createElement('div'); meta.className = 'card-meta';
      const title = document.createElement('div'); title.className = 'card-title';
      const number = document.createElement('span'); number.className = 'card-id'; number.textContent = String(item.id).padStart(3, '0');
      const heading = document.createElement('h3'); heading.textContent = item.title; heading.title = item.title;
      title.append(number, heading);
      const bottom = document.createElement('div'); bottom.className = 'card-bottom';
      const category = document.createElement('span'); category.textContent = categoryName(item.category);
      const tags = document.createElement('div'); tags.className = 'tags';
      for (const tag of item.tags.filter(tag => tag !== categoryName(item.category)).slice(-2)) {
        const element = document.createElement('span'); element.className = 'tag' + (tag === '补全' ? ' added' : ''); element.textContent = tag; tags.append(element);
      }
      if (!tags.children.length) { const arrow = document.createElement('span'); arrow.className = 'card-arrow'; arrow.textContent = '↗'; tags.append(arrow); }
      bottom.append(category, tags); meta.append(title, bottom); card.append(preview, meta); grid.append(card); observer.observe(preview);
    }
    $('#results-count').textContent = `${state.category === 'all' ? '全部动效' : categoryName(state.category)} · ${filtered.length} 个实验`;
    $('#page-info').textContent = `${String(state.page).padStart(2, '0')} / ${String(pages).padStart(2, '0')}`;
    $('#prev-page').disabled = state.page === 1; $('#next-page').disabled = state.page === pages;
    $('#empty').hidden = filtered.length > 0;
    $('.pagination').hidden = filtered.length === 0;
    document.querySelectorAll('.category').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.category === state.category)));
    syncURL();
  }
  function openDetail(item, button) {
    active = item; trigger = button;
    $('#detail-title').textContent = `${String(item.id).padStart(3, '0')} · ${item.title}`;
    $('#detail-category').textContent = categories.find(category => category.id === item.category).english;
    $('#detail-note').textContent = item.note || '保留原始效果与编号。支持暂停、变速与独立查看源码。';
    $('#open-demo').href = item.path;
    // A source viewer uses textContent, so source HTML cannot execute in the gallery.
    $('#open-html').href = `source.html?demo=${item.id}&file=html`;
    $('#open-css').href = `source.html?demo=${item.id}&file=css`;
    detailFrame = makeFrame(item, state.paused);
    detailFrame.removeAttribute('aria-hidden'); detailFrame.tabIndex = 0;
    $('#detail-preview').replaceChildren(detailFrame);
    dialog.showModal(); updatePlayback(); $('#close-detail').focus();
  }
  function closeDetail() { dialog.close(); }
  dialog.addEventListener('close', () => {
    detailFrame?.remove(); detailFrame = null; active = null;
    updatePlayback(); trigger?.focus();
  });
  dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) closeDetail(); } });
  $('#close-detail').addEventListener('click', closeDetail);
  $('#replay').addEventListener('click', () => {
    if (!active) return;
    detailFrame = makeFrame(active, state.paused); detailFrame.removeAttribute('aria-hidden'); detailFrame.tabIndex = 0;
    $('#detail-preview').replaceChildren(detailFrame);
  });
  const navItems = [{ id: 'all', label: '全部', count: items.length }, ...categories];
  for (const category of navItems) {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'category'; button.dataset.category = category.id;
    button.append(document.createTextNode(category.label)); const count = document.createElement('span'); count.textContent = category.count; button.append(count);
    button.addEventListener('click', () => { state.category = category.id; state.page = 1; render(); }); $('#categories').append(button);
  }
  $('#search').addEventListener('input', event => { state.query = event.target.value; state.page = 1; render(); });
  $('#reset').addEventListener('click', () => { state.category = 'all'; state.query = ''; state.page = 1; $('#search').value = ''; render(); });
  for (const selector of ['#play-toggle', '#detail-toggle']) $(selector).addEventListener('click', () => { state.paused = !state.paused; state.allowMotion = !state.paused; updatePlayback(); });
  for (const selector of ['#speed', '#detail-speed']) $(selector).addEventListener('change', event => { state.rate = Number(event.target.value); updatePlayback(); });
  for (const [selector, delta] of [['#prev-page', -1], ['#next-page', 1]]) {
    $(selector).addEventListener('click', () => { state.page += delta; render(); $('#collection').scrollIntoView({ behavior: 'instant', block: 'start' }); });
  }
  addEventListener('keydown', event => { if (event.key === '/' && !dialog.open && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) { event.preventDefault(); $('#search').focus(); } });
  document.addEventListener('visibilitychange', updatePlayback);
  media.addEventListener('change', () => { if (!state.allowMotion) { state.paused = media.matches; updatePlayback(); } });
  addEventListener('message', event => { if (event.data?.type === 'css-animations:ready') updatePlayback(); });
  const params = new URLSearchParams(location.search);
  if (categories.some(category => category.id === params.get('category'))) state.category = params.get('category');
  state.query = params.get('q') || ''; state.page = Math.max(1, Number(params.get('page')) || 1); $('#search').value = state.query;
  render(); updatePlayback();
})();
