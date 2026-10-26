window.__ModuleLoader__.load({
	id: "personal-appearance",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

		/** React 来自浏览器模块表；左上角品牌用组件占位，不再靠 CSS 伪元素。 */
		const React = require("react");
		const h = React.createElement;

		/** 字典命名空间。 */
		const NS = "personal-appearance";
		/** 桌面 preload 注入的标题栏菜单条。 */
		const MENUBAR_HOST = "[data-windows-menu]";
		/** 「文件清理」按钮的标记；个性化外观要排在它右边。 */
		const CLEANUP_BUTTON = "button[data-file-cleanup]";
		/** 本插件按钮的标记。 */
		const BUTTON_ATTR = "personalAppearance";
		/** 本插件菜单的标记。 */
		const MENU_ATTR = "personalAppearanceMenu";
		/** 圆角档位的持久化键。 */
		const STORAGE_KEY = "personal-appearance:radius";
		/** 早期只支持「小圆角开关」时的键，读一次做迁移。 */
		const LEGACY_STORAGE_KEY = "personal-appearance:small-radius";
		/** 可选圆角档位。 */
		const MODES = ["default", "small", "macos"];
		/**
		 * 首次加载（还没存过档位）时用哪一档。
		 *
		 * 取「默认」：装上插件不等于改界面，用户没主动选之前保持 ui-theme 原样。
		 */
		const FALLBACK_MODE = "default";
		/** 主题的持久化键。 */
		const THEME_STORAGE_KEY = "personal-appearance:theme";
		/** 可选主题。 */
		const THEMES = ["default", "codex", "claude"];
		/**
		 * 首次加载（还没存过主题）时用哪一套。
		 *
		 * 同样取「默认」：不主动选主题就不碰原有配色、字体和品牌。
		 */
		const FALLBACK_THEME = "default";
		/**
		 * 品牌方案版本。
		 *
		 * 只记录品牌方案换代，不再拿它清空用户的主题选择：旧值还能不能用交给
		 * THEMES 白名单判断，非法值才回退默认主题。这样版本升级不会把已经选了
		 * Codex / Claude 的用户重置回默认。
		 */
		const THEME_VERSION_KEY = "personal-appearance:theme-version";
		const THEME_VERSION = "3";
		/** 主题分段控件上的小色点，用各主题的强调色示意。 */
		const THEME_DOTS = { default: "#a6a6a4", codex: "#339cff", claude: "#d97757" };
		/** 次级菜单宽度（px）。 */
		const MENU_WIDTH = 268;
		/** 菜单样式表标记。 */
		const MENU_STYLE = "personal-appearance/menu.css";
		/** 外观样式表标记（主题 + 品牌 + 圆角合并成一张）。 */
		const APPEARANCE_STYLE = "personal-appearance/appearance.css";
		/** 毛玻璃设置的持久化键。 */
		const GLASS_STORAGE_KEY = "personal-appearance:glass";
		/** 毛玻璃默认值：默认关着——装上插件不等于主动改界面。 */
		const GLASS_DEFAULT = { on: false, blur: 18, opacity: 55, glow: true };
		const GLASS_BLUR_MIN = 0;
		const GLASS_BLUR_MAX = 40;
		const GLASS_BLUR_STEP = 2;
		const GLASS_OPACITY_MIN = 20;
		// 上限压到 90：留一成透光，背景那层光晕才不会被完全盖死。
		const GLASS_OPACITY_MAX = 90;
		const GLASS_OPACITY_STEP = 5;
		/** 滑块拖动时合并落盘的间隔（ms）：视觉每帧更新，localStorage 只写最后一次。 */
		const GLASS_PERSIST_MS = 250;
		/**
		 * 玻璃板的底色。浅色/深色各一份，跟着主题换：在 Claude 的奶油底子上
		 * 不能糊一层冷白，Codex 的纯白底也不该泛蓝。
		 */
		const GLASS_TINT = {
			default: { light: "255 255 255", dark: "30 30 30" },
			codex: { light: "255 255 255", dark: "24 24 24" },
			claude: { light: "250 249 245", dark: "20 20 19" },
		};
		/**
		 * 各主题「毛玻璃关闭时」的页面底色。给不该跟着玻璃变透的局部用，
		 * 铺上去就是关灯时的观感。
		 */
		const GLASS_SOLID = {
			default: { light: "255 255 255", dark: "24 24 24" },
			codex: { light: "255 255 255", dark: "24 24 24" },
			claude: { light: "250 249 245", dark: "20 20 19" },
		};
		/**
		 * 背景光斑的强调色，跟所选主题的强调色走。
		 * 默认主题取 DeepSeek 品牌蓝 #4d6bfe 提亮后的两档，蓝色系、不带紫。
		 */
		const GLASS_ACCENT = {
			default: { a: "#8ea4ff", b: "#6f9bff" },
			codex: { a: "#339cff", b: "#5cd0ff" },
			claude: { a: "#d97757", b: "#e8a87c" },
		};
		/** 背景层节点 id。 */
		const GLASS_LAYER_ID = "pa-glass-bg";

		/**
		 * 两套圆角令牌，作为主题之上的覆盖。
		 *
		 * - small：在 ui-theme 的 4/8/12/16/20/28 基础上整体收紧一档。
		 * - macos：按 macOS 桌面端的比例取档（窗口 12、面板 14、控件 10/6）。
		 *
		 * 拼在主题样式后面，同选择器下靠顺序压过主题自带的圆角；
		 * 999px 的胶囊（标签、开关、头像）不受影响。
		 */
		const RADIUS_CSS = {
			small: [
				"html:root{",
				"--dsw-radius-xs:2px;",
				"--dsw-radius-sm:4px;",
				"--dsw-radius-md:6px;",
				"--dsw-radius-lg:8px;",
				"--dsw-radius-xl:10px;",
				"--dsw-radius-panel:12px;",
				"}",
				'[data-windows-titlebar] [class*="_frame"]{--dsh-windows-content-radius:8px !important}',
			].join(""),
			macos: [
				"html:root{",
				"--dsw-radius-xs:4px;",
				"--dsw-radius-sm:6px;",
				"--dsw-radius-md:10px;",
				"--dsw-radius-lg:12px;",
				"--dsw-radius-xl:14px;",
				"--dsw-radius-panel:14px;",
				"}",
				'[data-windows-titlebar] [class*="_frame"]{--dsh-windows-content-radius:12px !important}',
			].join(""),
		};

		/**
		 * 两套主题。
		 *
		 * 颜色只改 `--dsw-static-*` 色阶：ui-theme 里上百个 `--dsw-alias-*` 全都引用它，
		 * 改色阶就等于整体换肤。色阶在浅/深色下是同一份，个别必须在两套方案里取
		 * 不同值的表面（页面底色、卡片、分割线、主按钮、滚动条、菜单）再按
		 * `body[data-ds-dark-theme]` 单独覆盖。
		 *
		 * 字体改 `--dsh-font-family-*-default`（用户自己在设置里填的字体仍然优先），
		 * 形状改 `--dsw-radius-*`，投影改 `--dsw-shadow-lv*` 与 `--dsw-elevation-*`。
		 *
		 * 都用 `html:root` / `html:root body` 提优先级，压过 ui-theme 写在
		 * `:root` / `body` 上的同名声明。
		 */
		const THEME_CSS = {
			codex: [
				// 冷灰中性阶（去掉默认的蓝紫偏色）
				"html:root body{",
				"--dsw-static-neutral-bluish-00:#ffffff;",
				"--dsw-static-neutral-bluish-50:#f7f7f6;",
				"--dsw-static-neutral-bluish-60:#f4f4f3;",
				"--dsw-static-neutral-bluish-75:#f1f1f0;",
				"--dsw-static-neutral-bluish-100:#ececeb;",
				"--dsw-static-neutral-bluish-150:#e7e7e6;",
				"--dsw-static-neutral-bluish-200:#e2e2e1;",
				"--dsw-static-neutral-bluish-300:#d4d4d3;",
				"--dsw-static-neutral-bluish-400:#a6a6a4;",
				"--dsw-static-neutral-bluish-500:#8d8d8b;",
				"--dsw-static-neutral-bluish-600:#767674;",
				"--dsw-static-neutral-bluish-700:#5a5a58;",
				"--dsw-static-neutral-bluish-750:#424241;",
				"--dsw-static-neutral-bluish-800:#333332;",
				"--dsw-static-neutral-bluish-850:#2d2d2b;",
				"--dsw-static-neutral-bluish-875:#252524;",
				"--dsw-static-neutral-bluish-900:#1e1e1d;",
				"--dsw-static-neutral-bluish-950:#181818;",
				"--dsw-static-neutral-bluish-1000:#101010;",
				// 品牌蓝 -> Codex 亮蓝
				"--dsw-static-deepseek-50:#eef8ff;",
				"--dsw-static-deepseek-100:#d9efff;",
				"--dsw-static-deepseek-200:#bfe4ff;",
				"--dsw-static-deepseek-300:#8ed0ff;",
				"--dsw-static-deepseek-400:#5cb8ff;",
				"--dsw-static-deepseek-450:#45adff;",
				"--dsw-static-deepseek-500:#339cff;",
				"--dsw-static-deepseek-600:#1f80dd;",
				"--dsw-static-deepseek-700-delete:#1666b4;",
				"--dsw-static-deepseek-800:#114e8a;",
				"--dsw-static-deepseek-900:#0d3a66;",
				"}",
				// 字体：英文/数字 Segoe UI Variable，中文微软雅黑 UI，代码 Consolas
				"html:root{",
				'--dsh-font-family-text-default:"Segoe UI Variable", "Microsoft YaHei UI", "Segoe UI", "Microsoft YaHei", "PingFang SC", sans-serif;',
				'--dsh-font-family-code-default:Consolas, "Liberation Mono", Menlo, "Microsoft YaHei UI", monospace;',
				// 形状：Codex 的控件基本 4-8px，面板 12px
				"--dsw-radius-xs:3px;--dsw-radius-sm:5px;--dsw-radius-md:7px;",
				"--dsw-radius-lg:8px;--dsw-radius-xl:10px;--dsw-radius-panel:12px;",
				"--dsw-menu-backdrop-filter:none;",
				"}",
				// 扁平：去掉所有投影，只留 0.5px 描边，靠描边分层
				"html:root body,html:root body *{",
				"--dsw-elevation-panel:var(--dsw-elevation-stroke);",
				"--dsw-elevation-prominent:var(--dsw-elevation-stroke);",
				"--dsw-elevation-soft:var(--dsw-elevation-stroke);",
				"}",
				"html:root body{",
				// 用全透明阴影而不是 none：有些组件会把两层阴影拼进一条 box-shadow，
				// none 会让整条声明失效，透明层则可以安全叠加。
				"--dsw-shadow-lv1:0 0 0 0 transparent;",
				"--dsw-shadow-lv1-blur:0 0 0 0 transparent;",
				"--dsw-shadow-lv2:0 0 0 0 transparent;",
				"--dsw-shadow-lv3:0 0 0 0 transparent;",
				"letter-spacing:-0.006em;",
				"}",
				'[data-windows-titlebar] [class*="_frame"]{--dsh-windows-content-radius:10px !important}',
				// 浅色：页面 #ffffff、卡片纯白、正文 #1a1c1f、主按钮近黑
				"html:root body:not([data-ds-dark-theme]){",
				"--dsw-alias-bg-base:#ffffff;",
				"--dsw-alias-bg-overlay:#f2f2f0;",
				"--dsw-alias-bg-layer-2:#ffffff;",
				"--dsw-alias-bg-layer-3:#ffffff;",
				// 侧边栏 #f6f6f6
				"--dsw-specific-sidebar-fill:#f6f6f6;",
				// 用户消息气泡 #dce6fc
				"--dsw-specific-bubble:#dce6fc;",
				"--dsw-specific-menu:#ffffff;",
				"--dsw-alias-scrollbar-bg-l1:#e2e2e1;",
				"--dsw-alias-scrollbar-bg-l2:#d4d4d3;",
				"--dsw-alias-scrollbar-hover-l1:#c8c8c6;",
				"--dsw-alias-scrollbar-hover-l2:#bcbcba;",
				// 主要文字 #1a1c1f
				"--dsw-alias-label-primary:#1a1c1f;",
				"--dsw-alias-label-secondary:#5a5a58;",
				"--dsw-alias-label-tertiary:#767674;",
				"--dsw-alias-label-caption:#a6a6a4;",
				"--dsw-alias-button-primary-fill:#0d0d0d;",
				"--dsw-alias-button-primary-hover:#242423;",
				// 发送按钮 #0169cc（深色走色阶 400，本来就是 #0169cc）
				"--dsw-alias-button-info-fill:#0169cc;",
				// 悬停背景 #f0f0f0（侧栏导航项、通用交互元素）
				"--dsw-alias-interactive-bg-hover:#f0f0f0;",
				"--dsw-alias-interactive-bg-hover-solid:#f0f0f0;",
				"--dsw-specific-sidebar-nav-item-hover:#f0f0f0;",
				"--dsw-alias-border-l1:rgba(0,0,0,.07);",
				"--dsw-alias-border-l2:rgba(0,0,0,.12);",
				"--dsw-alias-border-l3:rgba(0,0,0,.16);",
				"--dsw-alias-border-l4:rgba(0,0,0,.21);",
				"}",
				// 发送按钮「禁用但悬停」时蓝色加深：组件只在能点时给 hover 色，禁用态永远停在
				// 40% 透明度上，这里把悬停透明度提到 60%，底下的 #0169cc 就显出来了。
				// 必须写在上面那个声明块外面：放进去会被 CSS 嵌套当成
				// 「body 里再嵌一个 html」的后代选择器，永远匹配不到。
				'html:root body:not([data-ds-dark-theme]) button[class*="GRgSLq_primary"]:disabled:hover{background-color:var(--dsw-alias-button-info-fill);opacity:.6}',
				// 选中会话 #e9e9e9：会话行的选中态和悬停态共用 --dsw-alias-interactive-bg-hover，
				// 令牌分不出来，这里按类名单独压一层，选中比悬停深一档。
				'html:root body:not([data-ds-dark-theme]) [class*="sessionRow"][class*="selected"]{background-color:#e9e9e9}',
				// 输入框悬停 #f2f2f3：ui-theme 没有单独的输入框悬停令牌，按文本类输入框补一层。
				'html:root body:not([data-ds-dark-theme]) :is(input[type=text],input[type=search],input[type=email],input[type=password],input[type=number],input[type=tel],input[type=url],input:not([type])):hover:not(:disabled){background-color:#f2f2f3}',
				// 用户发的文字 #3850ba：气泡里的正文，排除 role=tooltip 的悬停提示气泡。
				'html:root body:not([data-ds-dark-theme]) [class*="bubble"]:not([role="tooltip"]){color:#3850ba}',
				// 对话气泡大圆角 18px：三处气泡都取 --dsw-radius-xl，但这个令牌同时喂给
				// 设置卡片、缩略图、主题立方等，直接改令牌会牵连一片，所以按气泡类名单独放大。
				'html:root [class*="bubble"]:not([role="tooltip"]){border-radius:18px}',
				// 深色：页面 #181818、面板 #2d2d2b、正文纯白
				"html:root body[data-ds-dark-theme]{",
				"--dsw-alias-bg-base:#181818;",
				"--dsw-alias-bg-layer-1:#1e1e1d;",
				"--dsw-alias-bg-layer-2:#242423;",
				"--dsw-alias-bg-layer-3:#2a2a29;",
				"--dsw-alias-bg-overlay:#2d2d2b;",
				"--dsw-specific-sidebar-fill:#1c1c1b;",
				"--dsw-specific-input-major:#242423;",
				"--dsw-specific-menu:#2d2d2b;",
				"--dsw-alias-scrollbar-bg-l1:#3a3a39;",
				"--dsw-alias-scrollbar-bg-l2:#4a4a49;",
				"--dsw-alias-scrollbar-hover-l1:#555554;",
				"--dsw-alias-scrollbar-hover-l2:#636362;",
				"--dsw-alias-label-primary:#ffffff;",
				"--dsw-alias-label-secondary:#b4b4b2;",
				"--dsw-alias-label-tertiary:#949492;",
				"--dsw-alias-label-caption:#7c7c7a;",
				"--dsw-alias-button-primary-fill:#ffffff;",
				"--dsw-alias-button-primary-hover:#e8e8e6;",
				// 深色强调色 #0169cc（浅色仍是 #339cff）：深色的强调取色阶 400/450 两档
				"--dsw-static-deepseek-400:#0169cc;",
				"--dsw-static-deepseek-450:#0169cc;",
				"--dsw-alias-border-l1:rgba(255,255,255,.07);",
				"--dsw-alias-border-l2:rgba(255,255,255,.13);",
				"--dsw-alias-border-l3:rgba(255,255,255,.18);",
				"--dsw-alias-border-l4:rgba(255,255,255,.24);",
				"}",
			].join(""),
			claude: [
				// 暖中性阶（Anthropic 的 warm gray，越深越偏褐）
				"html:root body{",
				"--dsw-static-neutral-bluish-00:#ffffff;",
				"--dsw-static-neutral-bluish-50:#faf9f5;",
				"--dsw-static-neutral-bluish-60:#f7f5f0;",
				"--dsw-static-neutral-bluish-75:#f3f0e9;",
				"--dsw-static-neutral-bluish-100:#eeeae1;",
				"--dsw-static-neutral-bluish-150:#e9e5da;",
				"--dsw-static-neutral-bluish-200:#e6e2d6;",
				"--dsw-static-neutral-bluish-300:#d5d1c4;",
				"--dsw-static-neutral-bluish-400:#b0aea5;",
				"--dsw-static-neutral-bluish-500:#96938a;",
				"--dsw-static-neutral-bluish-600:#7c786f;",
				"--dsw-static-neutral-bluish-700:#5d594f;",
				"--dsw-static-neutral-bluish-750:#48453d;",
				"--dsw-static-neutral-bluish-800:#37342e;",
				"--dsw-static-neutral-bluish-850:#2b2925;",
				"--dsw-static-neutral-bluish-875:#242220;",
				"--dsw-static-neutral-bluish-900:#1e1c19;",
				"--dsw-static-neutral-bluish-950:#141413;",
				"--dsw-static-neutral-bluish-1000:#141413;",
				// 纯中性阶也换成暖的（行内代码、滚动条、浅色语法块）
				"--dsw-static-neutral-50:#faf9f5;",
				"--dsw-static-neutral-100:#f4f1ea;",
				"--dsw-static-neutral-150:#eeeae1;",
				"--dsw-static-neutral-200:#e6e2d6;",
				"--dsw-static-neutral-300:#d5d1c4;",
				// 品牌蓝 -> 陶土橙
				"--dsw-static-deepseek-50:#fdf5f1;",
				"--dsw-static-deepseek-100:#fae7e0;",
				"--dsw-static-deepseek-200:#f7ddd2;",
				"--dsw-static-deepseek-300:#efc0ac;",
				"--dsw-static-deepseek-400:#e79b7d;",
				"--dsw-static-deepseek-450:#e08662;",
				"--dsw-static-deepseek-500:#d97757;",
				"--dsw-static-deepseek-600:#c4553d;",
				"--dsw-static-deepseek-700-delete:#a5442f;",
				"--dsw-static-deepseek-800:#8a3a28;",
				"--dsw-static-deepseek-900:#5c2a1e;",
				"}",
				// 对话气泡：陶土橙 50-100 之间取 75 号位 #fceee9（色阶没有 75 的橙，按 50/100 中点插值）。浅深两态同色
				"html:root body{--dsw-specific-bubble:#fceee9}",
				// 字体：思源宋体 VF（与 codex 主题同一套兜底链），代码 JetBrains Mono -> Consolas
				"html:root{",
				'--dsh-font-family-text-default:"Source Han Serif SC VF", "思源宋体 VF", "Noto Serif SC", "思源宋体", "Source Han Serif SC", "Songti SC", "SimSun", serif;',
				'--dsh-font-family-code-default:"JetBrains Mono", "SF Mono", "Cascadia Mono", Consolas, "Liberation Mono", Menlo, "Microsoft YaHei", monospace;',
				// 形状：Anthropic 的 4-19px 圆角阶梯，面板取 20px
				"--dsw-radius-xs:6px;--dsw-radius-sm:8px;--dsw-radius-md:12px;",
				"--dsw-radius-lg:16px;--dsw-radius-xl:20px;--dsw-radius-panel:20px;",
				"--dsw-menu-backdrop-filter:blur(32px) saturate(140%);",
				"}",
				// 柔光：暖色低透明度投影，配 0.5px 描边
				"html:root body,html:root body *{",
				"--dsw-elevation-panel:var(--dsw-elevation-stroke), 0 2px 8px rgba(60,45,32,.06);",
				"--dsw-elevation-prominent:var(--dsw-elevation-stroke), 0 6px 20px rgba(60,45,32,.10);",
				"--dsw-elevation-soft:var(--dsw-elevation-stroke), 0 4px 16px rgba(60,45,32,.07);",
				"}",
				"html:root body{",
				"--dsw-shadow-lv1:0 1px 2px rgba(60,45,32,.05);",
				"--dsw-shadow-lv1-blur:0 4px 12px rgba(60,45,32,.04);",
				"--dsw-shadow-lv2:0 2px 8px rgba(60,45,32,.06), 0 1px 2px rgba(60,45,32,.04);",
				"--dsw-shadow-lv3:0 8px 24px rgba(60,45,32,.10), 0 0 1px rgba(60,45,32,.10);",
				"letter-spacing:0.004em;",
				"}",
				// 深色下投影要更重，否则在黑底上看不见
				"html:root body[data-ds-dark-theme],html:root body[data-ds-dark-theme] *{",
				"--dsw-elevation-panel:var(--dsw-elevation-stroke), 0 2px 8px rgba(0,0,0,.45);",
				"--dsw-elevation-prominent:var(--dsw-elevation-stroke), 0 8px 24px rgba(0,0,0,.55);",
				"--dsw-elevation-soft:var(--dsw-elevation-stroke), 0 4px 16px rgba(0,0,0,.45);",
				"--dsw-shadow-lv1:0 1px 2px rgba(0,0,0,.4);",
				"--dsw-shadow-lv1-blur:0 4px 12px rgba(0,0,0,.35);",
				"--dsw-shadow-lv2:0 2px 8px rgba(0,0,0,.45), 0 1px 2px rgba(0,0,0,.35);",
				"--dsw-shadow-lv3:0 8px 24px rgba(0,0,0,.55);",
				"}",
				// 编辑气质：Markdown 标题走衬线（Tiempos 的替身），匹配不上就自动跳过
				'[class*="markdown"] :is(h1,h2,h3){font-family:Georgia, "Times New Roman", serif;letter-spacing:-0.01em}',
				'[data-windows-titlebar] [class*="_frame"]{--dsh-windows-content-radius:16px !important}',
				// 浅色：奶油页面 + 米白卡片 + 陶土主按钮
				"html:root body:not([data-ds-dark-theme]){",
				"--dsw-alias-bg-base:#faf9f5;",
				"--dsw-alias-bg-overlay:#f7f5f0;",
				"--dsw-alias-bg-layer-1:#fffefb;",
				"--dsw-alias-bg-layer-2:#fffefb;",
				"--dsw-alias-bg-layer-3:#fffefb;",
				"--dsw-specific-input-major:#ffffff;",
				"--dsw-specific-sidebar-fill:#f4f1ea;",
				"--dsw-specific-menu:#faf9f5f2;",
				"--dsw-alias-scrollbar-bg-l1:#e6e2d6;",
				"--dsw-alias-scrollbar-bg-l2:#d5d1c4;",
				"--dsw-alias-scrollbar-hover-l1:#c9c4b5;",
				"--dsw-alias-scrollbar-hover-l2:#bbb6a6;",
				"--dsw-alias-label-primary:#141413;",
				"--dsw-alias-label-secondary:#5d594f;",
				"--dsw-alias-label-tertiary:#7c786f;",
				"--dsw-alias-label-caption:#a8a59b;",
				"--dsw-alias-button-primary-fill:#c4553d;",
				"--dsw-alias-button-primary-hover:#b04a34;",
				"--dsw-alias-border-l1:rgba(72,58,42,.09);",
				"--dsw-alias-border-l2:rgba(72,58,42,.15);",
				"--dsw-alias-border-l3:rgba(72,58,42,.19);",
				"--dsw-alias-border-l4:rgba(72,58,42,.24);",
				// 代码块：ui-theme 的 code-block 和 banner 都取 neutral-bluish-50，而这一档
				// 在 Claude 主题里被调成了页面底色 #faf9f5，代码块于是和背景连成一片、
				// 看不出边界。这里单独给一档比底色深一点的陶土色，把代码块分出来。
				"--dsw-alias-markdown-code-block:#faf3ee;",
				"--dsw-alias-markdown-code-block-banner:#faf3ee;",
				"}",
				// 深色：#141413 底 + #262624 卡片 + 陶土主按钮（文字保持深色）
				"html:root body[data-ds-dark-theme]{",
				"--dsw-alias-bg-base:#141413;",
				"--dsw-alias-bg-layer-1:#1b1a18;",
				"--dsw-alias-bg-layer-2:#262624;",
				"--dsw-alias-bg-layer-3:#2c2a27;",
				// 深色下的对话气泡：浅米粉在深底上会过曝，换成暗陶土棕，亮度贴着背景走
				"--dsw-specific-bubble:#372520;",
				"--dsw-alias-bg-overlay:#31302c;",
				"--dsw-specific-sidebar-fill:#191817;",
				"--dsw-specific-input-major:#262624;",
				"--dsw-specific-menu:#262624f0;",
				"--dsw-alias-scrollbar-bg-l1:#3a3733;",
				"--dsw-alias-scrollbar-bg-l2:#4c4842;",
				"--dsw-alias-scrollbar-hover-l1:#57534c;",
				"--dsw-alias-scrollbar-hover-l2:#645f57;",
				"--dsw-alias-label-primary:#faf9f5;",
				"--dsw-alias-label-secondary:#b8b4aa;",
				"--dsw-alias-label-tertiary:#9c988f;",
				"--dsw-alias-label-caption:#86827a;",
				"--dsw-alias-button-primary-fill:#d97757;",
				"--dsw-alias-button-primary-hover:#e58d6f;",
				"--dsw-alias-border-l1:rgba(255,246,232,.08);",
				"--dsw-alias-border-l2:rgba(255,246,232,.14);",
				"--dsw-alias-border-l3:rgba(255,246,232,.19);",
				"--dsw-alias-border-l4:rgba(255,246,232,.25);",
				"}",
			].join(""),
		};

		/**
		 * 左上角品牌：图形 + 字标。
		 *
		 * 字标是官方矢量，不是拿系统字体排版凑出来的：
		 * - Claude Code：官方文档站导航栏的 lockup（mintcdn 上的 logo/light.svg）。
		 *   原图是「星芒 + Claude Code Docs」，这里裁掉左侧星芒（星芒单独进 mark 槽，
		 *   否则会和 mark 重复）和尾部「Docs」，只保留「Claude Code」十个字母的原始
		 *   路径。其中 a / d / e 在官方文件里带 fill-rule="evenodd"，必须原样保留，
		 *   否则字腔会被填实。
		 * - Codex：OpenAI 没有公开 Codex 字标的矢量文件（openai.com 与 chatgpt.com
		 *   对本机一律 403，官方仓库里只有 CLI 截图 PNG），所以名字仍用文字，只把
		 *   字重和字距调平——600 字重 + 宽字距在大字号下正是发糊的原因。
		 */
		const BRAND_SPEC = {
			codex: {
				title: "Codex",
				/** 云状外框 + 终端提示符 `>_`，取自 Devicons 官方 Codex 图形（MIT）。 */
				markPath: "M9.064 3.344a4.6 4.6 0 0 1 2.285-.312q1.5.173 2.673 1.275.016.015.037.021a.1.1 0 0 0 .043 0 4.55 4.55 0 0 1 3.046.275l.047.022.116.057a4.58 4.58 0 0 1 2.188 2.399q.313.765.315 1.595a4.2 4.2 0 0 1-.134 1.223.12.12 0 0 0 .03.115q.89.91 1.183 2.17.433 2.138-.887 3.854l-.136.166a4.55 4.55 0 0 1-2.201 1.388.12.12 0 0 0-.081.076c-.191.551-.383 1.023-.74 1.494-.9 1.187-2.222 1.846-3.711 1.838q-1.78-.009-3.157-1.302a.11.11 0 0 0-.105-.024c-.388.125-.78.143-1.204.138a4.44 4.44 0 0 1-1.945-.466 4.54 4.54 0 0 1-1.61-1.335c-.152-.202-.303-.392-.414-.617a6 6 0 0 1-.37-.961 4.6 4.6 0 0 1-.014-2.298.1.1 0 0 0 .006-.056.1.1 0 0 0-.027-.048 4.5 4.5 0 0 1-1.034-1.651 3.9 3.9 0 0 1-.251-1.192 5.2 5.2 0 0 1 .141-1.6Q3.659 7.92 5.086 6.97q.318-.212.601-.33a6 6 0 0 1 .646-.227.1.1 0 0 0 .065-.066 4.5 4.5 0 0 1 .829-1.615 4.54 4.54 0 0 1 1.837-1.388m3.482 10.565a.637.637 0 0 0 0 1.272h3.636a.637.637 0 1 0 0-1.272zM8.462 9.23a.637.637 0 0 0-1.106.631l1.272 2.224-1.266 2.136a.636.636 0 1 0 1.095.649l1.454-2.455a.64.64 0 0 0 .005-.64z",
				wordmark: null,
				/**
				 * 左上角名字用的 Codex 字标矢量（91×24）。
				 *
				 * 官方没有发布独立的 Codex 字标文件，官网和 openai/codex 仓库里都拿不到，
				 * 这里用 LobeHub icons 的 Codex.Text（与官方应用字标同形的社区矢量）。
				 * 只挂在侧栏名字槽；空会话主界面不看这个字段，仍然只留图形。
				 */
				nameWordmark: {
					viewBox: "0 0 91 24",
					height: 20,
					/** 字标本身笔画偏细，加一圈同色描边当加粗用（viewBox 单位）。 */
					strokeWidth: 0.7,
					paths: [{ d: "M79.915 14.964l-5.53-7.548h3.33l3.88 5.256 3.88-5.256h3.24l-5.5 7.486 5.683 7.792h-3.361l-4.003-5.5-4.064 5.5H74.2l5.715-7.73zM66.368 23c-1.345 0-2.567-.326-3.667-.978-1.08-.652-1.935-1.579-2.567-2.78-.631-1.203-.947-2.608-.947-4.217 0-1.59.316-2.974.947-4.156.652-1.202 1.518-2.129 2.597-2.78 1.08-.652 2.272-.978 3.575-.978 1.813 0 3.33.55 4.553 1.65 1.222 1.1 1.956 2.597 2.2 4.491.082.693.112 1.477.092 2.353H62.09c.06 1.548.489 2.76 1.283 3.636.815.876 1.793 1.314 2.933 1.314h.184c.855 0 1.599-.224 2.23-.672.632-.448 1.06-1.06 1.284-1.833h2.933a6.147 6.147 0 01-2.322 3.575C69.433 22.54 68.018 23 66.368 23zm3.819-9.687c-.082-1.16-.469-2.077-1.161-2.75-.693-.692-1.558-1.038-2.597-1.038h-.214c-.978 0-1.844.315-2.597.947-.734.611-1.212 1.558-1.437 2.841h8.006zM47.834 23c-1.324 0-2.516-.326-3.575-.978-1.039-.652-1.854-1.579-2.444-2.78-.591-1.202-.887-2.598-.887-4.187 0-1.588.306-2.984.917-4.186.611-1.201 1.446-2.128 2.506-2.78 1.08-.652 2.281-.978 3.605-.978 1.08 0 2.047.224 2.903.672.855.449 1.497 1.019 1.925 1.711V1.306h2.903v21.388h-2.903v-2.108c-.408.672-1.06 1.242-1.956 1.711-.896.469-1.894.703-2.994.703zm.58-2.475c.856 0 1.62-.234 2.292-.703.672-.468 1.192-1.11 1.558-1.925.387-.835.58-1.782.58-2.841 0-1.06-.193-1.997-.58-2.812-.366-.835-.886-1.487-1.558-1.955a3.911 3.911 0 00-2.292-.703h-.183c-1.304 0-2.363.51-3.178 1.528-.794 1.018-1.191 2.332-1.191 3.941 0 1.61.397 2.924 1.191 3.942.815 1.019 1.874 1.528 3.178 1.528h.183zM31.022 23c-1.406 0-2.679-.337-3.82-1.009a7.367 7.367 0 01-2.688-2.841c-.652-1.223-.978-2.587-.978-4.095 0-1.507.326-2.862.978-4.064.651-1.222 1.548-2.17 2.688-2.841 1.141-.693 2.414-1.04 3.82-1.04 1.405 0 2.668.347 3.789 1.04 1.14.672 2.037 1.62 2.688 2.841.652 1.202.978 2.557.978 4.064 0 1.508-.326 2.872-.977 4.095a7.367 7.367 0 01-2.69 2.841C33.69 22.663 32.428 23 31.023 23zm.06-2.476c.857 0 1.62-.224 2.293-.672.672-.468 1.201-1.11 1.589-1.925.386-.835.58-1.792.58-2.872 0-1.08-.194-2.027-.58-2.841-.388-.836-.917-1.477-1.59-1.925a3.911 3.911 0 00-2.291-.703H30.9c-1.304 0-2.373.51-3.209 1.528-.814.998-1.222 2.312-1.222 3.941 0 1.63.407 2.954 1.222 3.972.835.998 1.905 1.497 3.209 1.497h.183zM12.053 23c-2.037 0-3.82-.469-5.348-1.406-1.507-.957-2.668-2.271-3.483-3.941S2 14.098 2 12c0-2.098.407-3.982 1.222-5.653.835-1.67 2.017-2.974 3.545-3.91C8.294 1.478 10.057 1 12.053 1c1.609 0 3.055.316 4.338.947 1.304.611 2.363 1.477 3.178 2.597.815 1.1 1.304 2.374 1.467 3.82h-3.117c-.244-1.365-.876-2.465-1.894-3.3-1.019-.856-2.302-1.283-3.85-1.283h-.245c-1.385 0-2.597.356-3.636 1.069-1.039.713-1.833 1.69-2.383 2.933-.55 1.243-.825 2.648-.825 4.217 0 1.568.275 2.974.825 4.216.55 1.243 1.344 2.22 2.383 2.934 1.04.713 2.251 1.07 3.636 1.07h.245c1.548 0 2.831-.418 3.85-1.254 1.039-.855 1.68-1.976 1.925-3.36h3.086c-.184 1.446-.683 2.729-1.497 3.85-.795 1.12-1.844 1.996-3.148 2.627-1.303.611-2.75.917-4.338.917z" }],
				},
				/** 左上角 mark 相对 owner 尺寸（24）的放大系数：Codex 图形笔画细，原尺寸偏小。 */
				sidebarMarkScale: 1.32,
				/**
				 * 空会话主界面的欢迎语。
				 *
				 * 这一行是「打个招呼」的位置，不是品牌 slogan，所以用 Codex 那句
				 * 开场问句；Claude 那边仍是官方 slogan，两边各按品牌的口吻来。
				 */
				heroLines: ["今天我能帮你构建什么？"],
				/** 这句是欢迎语，不是 slogan：主界面上按标题级字重显示。 */
				heroLineEmphasis: true,
				/** 名字没有字标矢量，主界面只留 logo，所以把 logo 放大一档。 */
				heroMarkScale: 1.35,
			},
			claude: {
				title: "Claude Code",
				/** Anthropic 官方星芒，取自 simple-icons（MIT）。 */
				markPath: "m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z",
				wordmark: {
					// 官方原图 viewBox 是 0 0 254 28；这里裁到「Claude Code」的字身范围。
					viewBox: "28.4 2.6 158.2 22",
					height: 21,
					paths: [
						{ d: "M40.2414 22.1988C41.4169 22.1988 42.3923 22.0237 43.1677 21.6736C44.7433 20.9733 45.6938 19.6477 46.4941 17.4467H47.8197L47.2694 22.2739C45.1435 23.2743 42.7425 23.8495 39.7161 23.8495C37.5902 23.8495 35.7394 23.4244 34.1887 22.549C31.0874 20.8232 29.4366 17.7219 29.4366 14.2203C29.4366 12.1444 29.9119 10.3186 30.8373 8.74294C32.6881 5.59156 36.0145 3.84079 39.9162 3.84079C42.6924 3.84079 44.9684 4.44106 46.7942 5.61657L46.9693 9.99349H45.6687C44.5933 6.8171 42.7175 5.49152 39.6661 5.49152C35.1391 5.49152 33.0882 8.66791 33.0882 13.2449C33.0882 14.8706 33.3384 16.3463 33.8636 17.6969C34.889 20.423 37.065 22.1988 40.2414 22.1988Z" },
						{ d: "M53.9474 5.49152V21.0733C53.9474 22.0988 54.4726 22.3239 55.8482 22.499V23.5994H49.0452V22.499C50.4208 22.3239 50.9461 22.0988 50.9461 21.0733V6.01675L49.1703 5.19139V4.5411L53.172 3.34058H54.0724L53.9474 5.49152Z" },
						{ d: "M69.4291 21.8737C68.7038 21.8737 68.3537 21.2984 68.3537 20.1729V14.9457C68.3537 11.3691 66.4528 9.99349 63.0263 9.99349C60 9.99349 57.799 11.244 57.799 13.3199C57.799 13.9452 58.0241 14.4204 58.4743 14.7456L60.7754 14.4454C60.6753 13.7451 60.6253 13.3199 60.6253 13.1449C60.6253 11.9693 61.2506 11.3691 62.5261 11.3691C64.4019 11.3691 65.3524 12.6947 65.3524 14.8206V15.5209L60.6003 16.9465C59.0246 17.3717 58.1242 17.7469 57.5239 18.6223C57.2238 19.0725 57.0737 19.6727 57.0737 20.398C57.0737 22.4239 58.4743 23.8495 60.8504 23.8495C62.5761 23.8495 64.1018 23.0742 65.4274 21.5986C65.9026 23.0742 66.6279 23.8495 67.9285 23.8495C68.9789 23.8495 69.9294 23.4244 70.7797 22.599L70.5296 21.7236C70.1545 21.8237 69.8043 21.8737 69.4291 21.8737ZM65.3524 20.4981C64.1268 21.4235 63.4015 21.8237 62.276 21.8237C60.9754 21.8237 60.1751 21.0733 60.1751 19.7478C60.1751 18.8474 60.6003 18.3221 61.5007 18.022L65.3524 16.7965V20.4981Z", evenodd: true },
						{ d: "M84.1356 12.5696V20.5981C84.1356 21.4735 84.4107 21.6986 85.4862 21.7986L86.1364 21.8487V22.9742L81.5344 23.8495H81.0092L81.1343 21.3985C79.9587 22.8241 78.383 23.8495 76.4572 23.8495C73.9311 23.8495 72.3554 22.524 72.3554 19.7227V13.1199C72.3554 12.2945 72.0053 11.9693 70.8297 11.7943L70.3796 11.7192V10.6188L74.7315 9.99349H75.4818L75.3567 12.5696V19.2976C75.3567 20.9733 76.2321 21.6986 77.6577 21.6986C78.9333 21.6986 80.0088 21.1484 81.1343 20.273V13.1199C81.1343 12.2945 80.7841 11.9693 79.6086 11.7943L79.1834 11.7192V10.6188L83.5353 9.99349H84.2606L84.1356 12.5696Z" },
						{ d: "M100.343 20.5981V5.49152L100.468 3.34058H99.5673L95.5656 4.5411V5.19139L97.3413 6.01675V10.9689C96.466 10.3186 95.3155 9.99349 93.9399 9.99349C89.9631 9.99349 86.8618 13.0198 86.8618 17.5468C86.8618 21.2734 89.0877 23.8495 92.7643 23.8495C94.6652 23.8495 96.3159 22.9241 97.3413 21.4985L97.2163 23.8495H97.7415L102.344 22.9742V21.8487L101.693 21.7986C100.618 21.6986 100.343 21.4735 100.343 20.5981ZM97.3413 20.323C96.541 21.1484 95.3655 21.6486 94.0399 21.6486C91.3137 21.6486 89.9381 19.4976 89.9381 16.6214C89.9381 13.395 91.5138 11.4941 94.0149 11.4941C95.9157 11.4941 97.3413 12.5946 97.3413 14.6205V20.323Z", evenodd: true },
						{ d: "M110.372 21.2234C112.298 21.2234 114.124 20.1229 115.049 18.4722L115.899 18.6973C115.524 21.6486 112.848 23.8495 109.572 23.8495C105.72 23.8495 103.069 21.0233 103.069 16.9465C103.069 12.8697 105.945 9.99349 109.797 9.99349C112.673 9.99349 114.699 11.7192 115.349 14.7206L105.908 17.6168C106.485 19.8578 108.087 21.2234 110.372 21.2234ZM112.073 14.3454C111.723 12.6697 110.697 11.7192 109.272 11.7192C107.146 11.7192 105.67 13.3199 105.67 15.6209C105.67 15.8631 105.68 16.0982 105.698 16.3283L112.073 14.3454Z", evenodd: true },
						{ d: "M131.712 22.082C132.901 22.082 133.894 21.908 134.693 21.56C135.491 21.212 136.153 20.6983 136.68 20.0189C137.206 19.3395 137.673 18.4529 138.081 17.3592H139.431L138.871 22.1566C137.784 22.6537 136.612 23.0431 135.355 23.3248C134.115 23.59 132.722 23.7225 131.177 23.7225C129.003 23.7225 127.126 23.2917 125.546 22.43C123.967 21.5683 122.761 20.4083 121.929 18.95C121.113 17.4918 120.706 15.8927 120.706 14.1527C120.706 12.0979 121.173 10.2916 122.107 8.73393C123.058 7.15967 124.34 5.94998 125.954 5.10485C127.585 4.25972 129.393 3.83716 131.381 3.83716C134.2 3.83716 136.535 4.42543 138.387 5.60199L138.54 9.87734H137.215C136.671 8.31965 135.907 7.2011 134.922 6.52168C133.937 5.8257 132.671 5.4777 131.126 5.4777C128.816 5.4777 127.117 6.19855 126.03 7.64024C124.96 9.06536 124.425 10.913 124.425 13.1833C124.425 14.7907 124.689 16.2738 125.215 17.6326C125.742 18.9749 126.548 20.052 127.635 20.864C128.739 21.676 130.098 22.082 131.712 22.082Z" },
						{ d: "M147.98 23.7225C146.622 23.7225 145.424 23.4408 144.388 22.8774C143.352 22.2974 142.545 21.5103 141.968 20.516C141.39 19.5052 141.102 18.3618 141.102 17.0858C141.102 15.6607 141.433 14.4095 142.095 13.3324C142.758 12.2553 143.649 11.4267 144.77 10.8467C145.891 10.2502 147.131 9.9519 148.49 9.9519C149.849 9.9519 151.046 10.2419 152.082 10.8219C153.135 11.3853 153.95 12.1724 154.528 13.1833C155.105 14.1941 155.394 15.3292 155.394 16.5887C155.394 18.0138 155.063 19.2649 154.4 20.342C153.738 21.4191 152.838 22.256 151.7 22.8525C150.579 23.4325 149.339 23.7225 147.98 23.7225ZM148.694 22.1317C149.832 22.1317 150.689 21.7091 151.267 20.864C151.844 20.0189 152.133 18.8838 152.133 17.4586C152.133 15.7352 151.742 14.3184 150.961 13.2081C150.197 12.0979 149.135 11.5427 147.776 11.5427C146.639 11.5427 145.781 11.9653 145.203 12.8104C144.626 13.6556 144.337 14.7907 144.337 16.2158C144.337 17.9392 144.719 19.356 145.484 20.4663C146.265 21.5766 147.335 22.1317 148.694 22.1317Z" },
						{ d: "M167.859 23.7226H167.324L167.451 21.3861C166.925 22.0986 166.254 22.6703 165.439 23.1012C164.64 23.5155 163.757 23.7226 162.789 23.7226C161.532 23.7226 160.454 23.4575 159.554 22.9272C158.653 22.3803 157.966 21.6346 157.49 20.6901C157.014 19.729 156.777 18.6518 156.777 17.4587C156.777 15.9673 157.099 14.6499 157.745 13.5065C158.39 12.3631 159.265 11.4848 160.369 10.8717C161.473 10.2585 162.679 9.95198 163.987 9.95198C165.396 9.95198 166.551 10.2751 167.451 10.9214V5.99976L165.643 5.17949V4.53321L169.719 3.34009H170.636L170.509 5.47777V20.4912C170.509 20.9221 170.602 21.2204 170.789 21.3861C170.976 21.5352 171.341 21.6346 171.884 21.6844L172.547 21.7341V22.8526L167.859 23.7226ZM164.063 11.4434C162.789 11.4434 161.779 11.8908 161.031 12.7856C160.284 13.6805 159.91 14.9316 159.91 16.539C159.91 17.9641 160.258 19.1573 160.955 20.1184C161.651 21.0629 162.696 21.5352 164.088 21.5352C164.768 21.5352 165.396 21.4192 165.974 21.1872C166.551 20.9552 167.044 20.6321 167.451 20.2178V14.5505C167.451 13.5396 167.129 12.7691 166.483 12.2388C165.838 11.7085 165.031 11.4434 164.063 11.4434Z" },
						{ d: "M180.396 21.24C182.31 21.24 184.125 20.1463 185.044 18.5057L185.89 18.7295C185.517 21.6626 182.857 23.8501 179.601 23.8501C175.773 23.8501 173.138 21.0412 173.138 16.9894C173.138 12.9377 175.996 10.0791 179.824 10.0791C182.683 10.0791 184.696 11.7943 185.343 14.7771L175.96 17.6556C176.533 19.8828 178.125 21.24 180.396 21.24ZM182.086 14.4043C181.738 12.7388 180.719 11.7943 179.302 11.7943C177.19 11.7943 175.723 13.3851 175.723 15.672C175.723 15.9126 175.733 16.1463 175.751 16.375L182.086 14.4043Z", evenodd: true },
					],
				},
				/**
				 * 官方 slogan：文档概述首句 + 产品页首屏两句，每次启动客户端随机取一条。
				 */
				heroLines: [
					"An agentic coding tool that reads your codebase",
					"Hand Claude a bug fix, test, or multi-day migration",
					"Steer and review from your terminal, IDE, Slack, or web",
				],
			},
		};

		/**
		 * 左上角品牌的注册优先级。
		 *
		 * `sidebar.brand.mark` 与 `sidebar.brand.name` 都是 single 槽：注册自己的
		 * 占位组件就会顶替官方那一条，不是在旁边追加。single 槽里 **priority 越小
		 * 越优先**（官方占位是 0，实测 10 会变成 active:false），所以这里取负值。
		 * 旧实现用伪元素去藏 DOM，藏得住元素却藏不住文字节点，结果渲染成
		 * 「deepseek Claude」并排——这里改用插槽注册，从根上不会再出现那种情况。
		 */
		const BRAND_PRIORITY = -10;

		/**
		 * iOS 风格的弹簧曲线（CSS `linear()`，Chromium 113+）。
		 *
		 * 只有约 3% 的过冲、落点收得也快：要的是「轻轻弹出」，不是弹跳。
		 * 不认 `linear()` 的浏览器会在解析阶段整条声明丢掉，保留前一条
		 * cubic-bezier 兜底，所以每处动效都先写贝塞尔版、再写弹簧版。
		 * 这里不能改用 `var(--…, cubic-bezier(…))` 传曲线：var() 直到计算值阶段
		 * 才解析，失败时整条 `animation` / `transition` 会失效，不会回退。
		 */
		const SPRING_POP =
			"linear(0,0.006,0.025 3.2%,0.09 6.3%,0.19 9.4%,0.32 12.6%,0.47 16%,0.63 19.5%,0.77 23.2%,0.885 27%,0.965 31%,1.018 35.2%,1.048 39.6%,1.056 44.2%,1.049 48.9%,1.034 53.9%,1.017 59.2%,1.006 64.8%,1.001 71%,1)";
		const SPRING_SLIDE =
			"linear(0,0.008,0.032 3.5%,0.115 7%,0.238 10.5%,0.395 14.1%,0.56 17.8%,0.71 21.6%,0.835 25.5%,0.928 29.5%,0.987 33.6%,1.018 37.9%,1.027 42.4%,1.021 47.1%,1.011 52%,1.004 57.2%,1)";

		/**
		 * 打开 / 关闭的时长。CSS 和 JS 共用：JS 要知道打开弹簧什么时候跑完
		 * （没跑完就关时跳过退场，否则会从全不透明重新开始、闪一下），
		 * 也要给退场动画准备一个兜底定时器。
		 */
		const MENU_POP_MS = 340;
		const MENU_EXIT_MS = 180;

		/**
		 * 菜单样式注入到标题栏自己的 shadow root 里：菜单和入口按钮同层，
		 * 点击不会再穿过 overlay 层。
		 */
		const MENU_CSS = [
			// 打开：以入口按钮那条轴为原点（transform-origin 由 openMenu() 算好写内联样式），
			// 从 94% 弹到 100%、同时从按钮方向下移 5px——读起来就是「从触发点轻轻弹出」。
			"@keyframes pa-pop{from{opacity:0;transform:translateY(-5px) scale(.94)}to{opacity:1;transform:none}}",
			".pa-menu{position:fixed;z-index:1200;box-sizing:border-box;width:" +
				MENU_WIDTH +
				"px;max-width:calc(100vw - 16px);max-height:calc(100vh - 16px);overflow-y:auto;padding:6px;border-radius:var(--dsw-radius-lg,10px);background:var(--dsw-alias-bg-overlay,#f4f5f7);border:.5px solid var(--dsw-alias-border-l1,rgba(0,0,0,.1));box-shadow:0 12px 32px rgba(0,0,0,.22),0 2px 6px rgba(0,0,0,.08);color:var(--dsw-alias-label-primary);font-family:var(--dsw-font-family);text-align:left;cursor:default;backdrop-filter:blur(var(--pa-glass-blur,0px)) saturate(140%);animation:pa-pop .32s cubic-bezier(.22,1.25,.36,1) both;animation:pa-pop " +
				MENU_POP_MS +
				"ms " +
				SPRING_POP +
				" both}",
			// 关闭：朝触发点收回去，短促的 ease-in——是被收走，不是再弹一下。
			"@keyframes pa-out{from{opacity:1;transform:none}to{opacity:0;transform:translateY(-4px) scale(.96)}}",
			".pa-menu[data-state=closing]{animation:pa-out " +
				MENU_EXIT_MS +
				"ms cubic-bezier(.4,0,1,1) both;pointer-events:none}",
			".pa-header{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px 8px 8px}",
			".pa-title{font-size:13px;line-height:18px;font-weight:600}",
			".pa-badge{flex:none;padding:0 6px;border:.5px solid var(--dsw-alias-border-l1,rgba(0,0,0,.12));border-radius:999px;font-size:11px;line-height:16px;color:var(--dsw-alias-label-secondary)}",
			".pa-feature{display:flex;flex-direction:column;gap:8px;padding:8px;border-radius:var(--dsw-radius-md,8px)}",
			".pa-head{display:flex;align-items:flex-start;gap:10px}",
			".pa-icon{flex:none;display:grid;place-items:center;width:28px;height:28px;border-radius:var(--dsw-radius-sm,8px);background:var(--dsw-alias-bg-layer-2,rgba(0,0,0,.05));color:var(--dsw-alias-label-primary)}",
			".pa-text{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}",
			".pa-name{font-size:13px;line-height:18px}",
			".pa-desc{font-size:11px;line-height:16px;color:var(--dsw-alias-label-secondary)}",
			".pa-seg{position:relative;display:grid;grid-template-columns:repeat(3,1fr);gap:2px;padding:2px;border-radius:var(--dsw-radius-md,8px);background:rgba(127,127,127,.18);background:color-mix(in srgb,var(--dsw-alias-label-primary,#000) 13%,transparent)}",
			// 白色滑块：和按钮同层、垫在文字下面，位置/宽度由 createFeature 的 placeThumb() 写。
			".pa-seg-thumb{position:absolute;top:0;left:0;z-index:0;width:0;height:0;border-radius:calc(var(--dsw-radius-md,8px) - 2px);background:var(--dsw-alias-bg-overlay,#fff);box-shadow:0 1px 2px rgba(0,0,0,.18),0 0 0 .5px rgba(0,0,0,.06);pointer-events:none;opacity:0;will-change:transform,width}",
			// 菜单刚打开时滑块直接落位（不加过渡）；落位后才允许滑动，否则会看见它从 0 滑到选中项。
			".pa-seg[data-thumb=ready] .pa-seg-thumb{opacity:1;transition:transform .36s cubic-bezier(.22,1.12,.36,1),width .36s cubic-bezier(.22,1.12,.36,1);transition:transform .36s " +
				SPRING_SLIDE +
				",width .36s " +
				SPRING_SLIDE +
				"}",
			".pa-seg-btn{position:relative;z-index:1;display:flex;align-items:center;justify-content:center;gap:5px;box-sizing:border-box;width:100%;height:24px;min-width:0;margin:0;padding:0 4px;border:0;border-radius:calc(var(--dsw-radius-md,8px) - 2px);background:transparent;color:var(--dsw-alias-label-secondary);font-family:inherit;font-size:12px;line-height:16px;text-align:center;white-space:nowrap;cursor:pointer;transition:color .18s ease}",
			".pa-seg-btn:hover{color:var(--dsw-alias-label-primary)}",
			".pa-seg-btn[data-active=true]{color:var(--dsw-alias-label-primary)}",
			".pa-seg-btn:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary,#4d6bfe);outline-offset:-2px}",
			// 系统开了「减少动态效果」就只留即时切换，不弹也不滑；退场由 JS 直接摘节点。
			"@media (prefers-reduced-motion:reduce){.pa-menu{animation:none}.pa-menu[data-state=closing]{animation:none}.pa-seg[data-thumb=ready] .pa-seg-thumb{transition:none}}",
			".pa-dot{flex:none;width:8px;height:8px;border-radius:999px;background:currentColor;box-shadow:inset 0 0 0 .5px rgba(0,0,0,.18)}",
			".pa-sep{height:.5px;margin:2px 8px;background:var(--dsw-alias-border-l1,rgba(0,0,0,.1))}",
			// 滑块行：名称 + 当前值一行，range 铺满下面。
			".pa-slider-row{gap:2px;padding:4px 8px 2px}",
			".pa-slider-head{display:flex;align-items:baseline;justify-content:space-between;gap:8px}",
			".pa-slider-value{font-size:11px;line-height:16px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}",
			// 轨道单独画：input 本身留 18px 高当点击区，视觉上只有中间 4px 一条。
			".pa-range{-webkit-appearance:none;appearance:none;box-sizing:border-box;width:100%;height:18px;margin:1px 0 3px;padding:0;border:0;background:transparent;outline:none;cursor:pointer}",
			".pa-range::-webkit-slider-runnable-track{height:4px;border-radius:999px;background:color-mix(in srgb,var(--dsw-alias-label-primary,#000) 16%,transparent)}",
			".pa-range::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;box-sizing:border-box;width:14px;height:14px;margin-top:-5px;border-radius:50%;border:0;background:var(--dsw-alias-bg-overlay,#fff);box-shadow:0 1px 3px rgba(0,0,0,.28),0 0 0 .5px rgba(0,0,0,.12)}",
			".pa-range:hover::-webkit-slider-thumb{box-shadow:0 1px 4px rgba(0,0,0,.32),0 0 0 .5px rgba(0,0,0,.16)}",
			".pa-range:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary,#4d6bfe);outline-offset:2px}",
			// 玻璃关着时两条滑块一起变灰，并且点不动。
			".pa-feature[data-disabled=true]{opacity:.45}",
			".pa-feature[data-disabled=true] .pa-range{pointer-events:none;cursor:default}",
			".pa-feature[data-disabled=true] .pa-seg{pointer-events:none;cursor:default}",
			// 光晕开关：图标、文字、拨杆同一行，拨杆靠右。
			".pa-glow-row{padding:8px}",
			".pa-glow-row .pa-head{align-items:center;gap:10px}",
			".pa-glow-row .pa-text{flex-direction:row;align-items:center;gap:10px}",
			".pa-glow-row .pa-name{line-height:20px}",
			".pa-glow-row .pa-switch{margin-left:auto}",
			".pa-switch{position:relative;box-sizing:border-box;width:30px;height:17px;flex:none;margin:0;padding:0;border:0;border-radius:999px;background:color-mix(in srgb,var(--dsw-alias-label-primary,#000) 22%,transparent);cursor:pointer;transition:background .18s ease}",
			".pa-switch-knob{position:absolute;left:2px;top:2px;width:13px;height:13px;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.35);transition:transform .18s ease}",
			".pa-switch[data-on=true]{background:var(--dsw-alias-state-business-primary,#4d6bfe)}",
			".pa-switch[data-on=true] .pa-switch-knob{transform:translateX(13px)}",
			".pa-switch:disabled{opacity:.45;cursor:default}",
			".pa-switch:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary,#4d6bfe);outline-offset:2px}",
			".pa-feature[data-disabled=true] .pa-range::-webkit-slider-thumb{box-shadow:0 0 0 .5px rgba(0,0,0,.12)}",
			".pa-foot{margin-top:4px;padding:6px 8px 2px;border-top:.5px solid var(--dsw-alias-border-l1,rgba(0,0,0,.1));font-size:11px;line-height:16px;color:var(--dsw-alias-label-secondary)}",
		].join("");

		const zh = {
			"entry.label": "个性化外观",
			"menu.title": "个性化外观",
			"menu.badge": "即时生效",
			"feature.radius.name": "圆角风格",
			"feature.radius.desc": "默认跟随主题；小圆角更紧凑，macOS 按桌面端比例取圆角。",
			"mode.default": "默认",
			"mode.small": "小圆角",
			"mode.macos": "macOS",
			"feature.theme.name": "主题",
			"feature.theme.desc": "配色、字体、圆角、logo 一起换：Codex 冷灰扁平，Claude Code 奶油柔光。",
			"theme.default": "默认",
			"theme.codex": "Codex",
			"theme.claude": "claude",
			"feature.glass.name": "毛玻璃",
			"feature.glass.desc": "面板半透明 + 背景柔焦，菜单和浮层一起变透。",
			"glass.off": "关",
			"glass.on": "开",
			"feature.glass.blur": "模糊",
			"feature.glass.opacity": "不透明度",
			"feature.glow.name": "光晕",
			"menu.footer": "选中即时生效，并会记住你的选择。",
			"menu.warning": "部分功能可能未生效，详见控制台。",
		};
		const en = {
			"entry.label": "Appearance",
			"menu.title": "Appearance",
			"menu.badge": "Live",
			"feature.radius.name": "Corner style",
			"feature.radius.desc": "Default follows the theme; Small is tighter, macOS uses desktop-proportioned radii.",
			"mode.default": "Default",
			"mode.small": "Small",
			"mode.macos": "macOS",
			"feature.theme.name": "Theme",
			"feature.theme.desc": "Colours, type, radii and logo switch together: Codex is flat cool grey, Claude Code is warm cream.",
			"theme.default": "Default",
			"theme.codex": "Codex",
			"theme.claude": "claude",
			"feature.glass.name": "Frosted glass",
			"feature.glass.desc": "Translucent panels over a softly blurred backdrop; menus and popovers follow.",
			"glass.off": "Off",
			"glass.on": "On",
			"feature.glass.blur": "Blur",
			"feature.glass.opacity": "Opacity",
			"feature.glow.name": "Glow",
			"menu.footer": "Changes apply instantly and are remembered.",
			"menu.warning": "Some features may be inactive — see the console.",
		};

		/**
		 * 主题、品牌和圆角合并成一张样式表注入。
		 *
		 * 圆角是主题的一部分，但「圆角风格」那一行允许覆盖它。
		 * 拼在同一张表里、圆角排最后，就永远压得住主题自带的圆角，
		 * 不用比优先级，也不会和 !important 打架。
		 */
		/**
		 * 空会话主界面的名字和左上角字标用同一份素材：有官方字标矢量的主题直接
		 * 铺矢量（做成遮罩，颜色跟 currentColor），没有矢量字标的退回文字。
		 * 高度按 headline 的 26px 字号换算，宽度再按字标自身的宽高比推。
		 */
		const HERO_NAME_HEIGHT = "1.16em";

		/** CSS `content` 字符串转义；标语里可能出现引号或反斜杠。 */
		function cssString(text) {
			return '"' + String(text).replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
		}

		/**
		 * 空会话主界面那个「名字」的替换样式。
		 *
		 * 名字和左上角字标是同一份素材：有官方字标矢量的主题，把同一份 path 做成
		 * 遮罩铺上去（颜色跟 currentColor，浅色深色都不用再配一套）；没有矢量字标
		 * 的主题退回文字，字重字距与左上角保持一致。
		 *
		 * 名字所在的 span 没有 class，只能按结构定位：titleGroup 里是「原标题」和
		 * 「预览版」徽标两个 span，全部藏掉，再用 ::before 补名字、::after 补文案；
		 * order:-2 / -1 让它们排在前面。
		 */
		function heroBrandCss(theme) {
			const spec = BRAND_SPEC[theme];
			if (spec === undefined) return "";
			const hide = '[class*="titleGroup"]>span{display:none}';
			if (spec.wordmark === null) {
				// 没有字标矢量：主界面不摆名字，只留 logo 和那一行欢迎语。
				return hide;
			}
			const box = spec.wordmark.viewBox.split(" ").map(Number);
			const svg =
				'<svg xmlns="http://www.w3.org/2000/svg" viewBox="' +
				spec.wordmark.viewBox +
				'">' +
				spec.wordmark.paths
					.map((item) => '<path d="' + item.d + '"' + (item.evenodd ? ' fill-rule="evenodd"' : "") + "/>")
					.join("") +
				"</svg>";
			const mask = 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
			return (
				hide +
				'[class*="titleGroup"]::before{content:"";order:-2;display:block;flex:none;height:' +
				HERO_NAME_HEIGHT +
				";width:calc(" +
				HERO_NAME_HEIGHT +
				" * " +
				box[2] / box[3] +
				");background-color:currentColor;-webkit-mask-image:" +
				mask +
				";-webkit-mask-repeat:no-repeat;-webkit-mask-size:100% 100%;mask-image:" +
				mask +
				";mask-repeat:no-repeat;mask-size:100% 100%}"
			);
		}

		/**
		 * 「深度求索中」图标那圈摆动的角度序列。
		 *
		 * 那行前面的鲸尾是 ui-chat 的 RunningWhaleTail：一张 28×28、60 帧 × 50ms
		 * 的 APNG 遮罩，摆动动画烧在位图帧里，没有单独的 CSS 动画可以复用。这里
		 * 把原 APNG 的 60 帧逐帧和第一帧做「绕尾根（14, 20）旋转」的配准，量出鲸尾
		 * 整体摆动的角度（0.25° 一格）：前 8 帧停在原位，随后两秒来回摆，最后几帧
		 * 收回静止。换 logo 时用同一组角度、同一帧率复现，节奏和时长都不改。
		 */
		const RUNNING_LOGO_SWING = [
			0, 0, 0, 0, 0, 0, 0, 0,
			0, -0.25, -1.25, -2.75, -3.5, -3.25, -1.75, 0.25,
			2.5, 3.75, 4, 2.75, 1.25, -0.75, -1.75, -2.25,
			-1.75, -1, 0, 0.75, 1.75, 2.25, 1.25, 0,
			-1.75, -3, -3.5, -3, -1.25, 1, 2.5, 3.5,
			2.75, 2, 1.5, 0.5, -0.25, -0.25, -0.25, -0.25,
			-0.25, -0.25, -0.25, -0.25, 0, 0, 0, 0,
			0, 0, 0, 0,
		];

		/**
		 * 主题版「深度求索中」图标：把鲸尾换成该主题的 logo。
		 *
		 * 选择器用 `[class*="runningWhale…"]`，不吃构建产物的哈希类名；颜色继续走
		 * `background-color: currentColor`，跟着那行原本的深潜蓝/主题色。动效按原
		 * APNG 的节奏逐帧复现：60 帧 / 3 秒、20fps、绕尾根摆 ±4°，用 `step-end`
		 * 让每帧停满 50ms 再跳，和位图逐帧切换一致，不额外插值出原动画没有的平滑过渡。
		 *
		 * 生效条件原样照抄官方那段 CSS（支持 mask + 不禁用动画 + 非强制色）：这三条
		 * 任一不满足，官方就会退回静态的鲸尾 SVG，这里也一并不接管，回退表现和默认
		 * 主题完全一样，不会出现「减少动效时 logo 和鲸尾打架」之类的状态。
		 */
		function runningLogoIconCss(theme) {
			const spec = BRAND_SPEC[theme];
			if (spec === undefined || typeof spec.markPath !== "string" || spec.markPath === "") return "";
			// Codex 的图形在 24×24 里只占 3–21（18 格），Claude 的星芒铺满 24 格；
			// 想让它俩在同一个小方格里视觉大小一致，Codex 要按 24/18 放大一档。
			const glyph =
				theme === "codex"
					? '<g transform="translate(12 12) scale(1.32) translate(-12 -12)"><path d="' +
						spec.markPath +
						'" fill="#000"/></g>'
					: '<path d="' + spec.markPath + '" fill="#000"/>';
			const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' + glyph + "</svg>";
			const mask = 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
			// 一帧一个关键帧，配合 step-end 就是「每帧定格 50ms」；停住的那几帧本来角度
			// 就不变，自然也停住，不需要再单独判断。
			const total = RUNNING_LOGO_SWING.length;
			let frames = "";
			for (let i = 0; i < total; i += 1) {
				frames +=
					((i * 100) / total).toFixed(3) +
					"%{transform:rotate(" +
					RUNNING_LOGO_SWING[i] +
					"deg)}";
			}
			frames += "100%{transform:rotate(0deg)}";
			const pivot = "50% 71.4%";
			// 遮罩留一成边：图标要绕尾根转 ±4°，图形贴满方框时转起来会被 14px 的
			// 容器切掉角；原鲸尾本身也只占 28 格里的 24 格，留边后视觉大小一致。
			return [
				'@supports (mask-mode:alpha) and (mask-image:url("")){',
				"@media (prefers-reduced-motion:no-preference) and (forced-colors:none){",
				'html:root [class*="runningWhaleStill"]{display:none}',
				'html:root [class*="runningWhaleAnimated"]{display:block;position:absolute;inset:0;background:currentColor;',
				"-webkit-mask-image:" + mask + ";-webkit-mask-position:50% 50%;-webkit-mask-size:88% 88%;-webkit-mask-repeat:no-repeat;",
				"mask-image:" + mask + ";mask-position:50% 50%;mask-size:88% 88%;mask-repeat:no-repeat;mask-mode:alpha;",
				"transform-origin:" + pivot + ";",
				"will-change:transform;animation:pa-running-logo 3000ms step-end infinite}",
				"}",
				"}",
				"@keyframes pa-running-logo{" + frames + "}",
			].join("");
		}

		/** 空会话那句话的样式表标记；单独一张，换文案时只改它。 */
		const HERO_LINE_STYLE = "personal-appearance/heroLine.css";

		/** 本次启动抽定的文案；抽过就固定，直到重新启动客户端。 */
		const heroLinePicks = {};

		/** 在该主题的候选文案里随机挑一条。 */
		function pickHeroLine(theme) {
			const spec = BRAND_SPEC[theme];
			if (spec === undefined) return "";
			const list = spec.heroLines;
			return list[Math.floor(Math.random() * list.length)];
		}

		/** 取本次启动该主题的文案：第一次用到时抽一条，之后一直返回同一条。 */
		function heroLineFor(theme) {
			if (heroLinePicks[theme] === undefined) heroLinePicks[theme] = pickHeroLine(theme);
			return heroLinePicks[theme];
		}

		/**
		 * 空会话主界面那一行文案。
		 *
		 * 单独一张样式表：主题表里带着几 KB 的字标 data URI，每次换文案都整张
		 * 重建既浪费又会闪一下，这里只改 content。
		 *
		 * 字号/字重按主题分两档：欢迎语（Codex）是主界面上的主角，跟原标题一样
		 * 26px、再加粗到 600；品牌 slogan（Claude）是副标题语气，15px 次级色。
		 */
		function applyHeroLineCss(theme, heroLine) {
			if (typeof document === "undefined") return;
			const existing = document.querySelector('style[data-plugin-css="' + HERO_LINE_STYLE + '"]');
			if (heroLine === "") {
				if (existing !== null) existing.remove();
				return;
			}
			const spec = BRAND_SPEC[theme];
			const emphasis = spec !== undefined && spec.heroLineEmphasis === true;
			const type = emphasis
				? ";order:-1;font-size:26px;line-height:32px;font-weight:600;letter-spacing:0;color:var(--dsw-alias-label-primary)}"
				: ";order:-1;font-size:15px;line-height:20px;font-weight:400;letter-spacing:0;color:var(--dsw-alias-label-secondary)}";
			const css = '[class*="titleGroup"]::after{content:' + cssString(heroLine) + type;
			if (existing !== null) {
				if (existing.textContent !== css) existing.textContent = css;
				return;
			}
			const tag = document.createElement("style");
			tag.dataset.plugin = "personal-appearance";
			tag.dataset.pluginCss = HERO_LINE_STYLE;
			tag.textContent = css;
			document.head.appendChild(tag);
		}

		function applyAppearanceStyle(mode, theme, extra) {
			if (typeof document === "undefined") return;
			const stale = document.querySelectorAll('style[data-plugin="personal-appearance"]');
			for (const tag of stale) {
				// 标语表单独维护，换主题重铺主题表时不能被一起重建。
				if (tag.dataset.pluginCss === HERO_LINE_STYLE) continue;
				tag.remove();
			}
			const css = (THEME_CSS[theme] || "") + runningLogoIconCss(theme) + (RADIUS_CSS[mode] || "") + (extra || "");
			if (css === "") return;
			const tag = document.createElement("style");
			tag.dataset.plugin = "personal-appearance";
			tag.dataset.pluginCss = APPEARANCE_STYLE;
			tag.dataset.personalAppearanceMode = mode;
			tag.dataset.personalAppearanceTheme = theme;
			tag.textContent = css;
			document.head.appendChild(tag);
		}

		/** 读取上次选择的主题。 */
		function readTheme() {
			try {
				// 版本号只做记录，不再用它清空主题选择：存量值还能不能用由 THEMES 判断。
				if (window.localStorage.getItem(THEME_VERSION_KEY) !== THEME_VERSION) {
					window.localStorage.setItem(THEME_VERSION_KEY, THEME_VERSION);
				}
				const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
				if (raw !== null && THEMES.includes(raw)) return raw;
			} catch {
				// 隐私模式或存储被禁用时按默认主题走。
			}
			return FALLBACK_THEME;
		}

		/** 记住选择的主题。 */
		function writeTheme(theme) {
			try {
				window.localStorage.setItem(THEME_STORAGE_KEY, theme);
				window.localStorage.setItem(THEME_VERSION_KEY, THEME_VERSION);
			} catch {
				// 存不了就只在本次会话生效。
			}
		}

		/** 读取上次选择的档位，并把旧版开关值迁移过来。 */
		function readMode() {
			try {
				const raw = window.localStorage.getItem(STORAGE_KEY);
				if (raw !== null && MODES.includes(raw)) return raw;
				const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY);
				if (legacy === "0") return "default";
				if (legacy === "1") return "small";
			} catch {
				// 隐私模式或存储被禁用时按默认档位走。
			}
			return FALLBACK_MODE;
		}

		/** 记住选择的档位。 */
		function writeMode(mode) {
			try {
				window.localStorage.setItem(STORAGE_KEY, mode);
				window.localStorage.removeItem(LEGACY_STORAGE_KEY);
			} catch {
				// 存不了就只在本次会话生效。
			}
		}

		/** 数字夹到区间内。 */
		function clampNumber(value, min, max) {
			return Math.min(max, Math.max(min, value));
		}

		/** 读取上次的毛玻璃设置；数值越界或被改坏时回到默认值。 */
		function readGlass() {
			try {
				const raw = window.localStorage.getItem(GLASS_STORAGE_KEY);
				if (raw === null) return { ...GLASS_DEFAULT };
				const parsed = JSON.parse(raw);
				if (parsed === null || typeof parsed !== "object") return { ...GLASS_DEFAULT };
				const blur =
					typeof parsed.blur === "number" && Number.isFinite(parsed.blur)
						? Math.round(
								clampNumber(parsed.blur, GLASS_BLUR_MIN, GLASS_BLUR_MAX) / GLASS_BLUR_STEP,
							) * GLASS_BLUR_STEP
						: GLASS_DEFAULT.blur;
				const opacity =
					typeof parsed.opacity === "number" && Number.isFinite(parsed.opacity)
						? clampNumber(parsed.opacity, GLASS_OPACITY_MIN, GLASS_OPACITY_MAX)
						: GLASS_DEFAULT.opacity;
				// 老版本存下来的设置里没有 glow，缺省按「开」处理，不改变已有观感。
				return { on: parsed.on === true, blur, opacity, glow: parsed.glow !== false };
			} catch {
				return { ...GLASS_DEFAULT };
			}
		}

		/** 记住毛玻璃设置。 */
		function writeGlass(glass) {
			try {
				window.localStorage.setItem(GLASS_STORAGE_KEY, JSON.stringify(glass));
			} catch {
				// 存不了就只在本次会话生效。
			}
		}

		/**
		 * 毛玻璃样式。
		 *
		 * 所有规则都挂在 `html[data-pa-glass]` 下面：开关只是摘/加这个属性，
		 * 不用重建样式表。模糊和不透明度走两条自定义属性，拖滑块时直接改内联值，
		 * 也不用重铺 CSS；只有换主题（玻璃底色、光斑颜色跟着变）才需要重新生成。
		 *
		 * 表面色改的是 ui-theme 的别名层令牌——组件自己就是用这些令牌画的，
		 * 换成带 alpha 的值，整个界面就透出自己铺的那层背景，不用去猜 DOM 类名。
		 */
		function glassCss(theme) {
			const tint = GLASS_TINT[theme] || GLASS_TINT.default;
			const solid = GLASS_SOLID[theme] || GLASS_SOLID.default;
			const accent = GLASS_ACCENT[theme] || GLASS_ACCENT.default;
			/**
			 * 玻璃板底色：alpha 直接取不透明度滑块的值，不做二次缩放——
			 * 菜单里显示 60% 就真的是 60%，不会出现「设成 60% 实际只有 33%」。
			 */
			const surface = (mode) => "rgb(" + tint[mode] + " / var(--pa-glass-alpha,.55))";
			const tokens = (mode) =>
				[
					// 不透明的玻璃底色，给「不该透」的面板用（设置页）。
					"--pa-glass-tint:" + tint[mode] + ";",
					// 主题原本的页面底色，给不该跟玻璃变透的局部用（输入框下方的用量区）。
					"--pa-solid-base:" + solid[mode] + ";",
					// 表面令牌清单照抄 Aqua 的 compat 层：把能透出背景的表面全换成半透明。
					"--dsw-alias-bg-base:" + surface(mode) + ";",
					"--dsw-alias-bg-layer-1:" + surface(mode) + ";",
					"--dsw-alias-bg-layer-2:" + surface(mode) + ";",
					"--dsw-alias-bg-layer-3:" + surface(mode) + ";",
					"--dsw-alias-bg-overlay:" + surface(mode) + ";",
					"--dsw-alias-bg-module-platform:" + surface(mode) + ";",
					"--dsw-alias-bg-multi-select:" + surface(mode) + ";",
					"--dsw-specific-menu:" + surface(mode) + ";",
					"--dsw-specific-selector:" + surface(mode) + ";",
					// 气泡（--dsw-specific-bubble / -highlight）不换：它自带主题色，
					// 换成玻璃底色后对话气泡的颜色就没了，只剩一片白。
					"--dsw-specific-tip:" + surface(mode) + ";",
					"--dsw-specific-input-major:" + surface(mode) + ";",
					"--dsw-specific-login-input:" + surface(mode) + ";",
					"--dsw-alias-markdown-code-block:" + surface(mode) + ";",
					"--dsw-alias-markdown-code-block-banner:" + surface(mode) + ";",
					"--dsw-alias-markdown-inline-code:" + surface(mode) + ";",
					"--dsw-alias-markdown-citation:" + surface(mode) + ";",
					"--dsw-alias-markdown-tag:" + surface(mode) + ";",
					"--dsw-alias-markdown-placeholder:" + surface(mode) + ";",
					// 侧栏也走同一个 alpha：不透明度滑块对侧栏同样生效，不再恒为全透明。
					"--dsw-specific-sidebar-fill:" + surface(mode) + ";",
				].join("");
			return [
				"html[data-pa-glass]{--pa-glass-blur:18px;--pa-glass-alpha:.55;--pa-glass-accent:" +
					accent.a +
					";--pa-glass-accent-2:" +
					accent.b +
					"}",
				// 挡掉原来的不透明底：玻璃后面要能看见自己铺的那层背景。
				"html[data-pa-glass],html[data-pa-glass] body{background:transparent !important}",
				// 半透明表面令牌：浅色一套、深色一套，跟着 body 上的主题属性走。
				"html[data-pa-glass] body:not([data-ds-dark-theme]){" + tokens("light") + "}",
				"html[data-pa-glass] body[data-ds-dark-theme]{" + tokens("dark") + "}",
				// 菜单/浮层本来就有半透明底色，这里补上背景模糊，才算真玻璃。
				"html[data-pa-glass] body{--dsw-menu-backdrop-filter:blur(var(--pa-glass-blur,18px)) saturate(160%)}",
				// 通用玻璃家族：菜单/浮层/气泡/composer/页头，以及「展开状态」的右侧栏 pane。
				// 不再对 [class*='panel'] / [class*='card'] 全局加模糊：右侧栏收起来后，
				// 它的容器仍留在 DOM 里，元素本身透明时 backdrop-filter 会直接显示成一块虚化，
				// 看上去就像侧栏没开却盖了层毛玻璃。
				// 故意不碰 [role='dialog']：backdrop-filter 会把它的 fixed 定位搞乱。
				"html[data-pa-glass] [role='menu'],html[data-pa-glass] [role='tooltip'],html[data-pa-glass] [class*='popover'],html[data-pa-glass] [class*='dropdown'],html[data-pa-glass] [class*='bubble'],html[data-pa-glass] [data-composer-card],html[data-pa-glass] [data-sidebar-right-open] [data-dockkit-pane],html[data-pa-glass] [data-dockkit-float]{backdrop-filter:blur(var(--pa-glass-blur,12px)) saturate(150%)}",
				// 设置页单独处理：不受两个滑块影响，只跟开关走。
				// 面板本身给回不透明底色（否则不透明度一降，设置页就成半透明板）。
				"html[data-pa-glass] [data-shortcut-modal='settings']{background:rgb(var(--pa-glass-tint)) !important}",
				// 四周：面板背后那层全屏遮罩做固定参数虚化，参数写死，滑块碰不到它。
				"html[data-pa-glass] div[role='presentation']:has(>[data-shortcut-modal='settings'])>div[aria-hidden='true']{backdrop-filter:blur(6px) saturate(115%)}",
				// 其余弹窗（删除会话确认、改名、插件确认等）走的是 primitives 的 Modal：
				// 面板同样给固定不透明底色，外面那层 portal 容器统一吃固定虚化，
				// 不跟模糊/不透明度滑块走，只跟开关走。
				"html[data-pa-glass] [role='dialog'],html[data-pa-glass] [role='alertdialog']{background:rgb(var(--pa-glass-tint)) !important}",
				"html[data-pa-glass] body>div:has(>[role='dialog']),html[data-pa-glass] body>div:has(>[role='alertdialog']){backdrop-filter:blur(6px) saturate(115%)}",
				// 输入框下方那排 tok/s、用量和上下文进度不跟玻璃走：
				// 铺一块主题原本的页面底色，看起来就是毛玻璃关闭时的样子。
				"html[data-pa-glass] [data-composer-dock]:not(:empty){background:rgb(var(--pa-solid-base,255 255 255)) !important;border-radius:var(--dsw-radius-md);padding:2px 10px 4px}",
				// 侧栏/主区各自又铺了一遍底色：侧栏是「frame + sidebarCol + root」三层，主区是
				// 「frame + centerCol」两层，两边叠出来的不透明度不一样，光晕在交界处会突然断一截。
				// 玻璃模式下把两列自己的底色都去掉，只留最外层 frame 那一层，两边一致，
				// 光晕才能从左到右连续过渡；顺带也不透明度拉高时背景被叠死、看不见光晕。
				"html[data-pa-glass] [class*='sidebarCol'],html[data-pa-glass] [class*='centerCol']{background:transparent !important}",
				"html[data-pa-glass] [class*='sidebarCol']>div{background:transparent !important}",
				// 标题栏那条拖拽带（frame 的 ::before）又铺了一遍 sidebar-fill，等于在 frame 上再叠一层，
				// 顶部会形成一道更实的横向带子，光晕在它下面突然变浅，看着像一道阴影。
				// 让这条带子透明，顶部和正文就都只剩 frame 那一层。
				"html[data-pa-glass] [class*='_frame']::before{background:transparent !important}",
				// 背景层：铺满整窗，带负 z-index，垫在所有 UI 下面。
				"#" +
					GLASS_LAYER_ID +
					"{position:fixed;inset:0;z-index:-1;pointer-events:none;overflow:hidden;background:#f4f6fb}",
				"html[data-pa-glass] body[data-ds-dark-theme] #" +
					GLASS_LAYER_ID +
					"{background:#0d0e11}",
				// 光斑：大圆 + 大半径模糊。模糊值跟着「模糊」滑块走，0 就是不糊；
				// 整个光斑只在「光晕」开关打开时才画，关掉就是一层纯色玻璃底。
				"html[data-pa-glow='on'] #" +
					GLASS_LAYER_ID +
					" i{position:absolute;display:block;border-radius:50%;opacity:.55;background:radial-gradient(circle at 50% 50%,var(--pa-glass-accent),transparent 70%);filter:blur(var(--pa-glass-blur,18px))}",
				"html[data-pa-glow='on'] #" +
					GLASS_LAYER_ID +
					" i:nth-child(1){left:-16%;top:-22%;width:62vmax;height:62vmax;opacity:.62}",
				"html[data-pa-glow='on'] #" +
					GLASS_LAYER_ID +
					" i:nth-child(2){right:-20%;top:-10%;width:54vmax;height:54vmax;opacity:.52;background:radial-gradient(circle at 50% 50%,var(--pa-glass-accent-2),transparent 70%)}",
				"html[data-pa-glow='on'] #" +
					GLASS_LAYER_ID +
					" i:nth-child(3){left:16%;bottom:-28%;width:58vmax;height:58vmax;opacity:.3;background:radial-gradient(circle at 50% 50%,var(--pa-glass-accent-2),transparent 72%)}",
			].join("");
		}

		/** 铺背景层；关掉时整层摘掉，不留空节点。 */
		function syncGlassLayer(on) {
			if (typeof document === "undefined" || document.body === null) return;
			const existing = document.getElementById(GLASS_LAYER_ID);
			if (!on) {
				if (existing !== null) existing.remove();
				return;
			}
			if (existing !== null) return;
			const layer = document.createElement("div");
			layer.id = GLASS_LAYER_ID;
			layer.setAttribute("aria-hidden", "true");
			for (let index = 0; index < 3; index += 1) layer.appendChild(document.createElement("i"));
			document.body.prepend(layer);
		}

		/**
		 * 把毛玻璃状态同步到 DOM：
		 * - 开关 → html 上的 data-pa-glass 属性（CSS 全挂在这上面）
		 * - 模糊 / 不透明度 → 两条自定义属性，滑块拖动时直接改内联值
		 * - 光晕 → html 上的 data-pa-glow，只控制背景层里的光斑
		 * - 背景层 → 有就留着，没有才建；关掉时摘掉
		 */
		function applyGlassDom(glass) {
			if (typeof document === "undefined") return;
			const root = document.documentElement;
			if (glass.on) {
				root.dataset.paGlass = "";
				root.style.setProperty("--pa-glass-blur", glass.blur + "px");
				root.style.setProperty("--pa-glass-alpha", String(glass.opacity / 100));
				root.dataset.paGlow = glass.glow === false ? "off" : "on";
			} else {
				delete root.dataset.paGlass;
				delete root.dataset.paGlow;
				root.style.removeProperty("--pa-glass-blur");
				root.style.removeProperty("--pa-glass-alpha");
			}
			syncGlassLayer(glass.on);
		}

		/** 角标图形：一个被收小的圆角。 */
		function createCornerGlyph() {
			const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
			svg.setAttribute("viewBox", "0 0 16 16");
			svg.setAttribute("width", "16");
			svg.setAttribute("height", "16");
			svg.setAttribute("fill", "none");
			svg.setAttribute("stroke", "currentColor");
			svg.setAttribute("stroke-width", "1.5");
			svg.setAttribute("stroke-linecap", "round");
			svg.setAttribute("aria-hidden", "true");
			const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
			path.setAttribute("d", "M3 13V6.5A3.5 3.5 0 0 1 6.5 3H13");
			svg.appendChild(path);
			return svg;
		}

		/** 角标图形：一对色块，示意换配色。 */
		function createThemeGlyph() {
			const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
			svg.setAttribute("viewBox", "0 0 16 16");
			svg.setAttribute("width", "16");
			svg.setAttribute("height", "16");
			svg.setAttribute("fill", "none");
			svg.setAttribute("stroke", "currentColor");
			svg.setAttribute("stroke-width", "1.5");
			svg.setAttribute("stroke-linejoin", "round");
			svg.setAttribute("aria-hidden", "true");
			const outer = document.createElementNS("http://www.w3.org/2000/svg", "path");
			outer.setAttribute(
				"d",
				"M3.2 5.6A2.4 2.4 0 0 1 5.6 3.2h6.2a2.4 2.4 0 0 1 2.4 2.4v6.2a2.4 2.4 0 0 1-2.4 2.4H5.6a2.4 2.4 0 0 1-2.4-2.4z",
			);
			const inner = document.createElementNS("http://www.w3.org/2000/svg", "path");
			inner.setAttribute("d", "M8 3.2h3.8a2.4 2.4 0 0 1 2.4 2.4v6.2a2.4 2.4 0 0 1-2.4 2.4H8z");
			inner.setAttribute("fill", "currentColor");
			inner.setAttribute("stroke", "none");
			inner.setAttribute("fill-opacity", ".45");
			svg.append(outer, inner);
			return svg;
		}

		/** 角标图形：一块带斜向高光的半透明玻璃板。 */
		function createGlassGlyph() {
			const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
			svg.setAttribute("viewBox", "0 0 16 16");
			svg.setAttribute("width", "16");
			svg.setAttribute("height", "16");
			svg.setAttribute("fill", "none");
			svg.setAttribute("stroke", "currentColor");
			svg.setAttribute("stroke-linecap", "round");
			svg.setAttribute("aria-hidden", "true");
			const plate = document.createElementNS("http://www.w3.org/2000/svg", "rect");
			plate.setAttribute("x", "3");
			plate.setAttribute("y", "3.4");
			plate.setAttribute("width", "10");
			plate.setAttribute("height", "9.2");
			plate.setAttribute("rx", "2");
			plate.setAttribute("fill", "currentColor");
			plate.setAttribute("fill-opacity", ".2");
			plate.setAttribute("stroke", "none");
			// 斜向高光：玻璃板上那道反光，比整块描边更像「玻璃」。
			const gleam = document.createElementNS("http://www.w3.org/2000/svg", "path");
			gleam.setAttribute("d", "M4.9 10.6 10.4 5");
			gleam.setAttribute("stroke-width", "1.2");
			gleam.setAttribute("stroke-opacity", ".85");
			svg.append(plate, gleam);
			return svg;
		}

		/** 光晕图形：中心一点实心 + 外圈一道柔和的环。 */
		function createGlowGlyph() {
			const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
			svg.setAttribute("viewBox", "0 0 16 16");
			svg.setAttribute("width", "16");
			svg.setAttribute("height", "16");
			svg.setAttribute("fill", "none");
			svg.setAttribute("stroke", "currentColor");
			svg.setAttribute("aria-hidden", "true");

			const core = document.createElementNS("http://www.w3.org/2000/svg", "circle");
			core.setAttribute("cx", "8");
			core.setAttribute("cy", "8");
			core.setAttribute("r", "2.3");
			core.setAttribute("fill", "currentColor");
			core.setAttribute("stroke", "none");

			const ring = document.createElementNS("http://www.w3.org/2000/svg", "circle");
			ring.setAttribute("cx", "8");
			ring.setAttribute("cy", "8");
			ring.setAttribute("r", "5.8");
			ring.setAttribute("stroke-width", "1.2");
			ring.setAttribute("stroke-opacity", ".45");
			ring.setAttribute("fill", "none");

			svg.append(core, ring);
			return svg;
		}

		/** 一个小 span。 */
		function span(className, text) {
			const node = document.createElement("span");
			node.className = className;
			if (text !== undefined) node.textContent = text;
			return node;
		}

		const inject = ["locale", "slots"];

		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, { zh, en }), "personal-appearance: dictionaries");
			const t = (key, params) => ctx.locale.bind(NS)(key, params);

			let mode = readMode();
			let theme = readTheme();
			/** 毛玻璃设置：开关、模糊、不透明度，都即时生效并记住。 */
			let glass = readGlass();
			/**
			 * 滑块拖动期间的落盘节流。
			 *
			 * 视觉值（CSS 自定义属性）仍然每个 input 事件即时更新，但 localStorage
			 * 是同步写，拖一次滑块会触发几十次 setItem；这里合并成最后一次写。
			 */
			let glassPersistTimer = 0;
			const flushGlassPersist = () => {
				if (glassPersistTimer === 0) return;
				clearTimeout(glassPersistTimer);
				glassPersistTimer = 0;
				writeGlass(glass);
			};
			const scheduleGlassPersist = () => {
				if (glassPersistTimer !== 0) clearTimeout(glassPersistTimer);
				glassPersistTimer = setTimeout(() => {
					glassPersistTimer = 0;
					writeGlass(glass);
				}, GLASS_PERSIST_MS);
			};
			/** 契约自检的定时器与已报过的问题（去重，避免反复刷控制台）。 */
			let contractTimer = 0;
			const contractWarnings = new Set();
			/**
			 * 文案在本次启动里固定：点新会话、切主题再切回来都用同一条；
			 * 只有重新启动客户端才会重新抽。
			 */
			const refreshStyle = () => {
				const glassSheet = glassCss(theme);
				applyAppearanceStyle(mode, theme, glassSheet + heroBrandCss(theme));
				applyHeroLineCss(theme, heroLineFor(theme));
				applyGlassDom(glass);
			};
			refreshStyle();
			ctx.effect(
				() => () => {
					flushGlassPersist();
					if (contractTimer !== 0) clearTimeout(contractTimer);
					const stale = document.querySelectorAll('style[data-plugin="personal-appearance"]');
					for (const tag of stale) tag.remove();
					// 毛玻璃铺在 body 上，卸载时连属性、自定义属性和背景层一起收掉。
					const root = document.documentElement;
					delete root.dataset.paGlass;
					delete root.dataset.paGlow;
					root.style.removeProperty("--pa-glass-blur");
					root.style.removeProperty("--pa-glass-alpha");
					const layer = document.getElementById(GLASS_LAYER_ID);
					if (layer !== null) layer.remove();
				},
				"personal-appearance: appearance style",
			);

			/** 当前生效的品牌占位注册；换主题时整组换掉。 */
			let brandDisposers = [];

			const disposeBrand = () => {
				for (const dispose of brandDisposers) {
					if (typeof dispose === "function") dispose();
				}
				brandDisposers = [];
			};

			/**
			 * 把左上角的名字和图形换成当前主题的品牌。
			 *
			 * `sidebar.brand.mark` / `sidebar.brand.name` 都是 single 槽，
			 * 谁 priority 高谁生效：注册进来的组件直接顶替官方那一条，
			 * 所以不会再出现「原名 + 新名」并排的情况。
			 */
			const applyBrand = () => {
				disposeBrand();
				const spec = BRAND_SPEC[theme];
				if (spec === undefined) return;

				/** 官方 mark；尺寸由 owner 给（侧栏 24、空会话 34）。 */
				const Mark = (props) => {
					const size = typeof props.size === "number" ? props.size : 24;
					return h(
						"svg",
						{
							viewBox: "0 0 24 24",
							width: size,
							height: size,
							fill: "currentColor",
							"aria-hidden": true,
							"data-personal-appearance-brand": "",
							className: props.className,
							style: { display: "block", flex: "none" },
						},
						h("path", { d: spec.markPath }),
					);
				};

				/*
				 * 左上角的 mark：在 owner 给的尺寸上乘主题系数（Codex 放大一档），
				 * 空会话 hero 的 mark 走 HeroMark，不经过这里，避免跟着一起变大。
				 */
				const sidebarScale = typeof spec.sidebarMarkScale === "number" ? spec.sidebarMarkScale : 1;
				const SidebarMark = (props) => {
					const size = typeof props.size === "number" ? props.size : 24;
					return h(Mark, { ...props, size: size * sidebarScale });
				};

				/*
				 * 官方字标矢量。高度按默认那套字标量出来的字身高度取 21px，宽度按
				 * viewBox 比例算——不同字标比例不同，写死宽度会把字拉变形。
				 */
				const Wordmark = (props) => {
					const box = spec.wordmark.viewBox.split(" ").map(Number);
					const height = typeof props.height === "number" ? props.height : spec.wordmark.height;
					return h(
						"svg",
						{
							viewBox: spec.wordmark.viewBox,
							width: (height * box[2]) / box[3],
							height,
							fill: "currentColor",
							"aria-hidden": true,
							"data-personal-appearance-brand": "",
							style: { display: "block", flex: "none", overflow: "visible" },
						},
						spec.wordmark.paths.map((item, index) =>
							h("path", {
								key: index,
								d: item.d,
								fillRule: item.evenodd ? "evenodd" : "nonzero",
							}),
						),
					);
				};

				const Name = () => {
					if (spec.wordmark !== null) return h(Wordmark, {});
					const name = spec.nameWordmark;
					if (name !== undefined) {
						const box = name.viewBox.split(" ").map(Number);
						const height = typeof name.height === "number" ? name.height : 20;
						const strokeWidth = typeof name.strokeWidth === "number" ? name.strokeWidth : 0;
						return h(
							"svg",
							{
								viewBox: name.viewBox,
								width: (height * box[2]) / box[3],
								height,
								fill: "currentColor",
								"data-personal-appearance-brand": "",
								stroke: strokeWidth > 0 ? "currentColor" : undefined,
								strokeWidth: strokeWidth > 0 ? strokeWidth : undefined,
								strokeLinejoin: "round",
								"aria-hidden": true,
								style: { display: "block", flex: "none", overflow: "visible" },
							},
							name.paths.map((item, index) =>
								h("path", {
									key: index,
									d: item.d,
									fillRule: item.evenodd ? "evenodd" : "nonzero",
								}),
							),
						);
					}
					return h(
						"span",
						{
							"data-personal-appearance-brand": "",
							style: {
								display: "inline-flex",
								alignItems: "center",
								height: "24px",
								fontSize: "24px",
								fontWeight: 500,
								lineHeight: "24px",
								letterSpacing: "-0.01em",
								whiteSpace: "nowrap",
								color: "inherit",
							},
						},
						spec.title,
					);
				};

				/**
				 * 空会话主界面的 mark：同一个图形，按主题放大一档。
				 *
				 * owner 传的是 size 34，这里只是把尺寸乘上去；悬停摆动的 class
				 * 原样透传，动画不受影响。
				 */
				const heroScale = typeof spec.heroMarkScale === "number" ? spec.heroMarkScale : 1;
				const HeroMark = (props) => {
					const size = typeof props.size === "number" ? props.size : 34;
					return h(Mark, { ...props, size: size * heroScale });
				};

				const shared = { id: "personal-appearance-brand", priority: BRAND_PRIORITY };
				brandDisposers = [
					ctx.slots.inject("sidebar.brand.mark", () =>
						ctx.slots.register({ ...shared, name: "sidebar.brand.mark" }, SidebarMark),
					),
					ctx.slots.inject("sidebar.brand.name", () =>
						ctx.slots.register({ ...shared, name: "sidebar.brand.name" }, Name),
					),
					// 空会话主界面的那个 logo 走的是 hero 槽，owner 传的是 size 34。
					ctx.slots.inject("conversation.hero.brand.mark", () =>
						ctx.slots.register({ ...shared, name: "conversation.hero.brand.mark" }, HeroMark),
					),
				];
			};

			applyBrand();
			ctx.effect(() => () => disposeBrand(), "personal-appearance: brand occupants");

			/**
			 * DOM / 插槽契约自检。
			 *
			 * 上游改类名、删槽位或重命名字体 token 时，这些功能会静默失效；
			 * 启动和换主题后各检查一次，拿不到就在控制台点名。只提示，不改行为。
			 */
			const warnContract = (key, message) => {
				if (contractWarnings.has(key)) return;
				contractWarnings.add(key);
				console.warn("[personal-appearance] " + message);
			};
			const runContractCheck = () => {
				// 自检只负责提示，本身不能抛错影响插件运行。
				try {
					if (typeof document === "undefined" || document.body === null) return;
					// 只在真有 Windows 标题栏的宿主上检查入口；Web / 非 Windows 本来就没有这个按钮。
					if (
						document.querySelector("[data-windows-titlebar]") !== null &&
						(button === null || !button.isConnected)
					) {
						warnContract(
							"entry",
							"标题栏入口未挂载：找不到 [data-windows-menu] shadow root 里的 [role=menubar]，上游结构可能已变更。",
						);
					}
					if (theme === "default") return;
					// 侧栏不在 DOM 里（比如全屏面板）时不检查品牌，避免误报。
					if (
						document.querySelector('[class*="sidebarCol"]') !== null &&
						document.querySelector("[data-personal-appearance-brand]") === null
					) {
						warnContract(
							"brand",
							"品牌插槽未渲染：sidebar.brand.* / conversation.hero.brand.mark 可能被上游移除或改名。",
						);
					}
					const marker = theme === "codex" ? "Segoe UI Variable" : "Source Han Serif SC VF";
					const applied = window
						.getComputedStyle(document.body)
						.getPropertyValue("--dsw-font-family");
					if (!applied.includes(marker)) {
						warnContract(
							"font",
							"主题字体未生效：--dsh-font-family-*-default 可能已被上游重命名，或被其他皮肤插件覆盖。",
						);
					}
				} catch {
					// 忽略：自检失败不应该影响任何功能。
				}
			};
			const scheduleContractCheck = (delay) => {
				if (contractTimer !== 0) clearTimeout(contractTimer);
				contractTimer = setTimeout(() => {
					contractTimer = 0;
					runContractCheck();
				}, delay === undefined ? 1500 : delay);
			};

			/** 切换圆角档位：样式 + 记忆。 */
			const setMode = (next) => {
				if (!MODES.includes(next)) return;
				mode = next;
				refreshStyle();
				writeMode(next);
			};

			/** 切换主题：样式 + 品牌 + 记忆。 */
			const setTheme = (next) => {
				if (!THEMES.includes(next)) return;
				theme = next;
				refreshStyle();
				applyBrand();
				scheduleContractCheck(600);
				writeTheme(next);
			};

			/** 开/关毛玻璃：只动 html 属性和背景层，样式表不用重铺。 */
			const setGlassOn = (next) => {
				glass.on = next;
				writeGlass(glass);
				applyGlassDom(glass);
			};

			/** 拖动滑块：改自定义属性即时生效，再记住。 */
			const setGlassValue = (key, value) => {
				glass[key] = value;
				applyGlassDom(glass);
				scheduleGlassPersist();
			};

			/** 开/关光晕：只切背景层里的光斑，样式表不用重铺。 */
			const setGlassGlow = (next) => {
				glass.glow = next;
				writeGlass(glass);
				applyGlassDom(glass);
			};

			/** 光晕开关：一个小拨杆，摆在「光晕」两个字右边。 */
			const createGlowSwitch = () => {
				const toggle = document.createElement("button");
				toggle.type = "button";
				toggle.className = "pa-switch";
				toggle.setAttribute("role", "switch");
				toggle.setAttribute("aria-label", t("feature.glow.name"));
				const knob = document.createElement("span");
				knob.className = "pa-switch-knob";
				toggle.appendChild(knob);

				const sync = () => {
					const on = glass.glow !== false;
					toggle.setAttribute("aria-checked", on ? "true" : "false");
					toggle.dataset.on = on ? "true" : "false";
					// 毛玻璃关着时背景层都没有，光晕开关也一起失效。
					toggle.disabled = !glass.on;
				};

				toggle.addEventListener("click", () => {
					if (!glass.on) return;
					setGlassGlow(glass.glow === false);
					sync();
				});
				sync();

				return { toggle, sync };
			};

			/**
			 * 一行功能：图标 + 名称/说明 + 分段选择器。
			 * 返回根节点、按钮表和 sync()，选中项变化时调 sync() 刷新。
			 */
			const createFeature = (options) => {
				const feature = document.createElement("div");
				feature.className = "pa-feature";

				const head = document.createElement("div");
				head.className = "pa-head";
				const icon = span("pa-icon");
				icon.appendChild(options.glyph());
				const text = span("pa-text");
				text.append(span("pa-name", t(options.name)), span("pa-desc", t(options.desc)));
				head.append(icon, text);

				const seg = document.createElement("div");
				seg.className = "pa-seg";
				seg.style.gridTemplateColumns = "repeat(" + options.values.length + ",1fr)";
				seg.setAttribute("role", "radiogroup");
				seg.setAttribute("aria-label", t(options.name));

				const thumb = document.createElement("span");
				thumb.className = "pa-seg-thumb";
				thumb.setAttribute("aria-hidden", "true");
				seg.appendChild(thumb);

				const buttons = new Map();

				/**
				 * 把白色滑块挪到当前选中项下面。
				 *
				 * 用 offset* 而不是 getBoundingClientRect()：菜单刚打开的那 340ms 里
				 * 面板带着 scale() 动画，getBoundingClientRect() 量到的是缩放后的尺寸，
				 * 滑块会落偏；offset* 是布局值，不受祖先 transform 影响。
				 *
				 * animate=false 只用于菜单刚打开、还没落位的那一次；之后切换都带弹簧。
				 */
				const placeThumb = (animate) => {
					// 面板还没进 DOM 时量不到位置，先按着；openMenu() 追加后会再 sync 一次。
					if (seg.offsetWidth === 0) return;
					let target = null;
					for (const value of options.values) {
						if (options.isActive(value)) {
							target = buttons.get(value);
							break;
						}
					}
					if (target === undefined || target === null) return;
					if (!animate) thumb.style.transition = "none";
					thumb.style.width = target.offsetWidth + "px";
					thumb.style.height = target.offsetHeight + "px";
					thumb.style.transform =
						"translate3d(" + target.offsetLeft + "px," + target.offsetTop + "px,0)";
					if (!animate) {
						// 先把「无过渡落位」刷进样式，再把过渡交还 CSS 里那条弹簧。
						void thumb.offsetWidth;
						thumb.style.transition = "";
					}
					seg.dataset.thumb = "ready";
				};

				const sync = (animate) => {
					for (const [value, node] of buttons) {
						const active = options.isActive(value);
						node.dataset.active = active ? "true" : "false";
						node.setAttribute("aria-checked", active ? "true" : "false");
						node.tabIndex = active ? 0 : -1;
					}
					placeThumb(animate === true);
				};

				for (const value of options.values) {
					const choice = document.createElement("button");
					choice.type = "button";
					choice.className = "pa-seg-btn";
					choice.dataset.value = value;
					choice.setAttribute("role", "radio");
					if (options.dot !== undefined) {
						const dot = span("pa-dot");
						dot.style.color = options.dot[value];
						choice.appendChild(dot);
					}
					choice.appendChild(document.createTextNode(t(options.labelPrefix + value)));
					choice.addEventListener("click", () => {
						options.select(value);
						sync(true);
					});
					buttons.set(value, choice);
					seg.appendChild(choice);
				}
				sync(false);

				feature.append(head, seg);
				return { feature, buttons, sync, head };
			};

			/**
			 * 一档滑块：名称 + 当前值一行，下面一条 range。
			 * 返回根节点、input 和 syncDisabled()——玻璃关着时整行变灰、点不动。
			 */
			const createSlider = (options) => {
				const feature = document.createElement("div");
				feature.className = "pa-feature pa-slider-row";

				const head = document.createElement("div");
				head.className = "pa-slider-head";
				const name = span("pa-name", t(options.name));
				const valueLabel = span("pa-slider-value", options.format(glass[options.key]));
				head.append(name, valueLabel);

				const input = document.createElement("input");
				input.type = "range";
				input.className = "pa-range";
				input.min = String(options.min);
				input.max = String(options.max);
				input.step = String(options.step);
				input.value = String(glass[options.key]);
				input.setAttribute("aria-label", t(options.name));
				input.addEventListener("input", () => {
					const value = clampNumber(Number(input.value), options.min, options.max);
					setGlassValue(options.key, value);
					valueLabel.textContent = options.format(value);
				});
				// 松手 / 失焦时立刻落盘，不用等节流定时器。
				input.addEventListener("change", flushGlassPersist);
				input.addEventListener("blur", flushGlassPersist);

				const syncDisabled = () => {
					const disabled = !glass.on;
					input.disabled = disabled;
					feature.dataset.disabled = disabled ? "true" : "false";
				};
				syncDisabled();

				feature.append(head, input);
				return { feature, input, syncDisabled };
			};

			let button = null;
			let bar = null;
			let host = null;
			let shadow = null;
			/** 当前打开着的菜单。 */
			let menu = null;
			/** 正在播退场动画、还没摘掉的面板（此时 menu 已经是 null）。 */
			let closing = null;
			/** 本次打开的时刻；打开弹簧没跑完就关时用它跳过退场。 */
			let openedAt = 0;
			let barObserver = null;
			let disposed = false;

			const menuIsOpen = () => menu !== null;

			const setExpanded = (expanded) => {
				if (button !== null) button.setAttribute("aria-expanded", expanded ? "true" : "false");
			};

			const prefersReducedMotion = () =>
				typeof window.matchMedia === "function" &&
				window.matchMedia("(prefers-reduced-motion: reduce)").matches;

			/** 把面板从 shadow root 里摘掉，并清掉引用。 */
			const detachMenu = (panel) => {
				if (panel === null) return;
				panel.remove();
				if (menu === panel) menu = null;
				if (closing === panel) closing = null;
			};

			/** 重新打开、或宿主/按钮换掉时，把还在退场的面板立刻收掉。 */
			const cancelClosing = () => {
				if (closing !== null) detachMenu(closing);
			};

			/**
			 * 关菜单：先播退场动画，动画结束再摘节点。
			 *
			 * `immediate` 用于布局或引用已经变化、以及插件卸载的场合——这时候留一个
			 * 还在退场的面板没有意义，也会拖着旧 shadow root 不放。
			 *
			 * 两种情况下不播退场、直接摘：
			 * - 「刚打开就关」：打开弹簧还没跑完，`pa-out` 会从全不透明重新开始，闪一下。
			 * - 系统开了「减少动态效果」。
			 *
			 * 摘节点同时挂 `animationend` 和兜底定时器：动画被系统关掉或事件没送到时，
			 * 节点也不会一直挂在 shadow root 里。
			 */
			const closeMenu = (immediate) => {
				if (menu === null) return;
				const panel = menu;
				menu = null;
				setExpanded(false);
				if (
					immediate === true ||
					prefersReducedMotion() ||
					performance.now() - openedAt < MENU_POP_MS
				) {
					detachMenu(panel);
					return;
				}
				closing = panel;
				panel.dataset.state = "closing";
				const finish = () => {
					if (closing !== panel) return;
					clearTimeout(fallback);
					panel.removeEventListener("animationend", onEnd);
					detachMenu(panel);
				};
				const onEnd = (event) => {
					// 只看退场那一条：打开弹簧的 animationend 偶尔会和关闭落在同一帧，
					// 认名字才不会把退场动画跳过。
					if (event.target === panel && event.animationName === "pa-out") finish();
				};
				const fallback = setTimeout(finish, MENU_EXIT_MS + 120);
				panel.addEventListener("animationend", onEnd);
			};

			const openMenu = () => {
				if (button === null || shadow === null || menu !== null) return;
				// 退场途中又点开：把还在淡出的面板直接收掉，再重新弹一个。
				cancelClosing();
				const rect = button.getBoundingClientRect();
				// 窄窗口下宽度跟着视口收，别写死 268 再右溢。
				const menuWidth = Math.min(MENU_WIDTH, Math.max(0, window.innerWidth - 16));
				const maxLeft = Math.max(8, window.innerWidth - menuWidth - 8);
				const left = Math.round(Math.max(8, Math.min(rect.left, maxLeft)));
				const top = Math.round(rect.bottom + 6);

				const panel = document.createElement("div");
				panel.className = "pa-menu";
				panel.dataset[MENU_ATTR] = "";
				panel.setAttribute("role", "menu");
				panel.setAttribute("aria-label", t("menu.title"));
				panel.style.left = left + "px";
				panel.style.top = top + "px";
				// 弹簧的起点对齐入口按钮的中轴，y=0 就是菜单顶边（在按钮下方 6px 处）。
				// 面板可能因右侧放不下而被左推，所以按按钮实际位置算，并留出圆角的余量。
				const originX = Math.round(
					Math.max(12, Math.min(rect.left + rect.width / 2 - left, menuWidth - 12)),
				);
				panel.style.transformOrigin = originX + "px 0";

				const header = document.createElement("div");
				header.className = "pa-header";
				header.append(span("pa-title", t("menu.title")), span("pa-badge", t("menu.badge")));

				const radius = createFeature({
					glyph: createCornerGlyph,
					name: "feature.radius.name",
					desc: "feature.radius.desc",
					values: MODES,
					labelPrefix: "mode.",
					isActive: (value) => value === mode,
					select: setMode,
				});

				const themeColor = createFeature({
					glyph: createThemeGlyph,
					name: "feature.theme.name",
					desc: "feature.theme.desc",
					values: THEMES,
					labelPrefix: "theme.",
					dot: THEME_DOTS,
					isActive: (value) => value === theme,
					select: setTheme,
				});

				const sep = document.createElement("div");
				sep.className = "pa-sep";

				const glassToggle = createFeature({
					glyph: createGlassGlyph,
					name: "feature.glass.name",
					desc: "feature.glass.desc",
					values: ["off", "on"],
					labelPrefix: "glass.",
					isActive: (value) => (value === "on") === glass.on,
					select: (value) => {
						setGlassOn(value === "on");
						// 关掉时下面的滑块和光晕开关一起变灰，不用重开菜单。
						blurRow.syncDisabled();
						opacityRow.syncDisabled();
						syncGlowRow();
					},
				});

				const blurRow = createSlider({
					name: "feature.glass.blur",
					key: "blur",
					min: GLASS_BLUR_MIN,
					max: GLASS_BLUR_MAX,
					step: GLASS_BLUR_STEP,
					format: (value) => value + "px",
				});

				const opacityRow = createSlider({
					name: "feature.glass.opacity",
					key: "opacity",
					min: GLASS_OPACITY_MIN,
					max: GLASS_OPACITY_MAX,
					step: GLASS_OPACITY_STEP,
					format: (value) => value + "%",
				});

				// 「光晕」一行：图标 + 两个字，拨杆就跟在这两个字右边，没有说明文字。
				const glowSwitch = createGlowSwitch();
				const glowRow = document.createElement("div");
				glowRow.className = "pa-feature pa-glow-row";
				const glowHead = document.createElement("div");
				glowHead.className = "pa-head";
				const glowIcon = span("pa-icon");
				glowIcon.appendChild(createGlowGlyph());
				const glowText = span("pa-text");
				glowText.append(span("pa-name", t("feature.glow.name")), glowSwitch.toggle);
				glowHead.append(glowIcon, glowText);
				glowRow.append(glowHead);

				/** 毛玻璃关着时这一行整体变灰、拨杆点不动。 */
				const syncGlowRow = () => {
					glowRow.dataset.disabled = glass.on ? "false" : "true";
					glowSwitch.sync();
				};
				syncGlowRow();

				const sep2 = document.createElement("div");
				sep2.className = "pa-sep";

				const foot = document.createElement("div");
				foot.className = "pa-foot";
				foot.textContent =
					t("menu.footer") + (contractWarnings.size > 0 ? " · " + t("menu.warning") : "");

				panel.append(
					header,
					radius.feature,
					sep,
					themeColor.feature,
					sep2,
					glassToggle.feature,
					blurRow.feature,
					opacityRow.feature,
					glowRow,
					foot,
				);
				shadow.appendChild(panel);
				openedAt = performance.now();
				// 进 DOM 之后才量得到滑块的位置：先无动画落位，之后切换才滑过去。
				radius.sync(false);
				themeColor.sync(false);
				glassToggle.sync(false);
				syncGlowRow();
				// 按钮靠近窗口底部时下面放不下：量到实际高度后往上收，别让菜单越出底边。
				const maxTop = Math.max(8, window.innerHeight - panel.offsetHeight - 8);
				if (top > maxTop) panel.style.top = maxTop + "px";
				menu = panel;
				setExpanded(true);
				// 只有按钮本身有焦点（键盘打开）时才把焦点交给菜单；
				// 鼠标打开不抢编辑器焦点，和原生菜单一致。
				if (document.activeElement === button) {
					const current = radius.buttons.get(mode);
					if (current !== undefined) current.focus({ preventScroll: true });
				}
			};

			const toggleMenu = () => {
				if (menuIsOpen()) closeMenu();
				else openMenu();
			};

			const onPointerDown = (event) => {
				if (menu === null) return;
				const path = typeof event.composedPath === "function" ? event.composedPath() : [];
				if (path.includes(menu) || path.includes(button)) return;
				closeMenu();
			};
			const onKeyDown = (event) => {
				if (event.key !== "Escape" || menu === null) return;
				event.preventDefault();
				event.stopPropagation();
				closeMenu();
				if (button !== null) button.focus({ preventScroll: true });
			};
			// 窗口缩放 / 失焦时面板的位置已经不对了，直接摘，不播退场。
			const onResize = () => {
				closeMenu(true);
				cancelClosing();
			};
			document.addEventListener("pointerdown", onPointerDown, true);
			document.addEventListener("keydown", onKeyDown, true);
			window.addEventListener("resize", onResize);
			window.addEventListener("blur", onResize);
			ctx.effect(
				() => () => {
					document.removeEventListener("pointerdown", onPointerDown, true);
					document.removeEventListener("keydown", onKeyDown, true);
					window.removeEventListener("resize", onResize);
					window.removeEventListener("blur", onResize);
				},
				"personal-appearance: menu listeners",
			);

			/**
			 * 菜单样式注册在标题栏的 shadow root 里。热更新时旧的 style 标签可能还活着，
			 * 所以内容不一致就原地替换，避免继续用上一版样式。
			 */
			const ensureShadowStyle = () => {
				if (shadow === null) return;
				const existing = shadow.querySelector('style[data-plugin-css="' + MENU_STYLE + '"]');
				if (existing !== null) {
					if (existing.textContent !== MENU_CSS) existing.textContent = MENU_CSS;
					return;
				}
				const tag = document.createElement("style");
				tag.dataset.plugin = "personal-appearance";
				tag.dataset.pluginCss = MENU_STYLE;
				tag.textContent = MENU_CSS;
				shadow.appendChild(tag);
			};

			/** 让按钮紧跟「文件清理」，没有它时排在菜单条末尾。 */
			const positionButton = () => {
				if (button === null || bar === null) return;
				const anchor = bar.querySelector(CLEANUP_BUTTON);
				if (anchor !== null) {
					if (anchor.nextElementSibling !== button) anchor.after(button);
				} else if (button.parentNode !== bar) {
					bar.append(button);
				}
			};

			const createButton = () => {
				const created = document.createElement("button");
				created.type = "button";
				created.dataset[BUTTON_ATTR] = "";
				created.setAttribute("role", "menuitem");
				created.setAttribute("aria-haspopup", "menu");
				created.setAttribute("aria-expanded", "false");
				// 与 preload 的做法一致：不抢焦点，编辑器里的选区不丢。
				created.addEventListener("pointerdown", (event) => event.preventDefault());
				created.addEventListener("mousedown", (event) => event.preventDefault());
				created.addEventListener("click", toggleMenu);
				return created;
			};

			const ensureButton = () => {
				if (disposed) return;
				// 插件极早加载时 body 可能还没就绪，背景层补建一次；之后没建过就一直是同一层。
				if (glass.on) syncGlassLayer(true);
				const found = document.querySelector(MENUBAR_HOST);
				const foundShadow = found === null ? null : found.shadowRoot;
				if (foundShadow === null || foundShadow === undefined) return;
				const menubar = foundShadow.querySelector('[role="menubar"]');
				if (menubar === null) return;

				if (bar !== menubar) {
					closeMenu(true);
					cancelClosing();
					if (barObserver !== null) barObserver.disconnect();
					host = found;
					shadow = foundShadow;
					bar = menubar;
					barObserver = new MutationObserver(() => positionButton());
					barObserver.observe(bar, { childList: true });
					ensureShadowStyle();
				}
				if (button === null || !button.isConnected) {
					closeMenu(true);
					cancelClosing();
					button = createButton();
					bar.append(button);
					// 等 React 把品牌/字体都挂上再做契约自检，避免误报。
					scheduleContractCheck(1200);
				}
				const label = t("entry.label");
				if (button.textContent !== label) button.textContent = label;
				positionButton();
			};

			ensureButton();
			// 兜底自检：即使 menubar 一直没出现（入口没挂上）也要报一次。
			scheduleContractCheck(2500);
			const timer = setInterval(ensureButton, 600);
			ctx.effect(
				() => () => {
					disposed = true;
					clearInterval(timer);
					closeMenu(true);
					cancelClosing();
					if (barObserver !== null) barObserver.disconnect();
					if (button !== null) button.remove();
					if (shadow !== null) {
						const style = shadow.querySelector('style[data-plugin-css="' + MENU_STYLE + '"]');
						if (style !== null) style.remove();
					}
					button = null;
					bar = null;
					host = null;
					shadow = null;
				},
				"personal-appearance: titlebar entry",
			);
		}

		exports.apply = apply;
		exports.inject = inject;
		exports.name = "personal-appearance";
		return module.exports;
	},
});
