(() => {
  const $ = selector => document.querySelector(selector);
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  const report = { browser: navigator.userAgent, viewport: [innerWidth, innerHeight], reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches, results: [] };
  const snapshot = doc => [...doc.querySelectorAll('.demo-stage, .demo-stage *')].flatMap(element => ['', '::before', '::after'].map(pseudo => {
    const s = doc.defaultView.getComputedStyle(element, pseudo);
    return [s.transform, s.opacity, s.color, s.backgroundColor, s.width, s.height, s.left, s.top, s.filter, s.clipPath, s.strokeDashoffset, s.d, s.boxShadow, element.textContent].join('|');
  })).join('\n');
  $('#run').addEventListener('click', async () => {
    $('#run').disabled = true; $('#download').disabled = true; report.results = [];
    for (const item of window.ANIMATION_CATALOG.items) {
      $('#status').textContent = `${item.id} / 107 · ${item.title}`;
      const frame = document.createElement('iframe'); frame.title = item.title;
      const errors = [];
      const loaded = new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('加载超时')), 10000);
        frame.onload = () => { clearTimeout(timer); resolve(); };
        frame.onerror = () => { clearTimeout(timer); reject(new Error('加载失败')); };
      });
      frame.src = '../' + item.path + '?paused=1'; $('#stage').replaceChildren(frame);
      try {
        await loaded;
        const doc = frame.contentDocument, win = frame.contentWindow;
        win.addEventListener('error', event => errors.push(event.message));
        const state = values => win.postMessage({ type: 'css-animations:state', paused: false, allowMotion: true, rate: 1, ...values }, location.origin);
        state({}); await wait(60);
        const before = snapshot(doc); await wait(240); const after = snapshot(doc);
        const animations = doc.getAnimations();
        state({ paused: true }); await wait(60);
        const pauseA = snapshot(doc); await wait(100); const pauseB = snapshot(doc);
        state({ rate: 2 }); await wait(60);
        const result = { id: item.id, title: item.title, animations: animations.length, changed: before !== after, paused: pauseA === pauseB, doubleSpeed: doc.getAnimations().every(a => a.playbackRate === 2), errors };
        report.results.push(result);
      } catch (error) { report.results.push({ id: item.id, title: item.title, error: error.message }); }
      $('#report').textContent = JSON.stringify(report, null, 2);
    }
    $('#stage').replaceChildren(); report.completedAt = new Date().toISOString();
    const issues = report.results.filter(result => result.error || result.errors?.length || !result.changed || !result.paused || !result.doubleSpeed);
    report.needsReview = issues.map(item => item.id);
    $('#status').textContent = `完成 ${report.results.length} 项；${issues.length} 项需要人工复核。`;
    $('#report').textContent = JSON.stringify(report, null, 2);
    $('#run').disabled = false; $('#download').disabled = false;
  });
  $('#download').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'css-animations-browser-audit.json'; link.click(); URL.revokeObjectURL(url);
  });
})();
