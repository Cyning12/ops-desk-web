
import { chromium } from 'playwright-core';
import fs from 'fs';

const BASE = 'http://127.0.0.1:5173';
const SHOTS = '/tmp/tw1-evidence/shots';
const LOG = '/tmp/tw1-evidence/ui_flow.log';
const log = (s) => { console.log(s); fs.appendFileSync(LOG, s + '\n'); };

const TOK_A2 = '<one-time-invite-token-redacted>';
const TOK_V2 = '<one-time-invite-token-redacted>';
const SEED_TID = '11a5dbb52f6b46a3af6b566ed350bb8c';

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

// ===== S4 续：刷新恢复条 + 历史回放 + 切 thread =====
const ctx = await browser.newContext();
// 模拟刷新场景：localStorage 存有上次 thread_id（与 F1 真实刷新等价，同 key ops.lg-rag.thread-id）
await ctx.addInitScript((tid) => { window.localStorage.setItem('ops.lg-rag.thread-id', tid); }, SEED_TID);
const p = await ctx.newPage();
await login(p, 'admin', TOK_A2);
await p.goto(BASE + '/chat');
await p.waitForLoadState('networkidle');
const notice = p.locator('.chat-page__alert', { hasText: '已恢复上次会话上下文' });
const noticeVisible = await notice.count();
log('S4-R1 刷新后恢复条（历史不回显 · F1 设计语义）可见=' + noticeVisible);
await shot(p, 's4_04_restored_notice');

await p.locator('[data-test="history-toggle"]').click();
await p.waitForSelector('[data-test="chat-history-item"]', { timeout: 15000 });
const [histResp] = await Promise.all([
  p.waitForResponse((r) => r.url().includes('/history') && r.status() === 200, { timeout: 30000 }),
  p.locator('[data-test="chat-history-item"]', { hasText: '第一句' }).first().click(),
]);
fs.writeFileSync('/tmp/tw1-evidence/raw/thread_history.json', await histResp.text());
log('S4-R2 点击历史 thread → GET ' + histResp.url() + ' → 200，原始体已存 raw/thread_history.json');
await p.waitForSelector('.chat-message', { timeout: 20000 });
await p.waitForTimeout(1000);
const replayUsers = await p.locator('.chat-message--user').count();
const replayAsst = await p.locator('.chat-message--assistant').count();
log('S4-R3 历史回放渲染 · user=' + replayUsers + ' assistant=' + replayAsst + '（期望 2/2）');
await shot(p, 's4_05_history_replay');

// 切另一条 thread 验证内容切换
const items = p.locator('[data-test="chat-history-item"]');
const n = await items.count();
for (let i = 0; i < n; i++) {
  const t = await items.nth(i).locator('.chat-history__item-title').textContent();
  if (!t.includes('第一句')) {
    await items.nth(i).click();
    await p.waitForTimeout(2000);
    const users = await p.locator('.chat-message--user').allTextContents();
    log('S4-R4 切 thread「' + t.slice(0, 24) + '」· 首条 user 消息=' + JSON.stringify(users[0] || '(无)').slice(0, 60));
    await shot(p, 's4_06_switch_thread');
    break;
  }
}

// ===== S7 同步调用（UI 成功态） =====
await p.goto(BASE + '/lg-rag');
await p.getByPlaceholder('输入问法（1..8000 字）').fill('你好，请用一句话问候');
await p.getByRole('button', { name: '提交' }).click();
await p.waitForSelector('.lg-rag-page__status, .lg-rag-page__error', { timeout: 290000 });
const lgOk = await p.locator('.lg-rag-page__status').count();
log('S7-1 lg-rag UI 提交 → ' + (lgOk ? '成功态渲染（status 卡）' : '错误态: ' + (await p.locator('.lg-rag-page__error').textContent()).slice(0, 120)));
await shot(p, 's7_01_lg_rag_ui');

await p.goto(BASE + '/lc-evidence');
await p.getByPlaceholder('输入检索问法').fill('ops-desk 项目简介');
await p.getByRole('button', { name: '提交' }).click();
await p.waitForSelector('.lc-evidence-page__meta, .lc-evidence-page__error, .lc-evidence-page__refuse', { timeout: 130000 });
const lcState = await p.locator('.lc-evidence-page__error').count() ? '错误态: ' + (await p.locator('.lc-evidence-page__error').textContent()).slice(0, 120)
  : await p.locator('.lc-evidence-page__refuse').count() ? '成功态(refuse 正常响应)' : '成功态(meta 卡)';
log('S7-2 lc-evidence UI 提交 → ' + lcState);
await shot(p, 's7_02_lc_evidence_ui');
await ctx.close();

// ===== W5 viewer 面 =====
const ctx3 = await browser.newContext();
const p3 = await ctx3.newPage();
await login(p3, 'tester', TOK_V2);
const vMenu = await p3.locator('.app-layout__menu .el-menu-item').allTextContents();
log('W5-viewer 菜单项: ' + JSON.stringify(vMenu));
log('W5-viewer 用户=' + await p3.locator('.app-layout__username').textContent());
await shot(p3, 'w5_02_viewer_menu');
const hitlV = await p3.evaluate(async () => (await fetch('/api/ops/hitl/pending')).status);
log('W5-viewer GET /hitl/pending → ' + hitlV + '（期望 403）');
await ctx3.close();

await browser.close();
log('UI-FLOW-2-DONE');
