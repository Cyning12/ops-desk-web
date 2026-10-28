# Invoke · web-hitl-resume-chase-ux · 10（task 落稿）

- **hat**: 10-task
- **at**: 2026-10-28
- **input**: 维护者（m00699/m00729）「点击批准继续后会循环调用replay接口」「为web新增task，对应性修复」；api 仓 00 实测钉案（run 1039c1a9：批准 13:26:13 → resume 200 → 恢复段 68s → 期间 replay 14 次全 200 → 自停）。
- **output**: `docs/tasks/active/task_web_hitl_resume_chase_ux.md`（draft · HG-TASK-DRAFT/HG-AUDIT-R1 均 pending）
- **第一锚**: chat.ts:1017-1021 上限 10 次/120s vs 实测 14 次 → 30 须先实证定位。
- **关系**: 吸收 api 仓草案 task_fix_hitl_card_resume_reentry 验收②③（幂等/detail 分类）；草案归档与否留维护者裁决。
- **lint**: `npx dsh-coding-kit task lint` PASS（W3/W5 warn-only · draft 期合法）。
- **未做**: 未切分支、未改 src、未 commit（30 开工时才切 task/web-hitl-resume-chase-ux）。
