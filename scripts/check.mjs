import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import * as css from 'css-tree';
import { parseHTML } from 'linkedom';

const root = path.resolve(import.meta.dirname, '..');
const read = name => readFile(path.join(root, name), 'utf8');
const catalogue = JSON.parse(await read('catalog.json'));
const ids = catalogue.items.map(item => item.id);
assert.deepEqual(ids, Array.from({ length: 107 }, (_, i) => i + 1));
assert.equal(new Set(catalogue.items.map(item => item.path)).size, 107);
assert.equal(catalogue.categories.length, 7);
for (const category of catalogue.categories) {
  assert.equal(category.count, catalogue.items.filter(item => item.category === category.id).length);
}
const context = vm.createContext({ window: {} });
vm.runInContext(await read('assets/catalog.js'), context);
assert.equal(JSON.stringify(context.window.ANIMATION_CATALOG), JSON.stringify(catalogue), 'Catalogue JS must match JSON');
const files = [];
async function walk(dir) {
  for (const entry of await readdir(path.join(root, dir), { withFileTypes: true })) {
    if (['node_modules', '.git', 'artifacts'].includes(entry.name)) continue;
    const name = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(name); else files.push(name);
  }
}
await walk('');
let links = 0, keyframes = 0, declarations = 0;
const warnings = [];
for (const file of files) {
  if (/\.js$/.test(file)) new vm.Script(await read(file), { filename: file });
  if (/\.html$/.test(file)) {
    const html = await read(file), { document } = parseHTML(html);
    assert.ok(document.querySelector('html[lang="zh-CN"]'), `${file}: language`);
    assert.ok(document.querySelector('meta[name="viewport"]'), `${file}: viewport`);
    for (const element of document.querySelectorAll('[src],link[href]')) {
      const value = element.getAttribute('src') || element.getAttribute('href');
      if (!value || value.startsWith('#') || value.startsWith('data:')) continue;
      assert.ok(!/^https?:/.test(value), `${file}: external resource ${value}`);
      await stat(path.resolve(root, path.dirname(file), decodeURI(value.split('?')[0]))); links++;
    }
    assert.ok(!document.querySelector('script:not([src])'), `${file}: unexpected inline script`);
    if (file.startsWith('demos/')) {
      assert.ok(document.querySelector('.demo-stage')?.children.length, `${file}: empty example`);
      assert.equal(document.querySelector('html').dataset.demo, path.basename(path.dirname(file)));
    }
  }
  if (/\.css$/.test(file)) {
    const source = await read(file);
    const ast = css.parse(source, { positions: true, onParseError: error => { throw new Error(`${file}: ${error.formattedMessage}`); } });
    const names = new Set();
    css.walk(ast, {
      enter(node) {
        if (node.type === 'Declaration') declarations++;
        if (node.type === 'Atrule' && node.name === 'keyframes') {
          const name = css.generate(node.prelude);
          assert.ok(!names.has(name), `${file}: duplicate keyframes ${name}`);
          names.add(name); keyframes++;
          const offsets = new Set();
          node.block.children.forEach(frame => {
            const prelude = css.generate(frame.prelude);
            for (let offset of prelude.split(',')) {
              offset = offset === 'from' ? '0%' : offset === 'to' ? '100%' : offset;
              assert.ok(!offsets.has(offset), `${file}: repeated ${offset} in ${name}`); offsets.add(offset);
            }
          });
        }
        if (node.type === 'Atrule') assert.notEqual(node.name, 'import', `${file}: external font import`);
      }
    });
    css.walk(ast, node => {
      if (node.type !== 'Declaration') return;
      if (node.property === 'animation' || node.property === 'animation-name') {
        const candidates = [];
        css.walk(node.value, part => { if (part.type === 'Identifier') candidates.push(part.name); });
        const keywords = new Set(['none','linear','ease','ease-in','ease-out','ease-in-out','infinite','alternate','alternate-reverse','reverse','normal','forwards','backwards','both','running','paused','step-start','step-end']);
        for (const candidate of candidates) assert.ok(names.has(candidate) || keywords.has(candidate), `${file}: missing @keyframes ${candidate}`);
      }
      if (node.property.startsWith('--')) return;
      const result = css.lexer.matchProperty(node.property, node.value);
      if (result.error && !node.property.startsWith('-') && !css.generate(node.value).includes('var(')) warnings.push({ file, property: node.property, value: css.generate(node.value), error: result.error.message.split('\n')[0] });
    });
    for (const match of source.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
      if (match[1].startsWith('#') || match[1].startsWith('data:')) continue;
      await stat(path.resolve(root, path.dirname(file), decodeURI(match[1]))); links++;
    }
  }
}
assert.deepEqual(catalogue.items.filter(item => item.added).map(item => item.id), [16,21,37,76,91,96]);
const report = { date: '2026-11-03', examples: ids.length, categories: catalogue.categories.length, files: files.length, localResourceLinks: links, keyframes, cssDeclarations: declarations, grammarWarnings: warnings, renderedBrowserReview: 'pending: browser origin access was declined' };
await writeFile(path.join(root, 'docs/static-check.json'), JSON.stringify(report, null, 2) + '\n');
console.log(`Validated ${ids.length} demos, ${links} local resource links, ${keyframes} keyframes, ${declarations} declarations.`);
if (warnings.length) { console.error(JSON.stringify(warnings, null, 2)); process.exitCode = 1; }
