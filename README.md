# lx-sniffer

[![Node.js](https://img.shields.io/badge/node-%3E%3D12.0.0-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Partner](https://img.shields.io/badge/Partner-lx--source--tester-orange.svg)](https://github.com/fssdyql/lx-source-tester)

**lx-sniffer** 是一个专为 **洛雪音乐 (LX Music)** 设计的数据包嗅探助手。它可以作为一个本地中转服务器，实时捕获你在 LX Music 客户端中播放的歌曲元数据（ID、Hash、歌名等），并自动生成配套 [lx-source-tester](https://github.com/fssdyql/lx-source-tester) 使用的测试数据包。

## ✨ 核心功能

-   **📡 实时嗅探**：通过本地 Mock 音源脚本，实时拦截 LX Music 的播放请求。
-   **📥 自动存包**：开启 `--capture` 模式后，自动将听过的歌曲信息保存为 `captured_packets.json`。
-   **🛠 零配置生成**：运行服务器即刻生成专用 `.js` 音源脚本。
-   **🌈 全平台支持**：支持捕获 酷我、酷狗、企鹅、网易、咪咕 等主流平台的歌曲数据。
-   **🧬 联动增强**：生成的 JSON 文件可直接拖入 [lx-source-tester](https://github.com/fssdyql/lx-source-tester) 进行压力测试或有效性检测。

## 🚀 快速上手

### 1. 启动服务器
确保你安装了 [Node.js](https://nodejs.org/)，在项目目录下运行：

```bash
# 模式 A：普通模式（仅在控制台打印日志）
node server.js

# 模式 B：捕获模式（推荐使用，自动生成测试包文件）
node server.js --capture
```

### 2. 在 LX Music 中配置
1. 启动服务器后，控制台会显示链接：`http://127.0.0.1:3000/source.js`。
2. 打开 **洛雪音乐桌面端** -> **设置** -> **自定义源**。
3. 点击 **导入**，填入上述 URL 链接。
4. 在“源选择”中勾选新出现的嗅探测试源。

### 3. 开始收集数据
- 在 LX Music 中搜索你想要测试的歌曲并点击播放。
- 每次切歌，`lx-sniffer` 都会自动抓取该歌曲的元数据。
- 如果开启了 `--capture`，你会发现本地多了一个 `captured_packets.json`。

## 🧪 联动 lx-source-tester

1. 收集到足够的歌曲数据后，关闭嗅探。
2. 打开 [lx-source-tester](https://github.com/fssdyql/lx-source-tester)。
3. 直接将生成的 `captured_packets.json` **拖入** 测试台界面。
4. 随后拖入你真正要测试的“音源脚本”，点击启动测试。

## 📝 捕获的数据格式
生成的 `captured_packets.json` 将按平台分类，自动去重：
```json
{
  "kw": [
    { "name": "歌曲名", "songmid": "123456", "singer": "歌手" }
  ],
  "kg": [
    { "name": "歌曲名", "hash": "ABCDEFG...", "albumId": "..." }
  ]
}
```

## ⚠️ 注意事项
- 本工具主要用于辅助开发，收集到的数据仅包含歌曲的基本信息（ID、Hash等），不包含音频流。
- 请确保本地 `3000` 端口未被占用。

## 🤝 贡献
开发者：**fssdyql**

如果你在使用过程中发现问题，欢迎提交 Issue。
