# G-L2 indexes · 说明

> 默认不要整目录加载。按 path / symbol 命中后再打开对应 yaml。  
> 覆盖域（全模块清单）：`chat`（`10_flow_chat`）· `lg_rag`（`10_flow_lg_rag`）· `overview`（`10_flow_overview`）· `issues`（`10_flow_issues`）· `pulls`（`10_flow_pulls`）· `graph`（`10_flow_graph`）· `lc_evidence`（`10_flow_lc_evidence`）· `obs`（`10_flow_obs`）· `login`（`10_flow_login`）。拓扑变更须同步更新 indexes（改 flow 同 task 必改 indexes）。  
> 范围：上述 9 域 flow 的 implementedBy 符号倒排（path/symbol 双向）。键形态约定（2026-08-31 P2 · task_web_graph_l2_key_unify）：by_symbol 统一 `path#symbol` 复合键单形态（历史双形态已于本波归一 · 见 by_symbol.yaml 头注）；by_path 键即 path。
