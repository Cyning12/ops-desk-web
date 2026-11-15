# R1 审查 · web-p1-t5b-goal-chip

- 契约逐键比对上游 router.py/store.py：{goals:[...]} 非 ok 包裹 ✓ · 词表 active|paused|done|abandoned ✓ · 422/404/409/401 语义头注 ✓
- 迁移矩阵模板面：active→paused/done/abandoned · paused→active/done/abandoned · 终态零菜单项 ✓（O-1 人工复活通道=恢复目标）
- 文案裁定：「修订目标」tooltip ✓ · 全仓 grep「重命名」零命中 ✓
- 降级：loadThreadGoal catch→null 不炸屏 ✓ · 401 静默交拦截器 ✓
- 结论：GO
