/**
 * 个性化外观：Host 半边不做事。
 *
 * 全部功能都在浏览器半边（见 client.js）：标题栏入口、次级菜单与样式开关。
 * 保留一个合法的 apply 导出，让 bundle 补丁插入的这一行能正常激活。
 */
export function apply() {}

export const name = 'personal-appearance'
