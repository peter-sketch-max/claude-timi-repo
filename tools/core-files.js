// The game scripts that run without a browser (everything in index.html except sound, the scene and the screens).
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, '../src/index.html'), 'utf8');
module.exports = (html.match(/js\/([\w-]+)\.js/g) || []).map(s => s.slice(3, -3)).filter(f => !['store', 'music', 'scene', 'ui'].includes(f));
