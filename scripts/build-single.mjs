// Gộp CSS + JS thành một file HTML duy nhất (dist/an-tang-can.html),
// dùng khi cần đăng trang ở nơi chỉ nhận một file. Vercel thì dùng thẳng index.html.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const MODULES = ['js/icons.js', 'js/dishes.js', 'js/rotation.js', 'js/chart.js', 'js/app.js'];

const js = MODULES.map((file) =>
  `// ---- ${file} ----\n` +
  read(file)
    .split('\n')
    .filter((line) => !/^import .* from '.*';$/.test(line))
    .map((line) => line.replace(/^export /, ''))
    .join('\n'),
).join('\n');

const html = read('index.html');
const body = html.slice(html.indexOf('<!--APP-START-->'), html.indexOf('<!--APP-END-->') + '<!--APP-END-->'.length);
const fonts = html.match(/<link href="https:\/\/fonts\.googleapis\.com[^>]+>/)[0];

const out = `<title>Ăn Tăng Cân</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
${fonts}
<style>
${read('css/style.css')}
</style>
${body}
<script type="module">
globalThis.SINGLE_FILE_BUILD = true;
${js}
</script>
`;

mkdirSync(new URL('../dist/', import.meta.url), { recursive: true });
writeFileSync(new URL('../dist/an-tang-can.html', import.meta.url), out);
console.log(`dist/an-tang-can.html ${(out.length / 1024).toFixed(1)} KB`);
