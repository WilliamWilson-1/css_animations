(async () => {
  const params = new URLSearchParams(location.search);
  const item = window.ANIMATION_CATALOG.items.find(item => item.id === Number(params.get('demo')));
  const file = params.get('file') === 'html' ? 'html' : 'css';
  const status = document.querySelector('#source-status');
  if (!item) { status.textContent = '未找到该动画，请返回集合选择。'; return; }
  document.querySelector('#source-title').textContent = `${String(item.id).padStart(3, '0')} · ${item.title} / ${file.toUpperCase()}`;
  const raw = item.path.replace('index.html', `index.${file}`);
  document.querySelector('#raw-link').href = raw;
  document.querySelector('#html-link').href = `?demo=${item.id}&file=html`;
  document.querySelector('#css-link').href = `?demo=${item.id}&file=css`;
  try {
    const response = await fetch(raw);
    if (!response.ok) throw new Error(String(response.status));
    const code = await response.text();
    document.querySelector('#source-code').textContent = code;
    status.textContent = file === 'html' ? '共享缩放与播放控制在 assets/demo.js 和 assets/demo.css 中。' : '此文件只包含该示例的样式，展示画布由共享文件管理。';
    const button = document.querySelector('#copy-source'); button.disabled = false;
    button.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(code); status.textContent = '源码已复制。'; }
      catch { status.textContent = '无法自动复制，请选择下方代码复制。'; }
    });
  } catch { status.textContent = '无法读取源码。请通过本地 HTTP 服务打开，或点击“打开原文件”。'; }
})();
