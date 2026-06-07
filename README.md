# 📚 英语学习助手

覆盖初中到高中（7-12年级）全部核心单词和语法的完整英语学习系统。

## 功能模块

| 模块 | 说明 |
|------|------|
| 📚 **单词学习** | 按年级分组，闪卡记忆 + 单词列表 + 英译中/拼写/听音三种测验模式 |
| 📝 **语法学习** | 初中25个 + 高中25个核心语法点，含概念讲解、例句、常见错误、配套练习 |
| 📖 **阅读理解** | 初中/高中分级阅读文章，含5种理解题型（主旨、细节、推理、词义等） |
| 🎧 **听力练习** | 浏览器语音合成驱动，听写模式 + 听音选义模式，可调节语速 |
| 📝 **模拟考试** | 自动组卷（单选30题+完形10题+阅读），60分钟倒计时，即时判分 |
| 📊 **学习统计** | 学习进度环形图、7天热度柱状图、考试成绩趋势、错题本 |

## 快速开始

### 方式一：Python（推荐）
```bash
cd english-learning-app
python -m http.server 8080
```
然后在浏览器打开 http://localhost:8080

### 方式二：Node.js
```bash
cd english-learning-app
npx serve . -p 3000
```

### 方式三：VS Code Live Server
在 VS Code 中安装 Live Server 插件，右键 `index.html` → Open with Live Server

## 项目结构

```
english-learning-app/
├── index.html                 # 主入口
├── css/                       # 样式文件
│   ├── reset.css              # CSS Reset
│   ├── variables.css          # CSS 变量（颜色/间距/主题）
│   ├── layout.css             # 布局（侧边栏+主内容区+网格+按钮+表单）
│   ├── components.css         # 组件样式（闪卡/测验/表格/语法树等）
│   └── pages.css              # 页面特有样式（首页/单词/阅读/听力/考试等）
├── js/
│   ├── app.js                 # 应用初始化、路由注册、全局状态
│   ├── router.js              # Hash SPA 路由器
│   ├── modules/               # 功能模块
│   │   ├── vocabulary.js      # 单词学习
│   │   ├── grammar.js         # 语法学习
│   │   ├── reading.js         # 阅读理解
│   │   ├── listening.js       # 听力练习
│   │   ├── exam.js            # 模拟考试
│   │   └── stats.js           # 学习统计
│   ├── components/            # 可复用组件
│   │   ├── flashcard.js       # 闪卡（3D翻转）
│   │   ├── quiz.js            # 测验（选择/拼写/听力）
│   │   ├── progress-ring.js   # 环形进度图（Canvas）
│   │   └── word-list.js       # 单词列表表格
│   └── utils/                 # 工具
│       ├── storage.js         # localStorage 封装
│       ├── tts.js             # Web Speech API 封装
│       ├── quiz-engine.js     # 测验生成引擎
│       └── data-loader.js     # JSON 数据加载器
└── data/                      # 学习数据
    ├── vocabulary/            # 词汇库（grade7-12.json）
    ├── grammar/               # 语法库（junior.json/senior.json）
    └── reading/               # 阅读库（junior.json/senior.json）
```

## 数据说明

- **词汇库**：每个年级包含代表性词条（约60-70词/年级），含英文、中文、音标、词性、例句
- **语法库**：初中10个核心语法点 + 高中10个进阶语法点，每个含完整讲解+例句+常见错误+练习
- **阅读库**：初中3篇 + 高中3篇，每篇含5道理解题
- 所有数据为 JSON 格式，可随时扩充。补充词条时参照现有数据结构即可

## 进度存储

学习进度、错题本、考试记录保存在浏览器 localStorage 中。可在「学习统计」页面导出/导入数据备份。

## 浏览器兼容

- Chrome / Edge（推荐）：完整支持
- Firefox：完整支持
- Safari：听力功能可能受限（需用户手动触发语音）
- 需要浏览器支持 ES Module 和 Web Speech API
