
import { chromium } from 'playwright-core';
import fs from 'fs';

const BASE = 'http://127.0.0.1:5173';
const SHOTS = '/tmp/tw1-evidence/shots';
const LOG = '/tmp/tw1-evidence/ui_flow.log';
fs.mkdirSync(SHOTS, { recursive: true });
const log = (s) => { console.log(s); fs.appendFileSync(LOG, s + '\n'); };

const TOK_S1 = '<one-time-invite-token-redacted>';
const TOK_MAIN = '<one-time-invite-token-redacted>';
const TOK_VIEWER = '<one-time-invite-token-redacted>';

const browser = await chromium.launch({ channel: 'chrome', headless: true });

async function shot(page, name) {
  await page.screenshot({ path: SHOTS + '/' + name + '.png', fullPage: true });
  log('shot: ' + name + '.png');
}
async function login(page, username, token) {
  await page.goto(BASE + '/login');
  await page.getByPlaceholder('username').fill(username);
  await page.getByPlaceholder('invite token').fill(token);
  await page.getByRole('button', { name: '登录' }).click();
  await page.waitForURL(BASE + '/overview', { timeout: 15000 });
}
async function menuItems(page) {
  return await page.locator('.app-layout__menu .el-menu-item').allTextContents();
}

// ===== S1 认证回归（UI） =====
const ctx1 = await browser.newContext();
const p1 = await ctx1.newPage();
await p1.goto(BASE + '/');
await p1.waitForURL(/\/login/, { timeout: 15000 });
log('S1-UI-1 冷启动未登录访问 / → 重定向 ' + p1.url());
await shot(p1, 's1_01_cold_redirect_login');
await login(p1, 'admin', TOK_S1);
log('S1-UI-2 登录成功 → ' + p1.url() + ' · 用户=' + await p1.locator('.app-layout__username').textContent());
await shot(p1, 's1_02_login_overview');
await p1.reload();
await p1.waitForSelector('.app-layout__username', { timeout: 15000 });
await p1.waitForURL(/\/overview/);
log('S1-UI-3 刷新后会话存续 · url=' + p1.url() + ' · 用户=' + await p1.locator('.app-layout__username').textContent());
await shot(p1, 's1_03_reload_persist');
await p1.getByRole('button', { name: '登出' }).click();
await p1.waitForURL(/\/login/, { timeout: 15000 });
log('S1-UI-4 logout → ' + p1.url());
await shot(p1, 's1_04_logout');
await p1.goto(BASE + '/issues');
await p1.waitForURL(/\/login\?redirect=/, { timeout: 15000 });
log('S1-UI-5 未登录访问 /issues → 守卫重定向 ' + p1.url());
await shot(p1, 's1_05_guard_redirect');
await ctx1.close();

// =====  maintainer 会话：S6 + S4 + S7 =====
const ctx2 = await browser.newContext();
const p = await ctx2.newPage();
await login(p, 'admin', TOK_MAIN);
log('W5-maintainer 菜单项: ' + JSON.stringify(await menuItems(p)));
await shot(p, 'w5_01_maintainer_menu');
const hitlM = await p.evaluate(async () => (await fetch('/api/ops/hitl/pending')).status);
log('W5-maintainer GET /hitl/pending → ' + hitlM);

// --- S6 仪表盘 ---
await p.goto(BASE + '/overview');
await p.waitForLoadState('networkidle');
await shot(p, 's6_01_overview');
const ovText = (await p.locator('.app-layout__main').textContent()).replace(/\s+/g, ' ').slice(0, 300);
log('S6-1 overview 渲染文本摘录: ' + ovText);

await p.goto(BASE + '/issues');
await p.waitForLoadState('networkidle');
await shot(p, 's6_02_issues');
const issuesText = (await p.locator('.app-layout__main').textContent()).replace(/\s+/g, ' ').slice(0, 200);
log('S6-2 issues 渲染文本摘录: ' + issuesText);
// 筛选交互：state=open → 断言请求带参
const [req] = await Promise.all([
  p.waitForRequest((r) => r.url().includes('/api/ops/issues') && r.url().includes('state=open'), { timeout: 15000 }),
  (async () => {
    await p.locator('.issues-page__filter-select').first().click();
    await p.locator('.el-select-dropdown__item:visible', { hasText: 'open' }).first().click();
    await p.getByRole('button', { name: '查询' }).click();
  })(),
]);
log('S6-3 issues 筛选请求: ' + req.url());
await p.waitForLoadState('networkidle');
await shot(p, 's6_03_issues_filter_open');

await p.goto(BASE + '/pulls');
await p.waitForLoadState('networkidle');
await shot(p, 's6_04_pulls');
const pullsText = (await p.locator('.app-layout__main').textContent()).replace(/\s+/g, ' ').slice(0, 200);
log('S6-4 pulls 渲染文本摘录: ' + pullsText);
const [req2] = await Promise.all([
  p.waitForRequest((r) => r.url().includes('/api/ops/pulls') && r.url().includes('state='), { timeout: 15000 }),
  (async () => {
    await p.locator('.pulls-page .el-select').first().click();
    await p.locator('.el-select-dropdown__item:visible', { hasText: 'open' }).first().click();
  })(),
]);
log('S6-5 pulls 筛选请求: ' + req2.url());
await p.waitForLoadState('networkidle');
await shot(p, 's6_05_pulls_filter_open');

await p.goto(BASE + '/graph');
await p.waitForLoadState('networkidle');
await shot(p, 's6_06_graph');
const graphText = (await p.locator('.app-layout__main').textContent()).replace(/\s+/g, ' ').slice(0, 200);
log('S6-6 graph 渲染文本摘录: ' + graphText);

// --- S4 会话历史（真实 SSE 两轮） ---
await p.goto(BASE + '/chat');
await p.waitForSelector('.chat-page__composer textarea:not([disabled])', { timeout: 30000 });
await p.locator('.chat-page__composer textarea').fill('第一句：请用一个短句回答，ops-desk 是什么');
await p.locator('.chat-page__composer textarea').press('Enter');
await p.waitForSelector('.chat-page__hint:has-text("完成 · 耗时")', { timeout: 280000 });
const turn1 = await p.locator('.chat-message').count();
log('S4-1 第一轮完成 · 消息数=' + turn1);
await p.locator('.chat-page__composer textarea').fill('第二句：再用一个短句说说它的前端栈');
await p.locator('.chat-page__composer textarea').press('Enter');
await p.waitForFunction((n) => document.querySelectorAll('.chat-message--assistant .chat-message__text').length >= n, 2, { timeout: 280000 });
await p.waitForSelector('.chat-page__hint:has-text("完成 · 耗时")', { timeout: 280000 });
await shot(p, 's4_01_two_turns');
const threadId = (await p.locator('.chat-page__thread-id').textContent() || '').trim();
log('S4-2 第二轮完成 · ' + threadId);

await p.reload();
await p.waitForSelector('.chat-message', { timeout: 30000 });
await p.waitForLoadState('networkidle');
const replayUsers = await p.locator('.chat-message--user').count();
const replayAsst = await p.locator('.chat-message--assistant').count();
log('S4-3 刷新回放 · user=' + replayUsers + ' assistant=' + replayAsst);
await shot(p, 's4_02_reload_replay');

await p.locator('[data-test="history-toggle"]').click();
await p.waitForSelector('[data-test="chat-history-item"]', { timeout: 15000 });
const titles = await p.locator('[data-test="chat-history-item"] .chat-history__item-title').allTextContents();
log('S4-4 历史面板 threads=' + titles.length + ' · 首两条=' + JSON.stringify(titles.slice(0, 2).map(t => t.slice(0, 20))));
const beforeSwitch = await p.locator('.chat-message--user').allTextContents();
// 选另一条 thread（找标题不含「第一句」的）
const items = p.locator('[data-test="chat-history-item"]');
const n = await items.count();
let switched = false;
for (let i = 0; i < n; i++) {
  const t = await items.nth(i).locator('.chat-history__item-title').textContent();
  if (!t.includes('第一句')) { await items.nth(i).click(); switched = true; break; }
}
if (switched) {
  await p.waitForLoadState('networkidle');
  await p.waitForTimeout(1500);
  const afterSwitch = await p.locator('.chat-message--user').allTextContents();
  log('S4-5 切 thread · 前=' + JSON.stringify(beforeSwitch) + ' 后=' + JSON.stringify(afterSwitch.slice(0, 3)) + ' · 内容变化=' + (JSON.stringify(beforeSwitch) !== JSON.stringify(afterSwitch)));
  await shot(p, 's4_03_switch_thread');
}
// --- S7 同步调用（UI 成功态） ---
await p.goto(BASE + '/lg-rag');
await p.getByPlaceholder('输入问法（1..8000 字）').fill('你好，请用一句话问候');
await p.getByRole('button', { name: '提交' }).click();
await p.waitForSelector('.lg-rag-page__status, .lg-rag-page__error', { timeout: 290000 });
const lgOk = await p.locator('.lg-rag-page__status').count();
log('S7-1 lg-rag UI 提交 → ' + (lgOk ? '成功态渲染（status 卡）' : '错误态: ' + await p.locator('.lg-rag-page__error').textContent()));
await shot(p, 's7_01_lg_rag_ui');

await p.goto(BASE + '/lc-evidence');
await p.getByPlaceholder('输入检索问法').fill('ops-desk 项目简介');
await p.getByRole('button', { name: '提交' }).click();
await p.waitForSelector('.lc-evidence-page__meta, .lc-evidence-page__error, .lc-evidence-page__refuse', { timeout: 130000 });
const lcState = await p.locator('.lc-evidence-page__error').count() ? '错误态: ' + await p.locator('.lc-evidence-page__error').textContent()
  : await p.locator('.lc-evidence-page__refuse').count() ? '成功态(refuse 正常响应)' : '成功态(meta 卡)';
log('S7-2 lc-evidence UI 提交 → ' + lcState);
await shot(p, 's7_02_lc_evidence_ui');

await ctx2.close();

// ===== W5 viewer 面 =====
const ctx3 = await browser.newContext();
const p3 = await ctx3.newPage();
await login(p3, 'tester', TOK_VIEWER);
const vMenu = await menuItems(p3);
log('W5-viewer 菜单项: ' + JSON.stringify(vMenu));
log('W5-viewer 用户=' + await p3.locator('.app-layout__username').textContent());
await shot(p3, 'w5_02_viewer_menu');
const hitlV = await p3.evaluate(async () => (await fetch('/api/ops/hitl/pending')).status);
const admV = await p3.evaluate(async () => (await fetch('/api/ops/admin/capability/catalog', { method: 'GET' })).status);
log('W5-viewer GET /hitl/pending → ' + hitlV + ' · GET /admin/capability/catalog → ' + admV);
await ctx3.close();

await browser.close();
log('UI-FLOW-DONE');
