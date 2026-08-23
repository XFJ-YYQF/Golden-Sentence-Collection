# 金句录

一个轻量的个人金句收藏站。前端是纯静态页面，数据存储和写入鉴权通过 Cloudflare Pages Functions + KV 实现，部署在 Cloudflare Pages 上。

Powered By [Claude](https://claude.ai)

---

## 特性

- **随机展示** — 每次刷新页面，金句顺序随机打乱，总有新鲜感
- **标签筛选** — 自动提取所有标签，一键切换分类浏览
- **实时搜索** — Header 右上角搜索，支持正文与作者模糊匹配，命中词高亮
- **服务端存储** — 金句存放在 Cloudflare KV 中，添加 / 删除即时生效，无需重新部署
- **公开页面纯只读** — `index.html` 只负责浏览、搜索、复制，不包含任何写入入口
- **独立管理后台** — `/admin` 是单独的密钥登录页面，添加 / 删除 / 备份都在这里完成，和公开页面完全分开
- **自托管正文字体** — Noto Serif SC / Lora / DM Mono 从仓库加载；标题区的 Baloo 2 / Nunito 通过 Google Fonts 加载（见下方说明）
- **移动端适配** — Header 按钮自动收缩为图标，搜索框自适应屏幕宽度

---

## 文件结构

```
.
├── index.html                    # 公开页面（纯只读：展示、搜索、复制）
├── admin/
│   └── index.html                 # 管理后台（登录 + 添加 / 删除 / 备份）
├── fonts.css                      # 正文字体 @font-face 声明
├── fonts/                         # 自托管字体（约 4.5 MB）
├── functions/
│   ├── _shared.js                 # 鉴权、KV 读写等共用逻辑
│   └── api/
│       ├── quotes.js              # GET / POST  /api/quotes
│       ├── quotes/[id].js         # DELETE      /api/quotes/:id
│       └── auth/verify.js         # POST        /api/auth/verify（仅校验密钥，不读写数据）
├── wrangler.toml                  # 本地开发 / wrangler 部署时的 KV 绑定配置
└── _headers                       # 缓存与安全响应头
```

---

## 部署到 Cloudflare Pages

### 1. 创建 KV 命名空间

在 Cloudflare Dashboard 的 Workers & Pages → KV 中新建一个命名空间，例如取名 `quotes-kv`。

### 2. 推送仓库并连接 Pages 项目

将项目推送到 GitHub，在 Cloudflare Pages 中连接该仓库。构建命令留空，输出目录填根目录 `/`。

### 3. 绑定 KV 命名空间

进入 Pages 项目 → Settings → Functions → KV namespace bindings，新增一条：

- Variable name: `QUOTES_KV`
- KV namespace: 选择第 1 步创建的命名空间

### 4. 设置管理密钥

Settings → Environment variables → 新增变量：

- Variable name: `ADMIN_KEY`
- Value: 自己设置一个足够随机的字符串
- 勾选 **Encrypt**（作为 secret 存储，不会明文展示）

这个值就是你之后在 `/admin` 登录页面要输入的内容。没有它，任何人都不能添加或删除金句——包括你自己，所以设置完之后记得找个地方存好这个值。

### 5. 重新部署

触发一次新的部署（推一个空 commit 或在 Dashboard 点 Retry deployment），让 Functions 绑定生效。

---

## 本地开发

```bash
npm install -g wrangler
wrangler kv namespace create QUOTES_KV
# 把返回的 id 填进 wrangler.toml
wrangler pages dev . --kv QUOTES_KV
```

---

## 管理金句

访问 `/admin`（例如 `https://your-domain.com/admin`），会看到一个独立的登录页面：

1. 首次访问，输入部署时设置的 `ADMIN_KEY`，点击「进入」。密钥会先发到 `/api/auth/verify` 校验，正确后才保存到这台设备的 localStorage 并进入后台——之后无需重复输入
2. 「添加金句」面板填写正文（必填）/ 作者 / 标签，点击保存即写入 Cloudflare KV
3. 「全部金句」列表支持按正文 / 作者 / 标签筛选，每条右侧有删除按钮，删除前会有一次二次确认
4. 右上角「导出备份」随时可用，把当前列表下载为 JSON 文件
5. 「退出登录」会清除本地保存的密钥；密钥在服务端被更换后，下次任何写操作都会自动退回登录页面

公开页面 `index.html` 不包含任何管理入口——没有添加按钮、没有删除按钮，纯浏览体验，这也是为什么读接口可以完全公开而不必担心被误用。

---

## 个性化配置

### 修改署名与链接

打开 `index.html`，搜索 `footer-author` / `footer-github`，替换以下两处占位符：

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

正文字体文件来自 [Fontsource](https://fontsource.org)（MIT License），通过 npm 包解包后放入仓库：

```bash
npm install @fontsource/noto-serif-sc @fontsource/lora @fontsource/dm-mono
# 从各包的 files/ 目录取所需 woff2 文件即可
```

加载策略：汉字从 `chinese-simplified` 子集（约 1.5 MB）按需加载，浏览器缓存后后续访问无额外开销；拉丁字符走轻量 `latin` 子集（约 19 KB），并做了 `<link rel="preload">`。

标题区的 Baloo 2 / Nunito 目前通过 Google Fonts CDN 加载（仅请求实际用到的 4 个字重），这是本项目唯一的外部依赖。如果想彻底自托管，可用 `google-webfonts-helper` 之类工具导出对应 woff2 文件，放进 `fonts/` 并在 `fonts.css` 补充 `@font-face` 声明。

---

## 安全说明

- `/api/quotes` 的 GET 请求公开、无需鉴权（浏览量再大也只是读 KV，不构成风险）
- POST / DELETE / `auth/verify` 都需要请求头 `X-Admin-Key` 与 `ADMIN_KEY` 完全匹配，否则返回 401；`auth/verify` 只做校验，不读写任何金句数据，专门给 `/admin` 登录页用，不会因为登录尝试而产生副作用
- 输入内容长度做了截断限制（正文 2000 字、作者 200 字、标签 100 字），总条数上限 5000，防止被恶意写爆存储
- `/admin/*` 额外带有 `X-Robots-Tag: noindex, nofollow`，避免被搜索引擎收录；但请注意这只是不让它出现在搜索结果里，不是访问控制——真正的安全边界始终是 `ADMIN_KEY`，而不是这个地址有没有被公开链接过
- `_headers` 里配置了 `X-Frame-Options` / `X-Content-Type-Options` / `Referrer-Policy` 等响应头，以及 `/api/*` 的 `no-store` 缓存策略，避免边缘节点或浏览器缓存到过期的金句数据
- 如果发现密钥可能泄露，直接去 Cloudflare Dashboard 改一下 `ADMIN_KEY` 的值即可让旧密钥失效——下次任何写请求都会返回 401，`/admin` 会自动退回登录页

---

## License

MIT
