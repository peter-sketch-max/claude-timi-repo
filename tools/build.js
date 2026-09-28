// Builds the game from src/ into three outputs:
//   dist/company-simulator.html  one file you can double-click on any laptop
//   dist/artifact.html           body-only version used for the shareable web link
//   www/                         the Android app's web files (fonts bundled, works offline)
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..'), src = path.join(root, 'src'), dist = path.join(root, 'dist'), www = path.join(root, 'www');
fs.mkdirSync(dist, { recursive: true });

let html = fs.readFileSync(path.join(src, 'index.html'), 'utf8');
html = html.replace(/<link rel="stylesheet" href="css\/style.css">/, () => '<style>\n' + fs.readFileSync(path.join(src, 'css/style.css'), 'utf8') + '</style>');
html = html.replace(/<script src="js\/([\w-]+)\.js"><\/script>/g, (_, f) => '<script>\n' + fs.readFileSync(path.join(src, 'js', f + '.js'), 'utf8') + '</script>');
const noPwa = html.replace(/<!--PWA-->[\s\S]*?<!--\/PWA-->\n/, '');
fs.writeFileSync(path.join(dist, 'company-simulator.html'), noPwa);

// Artifact pages get their own document shell, so keep only the title, styles and body.
const title = noPwa.match(/<title>.*<\/title>/)[0];
const links = (noPwa.match(/<link rel="(preconnect|stylesheet)"[^>]*>/g) || []).join('\n');
const style = noPwa.match(/<style>[\s\S]*?<\/style>/)[0];
const body = noPwa.match(/<body>([\s\S]*)<\/body>/)[1].replace(/\/\*SW\*\/[\s\S]*?\/\*\/SW\*\//, '');
fs.writeFileSync(path.join(dist, 'artifact.html'), [title, links, style, body].join('\n'));

// Android app: bundle the fonts so nothing is downloaded, and drop the service worker.
const fontDir = (pkg) => path.join(root, 'node_modules/@fontsource', pkg, 'files');
if (fs.existsSync(fontDir('fredoka')) && fs.existsSync(fontDir('nunito'))) {
  fs.rmSync(www, { recursive: true, force: true });
  fs.mkdirSync(path.join(www, 'fonts'), { recursive: true });
  const faces = [['Fredoka', 'fredoka', [500, 600, 700]], ['Nunito', 'nunito', [700, 800]]];
  let css = '';
  // The fonts use the SIL Open Font License, which asks for the license to travel with them.
  faces.forEach(([, pkg]) => fs.copyFileSync(path.join(root, 'node_modules/@fontsource', pkg, 'LICENSE'), path.join(www, 'fonts', pkg + '-OFL.txt')));
  faces.forEach(([family, pkg, weights]) => weights.forEach(w => {
    const file = pkg + '-latin-' + w + '-normal.woff2';
    fs.copyFileSync(path.join(fontDir(pkg), file), path.join(www, 'fonts', file));
    css += '@font-face{font-family:"' + family + '";font-style:normal;font-weight:' + w + ';font-display:swap;src:url(fonts/' + file + ') format("woff2");}\n';
  }));
  let app = noPwa.replace(/<link rel="preconnect"[^>]*>\n?/g, '').replace(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^>]*>\n?/, '<style>\n' + css + '</style>\n');
  app = app.replace(/\/\*SW\*\/[\s\S]*?\/\*\/SW\*\//, '');
  // Your own songs: src/music/menu*.mp3, game*.mp3 and war*.mp3 go into the app (see src/music/README.txt).
  const music = { menu: [], game: [], war: [] }, musicDir = path.join(src, 'music');
  if (fs.existsSync(musicDir)) fs.readdirSync(musicDir).sort().forEach(f => {
    const m = /^(menu|game|war).*\.(mp3|ogg|m4a|wav)$/i.exec(f);
    if (!m) return;
    fs.mkdirSync(path.join(www, 'music'), { recursive: true });
    fs.copyFileSync(path.join(musicDir, f), path.join(www, 'music', f));
    music[m[1].toLowerCase()].push(f);
  });
  const songs = music.menu.length + music.game.length + music.war.length;
  if (songs) app = app.replace('<script>', () => '<script>globalThis.CS = { MUSIC_FILES: ' + JSON.stringify(music) + ' };</script>\n<script>');
  fs.writeFileSync(path.join(www, 'index.html'), app);
  if (songs) console.log('Added ' + songs + ' of your songs from src/music');
  fs.copyFileSync(path.join(src, 'icon.svg'), path.join(www, 'icon.svg'));
  console.log('Built www/ for the Android app');
} else console.log('Skipped www/ (run npm install first)');

console.log('Built dist/company-simulator.html and dist/artifact.html (' + Math.round(noPwa.length / 1024) + ' KB)');
