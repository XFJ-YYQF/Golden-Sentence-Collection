# 金句录

一个轻量的个人金句收藏站，纯静态，无需后端，可一键部署到 Vercel 或 Cloudflare Pages。

Powered By [Claude](https://claude.ai)

---

## 特性

- **随机展示** — 每次刷新页面，金句顺序随机打乱，总有新鲜感
- **标签筛选** — 自动提取所有标签，一键切换分类浏览
- **实时搜索** — Header 右上角搜索，支持正文与作者模糊匹配，命中词高亮
- **配置文件驱动** — 金句数据独立存放于 `quotes.js`，直接编辑即可管理内容
- **本地暂存** — 浏览器内添加的金句存入 localStorage，随时导出合并回配置文件
- **导出配置** — 支持复制到剪贴板或直接下载新的 `quotes.js`，替换后重新部署即永久保存
- **自托管字体** — Noto Serif SC / Lora / DM Mono，从仓库加载，不依赖外部字体
- **移动端适配** — Header 按钮自动收缩为图标，搜索框自适应屏幕宽度

---

## 文件结构

```
.
├── index.html        # 主页面（展示、搜索、添加、导出）
├── quotes.js         # 金句配置文件（你的核心数据）
├── fonts.css         # @font-face 声明，指向本地字体文件
└── fonts/            # 自托管字体（共 13 个 woff2 文件，约 4.5 MB）
    ├── noto-serif-sc-latin-{300,400,600}-normal.woff2
    ├── noto-serif-sc-chinese-simplified-{300,400,600}-normal.woff2
    ├── lora-latin-{400,400-italic,600}-normal.woff2
    └── dm-mono-latin-{400,500}-normal.woff2
```

---

## 快速开始

### 本地预览

直接用浏览器打开 `index.html` 即可，无需任何构建步骤。

> 注意：部分浏览器对本地 `file://` 协议有跨域限制，如遇字体加载失败，可用任意静态服务器：
> ```bash
> npx serve .
> # 或
> python3 -m http.server
> ```

### 部署到 Vercel

1. 将项目推送到 GitHub 仓库
2. 在 [Vercel](https://vercel.com) 中导入该仓库
3. Framework Preset 选 **Other**，无需任何构建配置，直接部署

### 部署到 Cloudflare Pages

1. 将项目推送到 GitHub 仓库
2. 在 Cloudflare Pages 中连接仓库
3. 构建命令留空，输出目录填 `/`（根目录），保存并部署

---

## 管理金句

### 方式一：直接编辑 `quotes.js`（推荐批量整理时使用）

```js
window.QUOTES_CONFIG = [
  {
    id: "q001",          // 唯一标识，不可重复
    text: "金句正文",
    author: "作者",       // 可选
    tag: "标签",          // 可选，用于分类筛选
    date: "1145-14-19"   // 可选，格式 YYYY-MM-DD
  },
  // ...
];
```

编辑完成后提交到 Git，Vercel / Cloudflare Pages 会自动重新部署。

### 方式二：通过页面添加，再导出

1. 点击右上角 **＋ 添加金句**，填写内容保存（存入 localStorage）
2. 积累一批后，点击 **↓ 导出配置**
3. 选择「复制到剪贴板」或「直接下载」，将生成的内容覆盖到本地 `quotes.js`
4. 推送到 GitHub，自动重新部署

---

## 个性化配置

### 修改署名与链接

打开 `index.html`，搜索 `✏️`，替换以下两处占位符：

```html
<!-- 个人主页 -->
<a class="footer-author" href="https://your-website.com" ...>
  你的名字
</a>

<!-- GitHub 项目 -->
<a class="footer-github" href="https://github.com/your-username/your-repo" ...>
```

### 快捷键

| 快捷键 | 功能 |
|--------|------|
| `⌘K` / `Ctrl+K` | 打开搜索框 |
| `Esc` | 关闭搜索框 / 关闭弹窗 |

---

## 字体来源

字体文件来自 [Fontsource](https://fontsource.org)（MIT License），通过 npm 包解包后放入仓库：

```bash
npm install @fontsource/noto-serif-sc @fontsource/lora @fontsource/dm-mono
# 从各包的 files/ 目录取所需 woff2 文件即可
```

加载策略：汉字从 `chinese-simplified` 子集（约 1.5 MB）按需加载，浏览器缓存后后续访问无额外开销；拉丁字符走轻量 `latin` 子集（约 19 KB）。

---

## License

MIT
