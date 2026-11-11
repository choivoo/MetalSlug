// src/*.js 를 하나의 index.html 로 합친다 (외부 파일 없음)
const fs = require('fs'), path = require('path');
const js = fs.readdirSync(path.join(__dirname, 'src')).filter(f => f.endsWith('.js')).sort().map(f => fs.readFileSync(path.join(__dirname, 'src', f), 'utf8')).join('\n');
const html = fs.readFileSync(path.join(__dirname, 'src', 'shell.html'), 'utf8').replace('/*__JS__*/', () => js);
fs.writeFileSync(path.join(__dirname, 'index.html'), html);
console.log('index.html', (html.length / 1024).toFixed(1) + ' KB');
