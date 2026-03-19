const http = require('http');
const fs = require('fs');
const path = require('path');
const port = 3000;
const scriptName = 'lx-sniffer.js';
const scriptPath = path.join(__dirname, scriptName);

const isCaptureMode = process.argv.includes('--capture');
const captureFilePath = path.join(__dirname, 'captured_packets.json');
let capturedPackets = {};

if (isCaptureMode) {
  if (fs.existsSync(captureFilePath)) {
    try {
      capturedPackets = JSON.parse(fs.readFileSync(captureFilePath, 'utf8'));
    } catch (e) {
      console.log('⚠️ 历史捕捉文件解析失败，将创建新文件。');
    }
  }
}

const sourceCode = `/**
 * @name ID_Sniffer
 * @description 获取全平台请求数据（支持Hi-Res/母带音质测试）
 * @version 2.0.0
 * @author Sniffer
 */
const { EVENT_NAMES, request, on, send } = globalThis.lx;

const logToServer = (source, action, info) => {
  return new Promise((resolve, reject) => {
    request('http://127.0.0.1:${port}/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source, action, info })
    }, (err, resp) => {
      if (err) return reject(err);
      resolve(resp.body);
    });
  });
};

on(EVENT_NAMES.request, ({ source, action, info }) => {
  return logToServer(source, action, info).then(() => {

    if (action === 'musicUrl') return 'http://127.0.0.1/mock.mp3';
    if (action === 'lyric') return { lyric: '[00:00.00]Mock Lyric', tlyric: '', rlyric: '', lxlyric: '' };
    if (action === 'pic') return 'http://127.0.0.1/mock.jpg';
  });
});

const q =['128k', '320k', 'flac', 'flac24bit', 'hires', 'atmos', 'master'];

send(EVENT_NAMES.inited, {
  status: true,
  openDevTools: true,
  sources: {
    kw: { name: '酷我(测试)', type: 'music', actions:['musicUrl', 'lyric', 'pic'], qualitys: q },
    kg: { name: '酷狗(测试)', type: 'music', actions: ['musicUrl', 'lyric', 'pic'], qualitys: q },
    tx: { name: '企鹅(测试)', type: 'music', actions:['musicUrl', 'lyric', 'pic'], qualitys: q },
    wy: { name: '网易(测试)', type: 'music', actions: ['musicUrl', 'lyric', 'pic'], qualitys: q },
    mg: { name: '咪咕(测试)', type: 'music', actions:['musicUrl', 'lyric', 'pic'], qualitys: q }
  }
});`;

fs.writeFileSync(scriptPath, sourceCode);

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1');
  
  if (url.pathname === '/source.js') {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.end(sourceCode);
    return;
  }

  if (url.pathname === '/api' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c.toString());
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        
        if (data.action === 'musicUrl') {
          if (isCaptureMode && data.info && data.info.musicInfo) {
            const src = data.source;
            const mInfo = data.info.musicInfo;
            
            if (!capturedPackets[src]) {
              capturedPackets[src] =[];
            }
            
            const idKey = mInfo.songmid ? 'songmid' : (mInfo.hash ? 'hash' : 'songId');
            if (mInfo[idKey]) {
                const isExist = capturedPackets[src].find(item => item[idKey] === mInfo[idKey]);
                
                if (!isExist) {
                  capturedPackets[src].push(mInfo);
                  fs.writeFileSync(captureFilePath, JSON.stringify(capturedPackets, null, 2), 'utf-8');
                  console.log(`\x1b[32m[+] 抓取成功并写入: [${src}] 《${mInfo.name}》 \x1b[0m`);
                } else {
                  console.log(`\x1b[33m[-] 数据包已存在，自动跳过: [${src}] 《${mInfo.name}》 \x1b[0m`);
                }
            } else {
                console.log(`\x1b[31m[!] 歌曲缺少关键ID，无法保存: 《${mInfo.name}》 \x1b[0m`);
            }
          } else {
            console.log('\n-----------------------------------');
            console.log(`[${data.source}] 动作: ${data.action}`);
            console.log(`请求音质: ${data.info.type}`);
            console.log(`歌曲ID: ${data.info.musicInfo.songmid || data.info.musicInfo.hash}`);
            console.log(`歌曲名: ${data.info.musicInfo.name}`);
          }
        }
        
      } catch(e) {
        console.log('解析错误:', e.message);
      }
      res.setHeader('Content-Type', 'application/json');
      res.end('{}');
    });
    return;
  }
  res.end('LX Sniffer Server Running...');
});

server.listen(port, () => {
  console.log('===================================');
  console.log('🎵 LX Sniffer 嗅探服务器已启动');
  console.log(`🔗 请在 LX Music 填入测试源地址: http://127.0.0.1:${port}/source.js`);
  if (isCaptureMode) {
    console.log('\x1b[32m✅ [生成模式开启] 正在监听并生成测试数据包 -> captured_packets.json\x1b[0m');
  } else {
    console.log('\x1b[33mℹ️  [普通模式开启] 仅在控制台打印日志 (带 --capture 参数可自动生成测试包)\x1b[0m');
  }
});