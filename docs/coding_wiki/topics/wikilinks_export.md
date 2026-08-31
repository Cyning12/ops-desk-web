# 主题 · wikilink 与 wiki export（本仓）

> 图靠链接，不靠文件夹深度。schema：`harness.wiki_graph.v1`。

## 要点

- 双括号 wikilink + 相对 `.md` 链 → nodes/edges
- 加深 `git mv` 后须修链，再 `wiki export --json` 校验
- `wiki_delta` 字段闸 ≠ 目录形状（recommended）
- 叙述禁止伪双括号字面（会被当成未解析边）

## 命令

    npx dsh-coding-kit@1.10.0 wiki export --json --target .

## 相关

- [[README]] · [[topics/wiki_layout]] · [[stable]] · [[context]]
