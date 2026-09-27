// Bundles src/ into single-file builds:
//   dist/company-simulator.html  - one file you can double-click on any laptop
//   dist/artifact.html           - body-only version used for the shareable web link
const fs = require('fs'), path = require('path');
const src = path.join(__dirname, '../src'), dist = path.join(__dirname, '../dist');
fs.mkdirSync(dist, { recursive: true });
let html = fs.readFileSync(path.join(src, 'index.html'), 'utf8');
html = html.replace(/<link rel="stylesheet" href="css\/style.css">/, () => '<style>\n' + fs.readFileSync(path.join(src, 'css/style.css'), 'utf8') + '</style>');
html = html.replace(/<script src="js\/(\w+)\.js"><\/script>/g, (_, f) => '<script>\n' + fs.readFileSync(path.join(src, 'js', f + '.js'), 'utf8') + '</script>');
html = html.replace(/<!--PWA-->[\s\S]*?<!--\/PWA-->\n/, '');
fs.writeFileSync(path.join(dist, 'company-simulator.html'), html);
// Artifact pages get their own document shell, so keep only the title, styles and body.
const title = html.match(/<title>.*<\/title>/)[0];
const links = (html.match(/<link rel="(preconnect|stylesheet)"[^>]*>/g) || []).join('\n');
const style = html.match(/<style>[\s\S]*?<\/style>/)[0];
const body = html.match(/<body>([\s\S]*)<\/body>/)[1].replace(/\/\*SW\*\/[\s\S]*?\/\*\/SW\*\//, '');
fs.writeFileSync(path.join(dist, 'artifact.html'), [title, links, style, body].join('\n'));
console.log('Built dist/company-simulator.html and dist/artifact.html (' + Math.round(html.length / 1024) + ' KB)');
