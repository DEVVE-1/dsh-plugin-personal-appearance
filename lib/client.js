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
		/** 首次加载（还没存过档位）时用哪一档。 */
		const FALLBACK_MODE = "small";
		/** 主题的持久化键。 */
		const THEME_STORAGE_KEY = "personal-appearance:theme";
		/** 可选主题。 */
		const THEMES = ["default", "codex", "claude"];
		/** 首次加载（还没存过主题）时用哪一套。 */
		const FALLBACK_THEME = "claude";
		/**
		 * 品牌方案版本。
		 *
		 * 旧版本把品牌做成「在原名旁边追加」，换过一次方案后必须把用户存下的
		 * 档位清掉一次，否则它会一直盖住新的兜底档、看到的还是旧效果。
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
				// 字体：SF Pro 系（macOS 原生，Windows 落到 Segoe UI），代码 SF Mono -> Consolas
				"html:root{",
				'--dsh-font-family-text-default:-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI Variable Text", "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif;',
				'--dsh-font-family-code-default:"SF Mono", "Cascadia Mono", Consolas, "Liberation Mono", Menlo, Courier, "Microsoft YaHei", monospace;',
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
				// 浅色：页面 #f9f9f7、卡片纯白、正文 #2d2d2b、主按钮近黑
				"html:root body:not([data-ds-dark-theme]){",
				"--dsw-alias-bg-base:#f9f9f7;",
				"--dsw-alias-bg-overlay:#f2f2f0;",
				"--dsw-alias-bg-layer-2:#ffffff;",
				"--dsw-alias-bg-layer-3:#ffffff;",
				"--dsw-specific-sidebar-fill:#f4f4f2;",
				"--dsw-specific-menu:#ffffff;",
				"--dsw-alias-scrollbar-bg-l1:#e2e2e1;",
				"--dsw-alias-scrollbar-bg-l2:#d4d4d3;",
				"--dsw-alias-scrollbar-hover-l1:#c8c8c6;",
				"--dsw-alias-scrollbar-hover-l2:#bcbcba;",
				"--dsw-alias-label-primary:#2d2d2b;",
				"--dsw-alias-label-secondary:#5a5a58;",
				"--dsw-alias-label-tertiary:#767674;",
				"--dsw-alias-label-caption:#a6a6a4;",
				"--dsw-alias-button-primary-fill:#0d0d0d;",
				"--dsw-alias-button-primary-hover:#242423;",
				"--dsw-alias-border-l1:rgba(0,0,0,.07);",
				"--dsw-alias-border-l2:rgba(0,0,0,.12);",
				"--dsw-alias-border-l3:rgba(0,0,0,.16);",
				"--dsw-alias-border-l4:rgba(0,0,0,.21);",
				"}",
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
				// 字体：Styrene / Söhne 系（装了就用），Windows 退到 Calibri / Candara 的人文无衬线
				"html:root{",
				'--dsh-font-family-text-default:-apple-system, BlinkMacSystemFont, "Styrene B", "Söhne", "Segoe UI Variable Display", "Calibri", "Candara", "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;',
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
				"}",
				// 深色：#141413 底 + #262624 卡片 + 陶土主按钮（文字保持深色）
				"html:root body[data-ds-dark-theme]{",
				"--dsw-alias-bg-base:#141413;",
				"--dsw-alias-bg-layer-1:#1b1a18;",
				"--dsw-alias-bg-layer-2:#262624;",
				"--dsw-alias-bg-layer-3:#2c2a27;",
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
				 * 官方 slogan：文档概述首句 + 产品页首屏两句，打开新会话时随机取一条。
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
				"px;padding:6px;border-radius:var(--dsw-radius-lg,10px);background:var(--dsw-alias-bg-overlay,#f4f5f7);border:.5px solid var(--dsw-alias-border-l1,rgba(0,0,0,.1));box-shadow:0 12px 32px rgba(0,0,0,.22),0 2px 6px rgba(0,0,0,.08);color:var(--dsw-alias-label-primary);font-family:var(--dsw-font-family);text-align:left;cursor:default;animation:pa-pop .32s cubic-bezier(.22,1.25,.36,1) both;animation:pa-pop " +
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
			"menu.footer": "选中即时生效，并会记住你的选择。",
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
			"menu.footer": "Changes apply instantly and are remembered.",
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
		 * 名字所在的 span 没有 class，只能按结构定位：titleGroup 里第一个非 badge
		 * 的 span 就是它。藏掉之后用 ::before 补名字，order:-2 让它排在标语和
		 * 「预览版」徽标前面。
		 */
		function heroBrandCss(theme) {
			const spec = BRAND_SPEC[theme];
			if (spec === undefined) return "";
			const hide = '[class*="titleGroup"]>span:not([class*="previewBadge"]){display:none}';
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

		/** 空会话那句话的样式表标记；单独一张，换文案时只改它。 */
		const HERO_LINE_STYLE = "personal-appearance/heroLine.css";
		/** 空会话主界面的出现检测间隔（毫秒）；只用来判断「是不是又开了一个新会话」。 */
		const HERO_MOUNT_POLL_MS = 800;

		/** 在该主题的候选文案里随机挑一条，尽量不和上一条重复。 */
		function pickHeroLine(theme, previous) {
			const spec = BRAND_SPEC[theme];
			if (spec === undefined) return "";
			const list = spec.heroLines;
			if (list.length === 1) return list[0];
			let next = previous;
			while (next === previous) next = list[Math.floor(Math.random() * list.length)];
			return next;
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
				// 标语表单独维护，轮换时不能被整张主题表一起重建。
				if (tag.dataset.pluginCss === HERO_LINE_STYLE) continue;
				tag.remove();
			}
			const css = (THEME_CSS[theme] || "") + (RADIUS_CSS[mode] || "") + (extra || "");
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
				if (window.localStorage.getItem(THEME_VERSION_KEY) !== THEME_VERSION) {
					window.localStorage.removeItem(THEME_STORAGE_KEY);
					window.localStorage.setItem(THEME_VERSION_KEY, THEME_VERSION);
					return FALLBACK_THEME;
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
			/** 当前这句标语；换主题时重挑，之后由定时器轮换。 */
			let heroLine = "";
			const refreshStyle = () => {
				heroLine = pickHeroLine(theme, heroLine);
				applyAppearanceStyle(mode, theme, heroBrandCss(theme));
				applyHeroLineCss(theme, heroLine);
			};
			refreshStyle();
			/**
			 * 打开新会话时抽一条，抽完就固定。
			 *
			 * 空会话主界面是唯一带 `titleGroup` 的地方，所以只要盯它的出现：
			 * 从无到有 = 进了一个新的空会话。不按时间轮换——用户正在读的那行字
			 * 不该自己跳。
			 */
			let heroMounted = document.querySelector('[class*="titleGroup"]') !== null;
			const heroWatch = setInterval(() => {
				const present = document.querySelector('[class*="titleGroup"]') !== null;
				if (present === heroMounted) return;
				heroMounted = present;
				if (!present) return;
				const next = pickHeroLine(theme, heroLine);
				if (next === heroLine) return;
				heroLine = next;
				applyHeroLineCss(theme, heroLine);
			}, HERO_MOUNT_POLL_MS);
			ctx.effect(() => () => clearInterval(heroWatch), "personal-appearance: hero line");
			ctx.effect(
				() => () => {
					const stale = document.querySelectorAll('style[data-plugin="personal-appearance"]');
					for (const tag of stale) tag.remove();
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
							className: props.className,
							style: { display: "block", flex: "none" },
						},
						h("path", { d: spec.markPath }),
					);
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
					return h(
						"span",
						{
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
						ctx.slots.register({ ...shared, name: "sidebar.brand.mark" }, Mark),
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
				writeTheme(next);
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
				return { feature, buttons, sync };
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
				const maxLeft = Math.max(8, window.innerWidth - MENU_WIDTH - 8);
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
					Math.max(12, Math.min(rect.left + rect.width / 2 - left, MENU_WIDTH - 12)),
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

				const foot = document.createElement("div");
				foot.className = "pa-foot";
				foot.textContent = t("menu.footer");

				panel.append(header, radius.feature, sep, themeColor.feature, foot);
				shadow.appendChild(panel);
				openedAt = performance.now();
				// 进 DOM 之后才量得到滑块的位置：先无动画落位，之后切换才滑过去。
				radius.sync(false);
				themeColor.sync(false);
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
				}
				const label = t("entry.label");
				if (button.textContent !== label) button.textContent = label;
				positionButton();
			};

			ensureButton();
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
