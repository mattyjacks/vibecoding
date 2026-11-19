import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';

const root = new URL('./', import.meta.url);
const filenames = (await readdir(root)).filter(name => name.endsWith('.html'));
const pages = await Promise.all(filenames.map(async name => {
  const html = await readFile(new URL(name, root), 'utf8');
  const staticHtml = html.replaceAll('="./dist/', '="./');
  await writeFile(new URL('dist/' + name, root), staticHtml);
  return ['/' + name, ['text/html; charset=utf-8', html]];
}));
const files = await Promise.all([
  ['style.css', 'text/css'],
  ['layout.css', 'text/css'],
  ['layout.js', 'text/javascript'],
  ['charts.js', 'text/javascript'],
  ['domain.js', 'text/javascript'],
  ['app.js', 'text/javascript']
].map(async ([name, mime]) => ['/dist/' + name, [mime + '; charset=utf-8', await readFile(new URL('dist/' + name, root), 'utf8')]]));
const assets = Object.fromEntries([...pages, ...files]);
assets['/'] = assets['/index.html'];
const shared = assets['/dist/domain.js'][1];
const worker = await readFile(new URL('worker.mjs', root), 'utf8');
const server = new URL('dist/server/', root);
await mkdir(server, { recursive: true });
await writeFile(new URL('index.js', server), [
  shared,
  'const demoDeals = [...deals,...intakeDeals], demoSectors = sectors, demoRegions = regions, demoHistoricalFit = historicalFit;',
  'const demoAssets = ' + JSON.stringify(assets) + ';',
  worker.replace(/^\uFEFF/, '')
].join('\n'));
