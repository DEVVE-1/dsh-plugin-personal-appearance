# 个性化外观 · personal-appearance

> **免责声明**：本项目**仅供娱乐**，是个人兴趣做的界面皮肤实验，**非官方产品**，与 DeepSeek、OpenAI、Anthropic 均无任何隶属、合作或背书关系。插件里出现的 Codex / Claude Code 图形、字标、配色与文案，版权归各自所有者，此处仅作致敬与学习之用，**不用于任何商业用途**。若权利人认为使用不妥，提个 issue，我会立即调整或移除相关素材。

给 DSH 客户端换层皮。左上角标题栏点一下，整套界面跟着变，不用重启。

现在有三套主题：**默认**（原样）、**Codex**、**Claude Code**。换的不只是颜色 —— 配色、字体、圆角、投影、滚动条、左上角的 logo、新会话首页那句话，一起换。另外还单独给了「圆角风格」、可调的「毛玻璃」和 iOS 手感的开关动效。

纯前端实现，Host 半边是个空壳，没有接口、不写文件、不联网。

## 能换成什么样

| | 默认 | Codex | Claude Code |
| --- | --- | --- | --- |
| 底色 | ui-theme 原样 | `#ffffff` / 深色 `#181818` | `#faf9f5` / 深色 `#141413` |
| 面板 | | `#ffffff` / `#2d2d2b` | `#fffefb` / `#262624` |
| 正文 | | `#1a1c1f` / `#ffffff` | `#141413` / `#faf9f5` |
| 强调 | | 浅色 `#339cff` / 深色 `#0169cc` | `#d97757`（主按钮浅色 `#c4553d`） |
| 圆角 | `4/8/12/16/20/28` | `3/5/7/8/10/12` | `6/8/12/16/20/20` |
| 投影 | 系统默认 | 全部取消，只留 0.5px 描边 | 暖色低透明度柔光 + 描边 |
| 字体 | 系统栈 | SF Pro 系 / SF Mono 系 | Styrene·Söhne 系（退到 Calibri/Candara）/ JetBrains Mono 系 |
| 字距 | 0 | `-0.006em` | `+0.004em` |
| 菜单 | 半透明 + 模糊 | 不透明、无模糊 | 奶油半透明 + 更强模糊 |
| 思考图标 | DeepSeek 鲸尾 | Codex 图形 | Claude 星芒 |
| 左上角 | DeepSeek 鱼标 + 字标 | 官方云状 `>_` 标 + `Codex` | 官方星芒 + 官方 `Claude Code` 字标 |

- **Codex**：扁平、高对比、几乎无色相。取消所有 box-shadow（`--dsw-elevation-*` 只保留描边层），菜单做成不透明面板，滚动条中性灰。
- **Claude Code**：暖色温、编辑气质。中性色阶整体调暖（越深越偏褐），投影带暖色，Markdown 的 `h1/h2/h3` 走 Georgia 衬线（Tiempos 的替身）。

## 安装

插件包已经是可直接加载的 bundle（`package.json` 里有 `dsh.bundle.patch` + `dsh.client`），`lib/` 下就是最终产物，没有构建步骤。

```powershell
cd $env:DSH_HOME\profiles\desktop
pnpm add file:<本目录的绝对路径>
```

然后把 `personal-appearance` 加进这个 profile 的 `package.json` 里 `dsh.profile.bundles` 数组，刷新页面。浏览器半边才会进模块表。

装的位置不对、或者没加进 `dsh.profile.bundles`，表现都是「标题栏没多出按钮」——先查这两处。

## 当前功能

### 主题

三档，切换即时生效。不只是换颜色——**配色、字体、圆角、投影、滚动条一起换**。

选择保存在 `localStorage`（`personal-appearance:theme`，值 `default` / `codex` / `claude`）。

### 左上角品牌

选 `Codex` / `claude` 时，侧边栏左上角的 logo 和名字一起换掉；选回 `默认` 恢复 DeepSeek 鱼标和原来的字标。

- **图形**是官方单色矢量：**Codex** 的「云状外框 + 终端提示符 `>_`」来自 [Devicons](https://devicons.io/icons/codex/)（MIT）；**Claude Code** 的星芒来自 [simple-icons](https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/claude.svg)（MIT）。24×24、`fill: currentColor`，浅色/深色/悬停态都跟着文字颜色走，不用维护第二套色板。
- **字标不是排版出来的，而是官方矢量路径**：`Claude Code` 直接取官方文档站导航栏的 lockup（`mintcdn.com/claude-code/…/logo/light.svg`，原始 `viewBox 0 0 254 28`，内容是「星芒 + Claude Code Docs」）。左侧星芒单独进 mark 槽（留着会和 mark 重复），尾部 `Docs` 裁掉，只保留 `Claude Code` 十个字母的原始路径，`viewBox` 收到 `28.4 2.6 158.2 22`。官方文件里 `a` / `d` / `e` 带 `fill-rule="evenodd"`，**必须原样保留**，否则字腔会被填实——这一点和 Codex 那条路径正好相反。
- 字标高度取 21px（按默认那套 DeepSeek 字标量出来的字身高度），宽度按 `viewBox` 比例算，换字标不会被拉变形。
- **Codex 没有官方字标矢量**：`openai.com` 和 `chatgpt.com` 对本机一律 403，官方仓库 `openai/codex` 里只有 CLI 截图 PNG（用 jsDelivr 的文件树确认过，全仓没有 logo/字标 SVG）。所以 Codex 的名字仍是文字，只是把 600 字重 + `.04em` 字距换成 500 字重 + `-0.01em`——大字号下发糊的主因就是这两项。将来有官方字标文件，填进 `BRAND_SPEC.codex.wordmark` 即可，组件已经支持。

### 思考中的鲸尾

选 `Codex` / `claude` 时，会话里那行「深度求索中，用时 xx 秒」前面的鲸尾也换成对应主题的 logo（Codex 云状 `>_` 图形、Claude 星芒），颜色跟着那行的深潜色走，不额外配一套色板。

- 原图标是 ui-chat 的 `RunningWhaleTail`：一张 28×28、60 帧 × 50ms 的 **APNG 遮罩**，尾巴摆动的动画烧在位图帧里，没有单独的 CSS 动画可以复用，所以「图形和动效只换图形」没法字面做到。
- 这里把原 APNG 的 60 帧逐帧和第一帧做「绕尾根旋转」的配准，量出鲸尾整体每帧的摆角；换 logo 时照同样的 **60 帧 / 3 秒 / 20fps** 出关键帧，并用 `step-end` 让每帧停满 50ms 再跳，和位图逐帧切换一致，不会多出原动画没有的平滑过渡。开头 8 帧、结尾 8 帧的静止也原样保留。鲸尾本身的弯曲是图形特有的形变，刚性的 logo 搬不过去，这是唯一无法一比一保留的部分。
- 接管条件和官方那段 CSS 完全一致：`@supports (mask-mode:alpha)` + `@media (prefers-reduced-motion:no-preference) and (forced-colors:none)`。三条里任一不满足（浏览器不支持 mask、系统开了「减少动态效果」、强制色模式），官方本来就退回静态鲸尾 SVG，这里也一并不接管，回退表现和默认主题一样，不会出现两套图标打架。
- 默认主题下这段 CSS 直接是空串，原鲸尾、原动效一个字节都不碰。
- 定位用 `[class*="runningWhale…"]` 属性匹配，不吃构建产物的哈希类名。

### 空会话主界面

新建会话时居中的大 logo、名字和那一句话一起换：

- **logo**：`conversation.hero.brand.mark` 是 `single` 槽（owner 传 `size: 34` 和保留几何的 `className`），注册自己的 `Mark` 组件就顶替了 DeepSeek 鱼标；悬停摆动动画因为复用了 owner 的 class，仍然保留。Codex 把尺寸乘 `heroMarkScale`（1.35×，即 34→46）——它主界面上没有名字，logo 要顶上来。
- **名字**：有官方字标矢量的主题（Claude Code）把同一批 path 做成遮罩铺上去（`background-color: currentColor` + `mask-image`，浅色深色都自动跟）；**没有矢量字标的 Codex 在主界面不摆名字**，只留 logo 和欢迎语。
- **一句话**：保留这一行。位置是「欢迎语」，不是品牌 slogan，所以两边口吻不同——Codex 用开场问句「今天我能帮你构建什么？」，Claude Code 用官方 slogan（文档概述首句、产品页首屏三句之一）。**每次启动客户端随机取一条，之后固定不变**（点新会话、切主题再切回来都是同一条），下次启动才重新抽。
- **字号分两档**：欢迎语是主界面上的主角，按标题处理（`26px / 600 / 主文字色`）；品牌 slogan 是副标题语气（`15px / 400 / 次级色`）。档位由 `BRAND_SPEC[theme].heroLineEmphasis` 决定。

名字和这句话都挤在 `t("hero.headline")` 那个纯文字节点所在的 `titleGroup` 里，**没有自己的 class**，也没有对应的插槽，所以只能按结构定位：

```css
[class*="titleGroup"]>span{display:none}
[class*="titleGroup"]::before{content:"";order:-2;display:block;height:1.16em;
  width:calc(1.16em * 7.19);background-color:currentColor;
  mask-image:url("data:image/svg+xml,…");mask-size:100% 100%}
[class*="titleGroup"]::after{content:"…";order:-1;font-size:15px;
  color:var(--dsw-alias-label-secondary)}
```

- 藏掉标题里的两个 span（原标题和「预览版」徽标），再用 `::before` 补名字、`::after` 放那句话；`order:-2 / -1` 让它们排在前面。
- 高度用 `em`（相对 headline 的 26px 字号），宽度按字标 `viewBox` 的宽高比推；`mask-size:100% 100%` 只是铺满这个已算好的盒子，不会把字拉变形。
- 那句话单独一张 `style[data-plugin-css="personal-appearance/heroLine.css"]`：换文案只改这张表里的 `content`，不用重铺主题表（后者带着几 KB 的字标 data URI，重建一次既不划算也会闪一下）。
- **文案什么时候抽**：插件加载（= 启动客户端）时按当前主题抽一条并固定，之后不做任何轮询或轮换。
- 定位用的是 `[class*="…"]` 属性匹配，不是构建产物的哈希类名（`WOwLGG_titleGroup` 这种），DSH 升版重新构建后也不会失配。

候选文案（`BRAND_SPEC[theme].heroLines`）：

| 主题 | 文案 | 出处 |
| --- | --- | --- |
| Codex | `今天我能帮你构建什么？` | 欢迎语，不是官方 slogan |
| Claude Code | `An agentic coding tool that reads your codebase` | 官方文档概述首句 |
| Claude Code | `Hand Claude a bug fix, test, or multi-day migration` | 官方产品页首屏 |
| Claude Code | `Steer and review from your terminal, IDE, Slack, or web` | 官方产品页首屏 |

### 圆角风格

三档，在主题之上再做一次覆盖。

- `默认`：跟随主题（不注入覆盖）。
- `小圆角`：整体收紧一档（`2/4/6/8/10/12px`），窗口内容区圆角 `8px`。
- `macOS`：桌面端比例（`4/6/10/12/14/14px`），窗口内容区圆角 `12px`。

选择保存在 `localStorage`（`personal-appearance:radius`，值 `default` / `small` / `macos`），旧键 `personal-appearance:small-radius` 会读取一次并迁移。

> 这里改的是**页面内部**的圆角（按钮、卡片、输入框、弹窗、菜单，以及侧边栏与主区交界处的窗口内容 R 角）。窗口自身的四个外角由系统窗口管理器绘制：Windows 11 会自动给约 8px 圆角，Windows 10 是直角，CSS 无法改变——要做到 macOS 那种整窗圆角，需要主进程把 `BrowserWindow` 设为透明窗口并由页面自绘边框，这超出客户端插件的能力范围。

### 毛玻璃

菜单里「毛玻璃」一行是总开关，下面两条滑块实时调参：**模糊** 0–40px、**不透明度** 20–90%，再下面一行是「光晕」——只有这两个字加一个小拨杆，没有说明文字。开着的时候面板、侧栏、输入框、菜单这些表面变成半透明，后面透出自己铺的一层柔焦背景；菜单和浮层还会额外吃到 `backdrop-filter`，滚动内容从下面过的时候是真模糊，不是半透。光晕关掉就只剩纯色玻璃底。

设置保存在 `localStorage`（`personal-appearance:glass`，形如 `{"on":true,"blur":18,"opacity":55,"glow":true}`）。默认关着——装上插件不等于主动改界面；老版本存下来的设置里没有 `glow` 字段，按「开」处理，观感不变。

设置页（`[data-shortcut-modal='settings']`）和各类弹窗（删除会话确认、会话改名、插件确认等 `[role='dialog']` / `[role='alertdialog']`）是例外：面板保持不透明底色，两条滑块碰不到它们，只受开关控制；开着的时候只在弹窗外层容器上加固定参数的背景虚化（`blur(6px) saturate(115%)`），也就是四周一圈很轻的毛玻璃。对话气泡的颜色也不改——`--dsw-specific-bubble` 保持主题原色，否则气泡会被玻璃白底盖掉颜色。

输入框下方那排 tok/s、用量和上下文进度（`[data-composer-dock]`）也不跟玻璃走：玻璃开启时给它铺一块主题原本的页面底色（`--pa-solid-base`，按主题/深浅色取值），看起来就是毛玻璃关闭时的样子。

光晕（`#pa-glass-bg` 里的三个光斑）只在毛玻璃开启时存在：它是玻璃的背景层，关掉毛玻璃整层就摘掉，关掉「光晕」那一行的拨杆则只停画光斑、保留玻璃底色。为了让它在不透明度拉高时也看得见，玻璃模式下侧栏和主区自己的底色（`sidebarCol` / `centerCol` / 侧栏 root）都清掉，只留最外层 `frame` 那一层表面——这样整窗只有一层半透明底，光晕不会在侧栏和主区的交界处被叠死一截。不透明度上限也压在 90%。

> 玻璃的底色跟所选主题走（Codex 纯白/深灰，Claude 奶油/暖黑），换主题不会出现「冷白糊在暖底上」。实现上改的是 ui-theme 的**表面令牌**（`--dsw-alias-bg-base/layer-*`、`--dsw-specific-sidebar-fill` 等），不是按类名去覆盖某个组件，所以 DSH 升版重构建后不会整片失效。

### 动效

iOS 风格的弹簧手感，只动这几个地方：

- **打开次级菜单**：面板以入口按钮的中轴为 `transform-origin`（按按钮实际位置算），从 `scale(.94)` + 上移 5px 弹到原位，340ms 一条 `linear()` 弹簧曲线（约 3% 过冲）。旧版是 120ms、`translateY(-2px)` 的线性淡入。
- **关闭次级菜单**：朝同一个触发点收回（`scale(.96)` + 上移 4px、淡出），180ms `cubic-bezier(.4,0,1,1)` 的 ease-in——是被收走，不是再弹一下。`animationend` 之后摘节点，另有一条兜底定时器，动画被系统关掉也不会把节点留在 shadow root 里。
- **切换分段控件**：选中背景不再画在按钮自身上，而是独立的白色滑块 `.pa-seg-thumb`；点击时按选中项的 `offsetLeft / offsetWidth` 重新落位，`transform`/`width` 走 360ms 弹簧，文字颜色用 180ms 线性过渡淡变。
- 弹簧那两处都先声明 `cubic-bezier` 兜底、再声明 `linear()` 弹簧（不认 `linear()` 的浏览器会在解析阶段整条丢掉后一条，保留兜底），并带 `prefers-reduced-motion: reduce` 降级：系统开了「减少动态效果」就只保留即时切换、关闭时直接摘节点。
- 两种情况关菜单不播退场、直接摘：打开弹簧（340ms）还没跑完就关（`pa-out` 会从全不透明重新开始、闪一下），以及窗口缩放/失焦和插件卸载（位置已经失效，没必要再演一遍）。退场途中再点开入口，会把正在淡出的面板直接收掉、重新弹一个。
- 滑块位置用布局值 `offset*` 而不是 `getBoundingClientRect()`：菜单打开时面板正带着 `scale()` 动画，后者量到的是缩放后的尺寸，滑块会落偏。

## 结构

| 文件 | 作用 |
| --- | --- |
| `cordis.patch.yml` | bundle 补丁：插入一行 Host 插件 |
| `lib/index.js` | Host 半边（空壳，外观全部在浏览器半边完成） |
| `lib/client.js` | 浏览器半边：标题栏入口、次级菜单、主题/圆角/毛玻璃样式 |
| `locale/*.json` | 插件列表里的标题与描述 |
| `icon.svg` | 插件图标 |

## 实现要点

- 标题栏菜单条是桌面 preload 用 `div[data-windows-menu]` + open shadow root 注入的。插件把按钮 append 进同一个 `[role=menubar]`，并用 `MutationObserver` 保证始终排在 `button[data-file-cleanup]` 右边。
- 次级菜单直接挂在同一个 shadow root 里（不经过 `shell.overlay`），位置由入口按钮的 `getBoundingClientRect()` 计算。这样菜单和按钮同层，点击不会被 overlay 的 pointer-events 规则吞掉；点空白、按 Esc、窗口失焦或缩放都会关闭。
- 主题和圆角合并成**一张** `style[data-plugin-css="personal-appearance/appearance.css"]`，主题在前、圆角覆盖在后拼接。这样「圆角风格」永远是最后一个声明，不依赖选择器优先级，也不必担心 `!important` 打架。
- 换肤靠改**色阶**而不是逐个覆盖别名：ui-theme 里上百个 `--dsw-alias-*` 全部引用 `--dsw-static-*`，改色阶就等于整体换肤。字体改 `--dsh-font-family-*-default`（用户自定义字体仍然排在前面），形状改 `--dsw-radius-*`。
- 两组特殊令牌要写到 `html:root body *`：`--dsw-elevation-*` 和 `--dsw-elevation-stroke` 在 ui-theme 里是逐元素声明的（`body, body *`），只覆盖 `body` 影响不到子元素。
- 投影用**全透明**（`0 0 0 0 transparent`）而不是 `none`：有些组件会把两层阴影拼进同一条 `box-shadow`，`none` 会让整条声明失效。
- 左上角品牌走**插槽注册**（不是 CSS 藏节点）：`sidebar.brand.mark` / `sidebar.brand.name` 都是 `single` 槽，注册自己的占位组件、并把 `priority` 设为负值（实测 single 槽**越小越优先**，官方那条是 0），官方组件就会被顶替成 `active:false`。早先用 `::after` + `display:none` 的写法藏不住文字节点，会渲染成「deepseek Claude」并排，已废弃。
- 空会话那个「名字 + 一句话」也只能靠样式表：`hero.headline` 是纯文字节点、没有 class、也没有插槽，所以用 `[class*="titleGroup"]>span` 藏掉「原标题 + 预览版徽标」，再用 `::before` 铺左上角同一份字标矢量（`mask-image` + `background-color: currentColor`）、`::after` 放那句话。
- 毛玻璃直接照 Aqua 的 compat 做法：表面令牌（`--dsw-alias-bg-*`、`--dsw-specific-*`、`--dsw-alias-markdown-*` 这一整张清单）换成半透明。滑块语义与效果一比一：**不透明度**滑块的值就是表面 alpha（侧栏 fill 也用同一个 alpha），**模糊**滑块的值就是 `backdrop-filter` 和背景光斑的 blur 值，不再乘系数。`backdrop-filter` 只加在菜单/浮层/气泡/composer 和「展开状态」的右侧栏 pane 上（`[data-sidebar-right-open] [data-dockkit-pane]`）；页头不加，加了会在主栏左上形成一块虚化边界，看起来像阴影、把光晕截断。玻璃模式下还会清掉两列自己的底色和标题栏拖拽带的底色，让整窗只剩 `frame` 一层半透明，光晕才能连续。**故意不对 `[class*='panel']`/`[class*='card']` 全局加模糊**：右侧栏收起后容器还在 DOM 里，本身透明的元素一加 `backdrop-filter` 就会显示成一块虚化，看起来像侧栏没开却盖了层玻璃；也不碰 `[role='dialog']`，会把它的 fixed 定位搞乱。背景层是一条 `z-index:-1` 的固定层。开关只切 `html[data-pa-glass]` 属性，滑块只改两条自定义属性——都不重建样式表，换主题时才重新生成一次。
- 所有按钮、样式、监听器都通过 `ctx.effect` 注册并在插件卸载时清理。

## 已知边界

- 只改页面内部的样式和插槽，**不碰窗口本身**：窗口外圆角、标题栏高度这些由客户端/系统决定。
- 依赖 ui-theme 的令牌词表（`--dsw-static-*` / `--dsw-alias-*` / `--dsw-radius-*` / `--dsw-elevation-*`）。DSH 大版本若重命名这批令牌，配色会整片失效；结构定位用的是 `[class*="…"]`，类名哈希变了不影响。
- 左上角品牌依赖 `sidebar.brand.*` 插槽、空会话主界面依赖 `titleGroup` 的结构。上游若删掉插槽，这部分会静默失效（其余主题样式不受影响）。
- 「思考中」图标依赖 ui-chat 里 `runningWhaleAnimated` / `runningWhaleStill` 这两个类名的结构（`[class*="…"]` 匹配），以及它用 APNG 遮罩画动画的实现方式。上游若改成别的图标或动画方案，这一处会静默退回原鲸尾。

## 参考素材

- Anthropic 品牌与排版：`#d97757` / `#faf9f5` / `#141413` / `#e8e6dc`，Styrene + Tiempos — [mundizzle/claude-theme](https://github.com/mundizzle/claude-theme)、[Anthropic 设计系统拆解](https://github.com/Khalidabdi1/design-ai/blob/main/design-md/anthropic/DESIGN.md)
- anthropic.com/claude 的 DOM 实测值：底色 `#faf9f5`、正文 `#141413`、棕色强调 `#cc785c`、圆角阶梯 `4/6/8/12/16/19px`、字体 `anthropicSans`（Söhne 系）+ Tiempos 衬线 — [ASI Design Gallery](https://asi.co.jp/gallery/sites/?slug=anthropic-claude)
- Codex 主题格式与内置深色主题实测值（`#181818` / `#2d2d2b` / `#ffffff` / `#339cff`，字体 SF Pro Text + SF Mono）— [Codex 主题机制](https://codex.danielvaughan.com/2026/03/30/codex-app-theming-customisation/)、[codex-themes](https://github.com/shaw-baobao/codex-themes)、[awesome-codex-themes](https://github.com/mcpso/awesome-codex-themes)
- DSH 自身的令牌词表与分层规则：`dsh-client-ui-theme` 的 `design-platform.css` / `gradient-shadow-text.css`（`--dsw-shadow-lv*`、`--dsw-elevation-*`、`--dsw-menu-backdrop-filter`）。
- Claude Code 的 slogan 原文：[Claude Code 文档概述](https://code.claude.com/docs/en/overview) 首句、[Claude Code 产品页](https://claude.com/product/claude-code) 首屏两句。
- 品牌图形与字标：Codex 图形取自 [Devicons](https://devicons.io/icons/codex/)（MIT，云状外框 + `>_` 提示符）；Claude Code 星芒取自 [simple-icons](https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/claude.svg)（MIT）；Claude Code 字标取自官方文档站导航栏的 lockup（https://mintcdn.com/claude-code/c5r9_6tjPMzFdDDT/logo/light.svg ，裁掉尾部 `Docs`）。三者都直接内联官方 path 数据，不再手绘。此前用过的 OpenAI 结形标（GPT 标）不是 Codex 产品图形，已替换。

## 授权与声明

代码以 **MIT** 发布，随便用、随便改。

**声明**：本项目**仅供娱乐**，非官方、非商业，纯属个人兴趣。Codex / Claude Code 的名称、图形、字标、配色与文案，版权归 OpenAI、Anthropic 各自所有，此处仅作学习与主题致敬之用；本项目与上述两家公司**无任何隶属、合作或背书关系**，也不代表官方立场。插件只通过公开的 CSS 变量与 UI 插槽改样式，不修改、不反编译、不重分发任何官方二进制或源码。若权利人认为其中某处使用不妥，请提 issue（或邮件），我会在第一时间调整或移除。
