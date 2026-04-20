# Figures

- 流程图和时序图默认先用 Mermaid 起草，再由构建流程渲染成静态图插入 PDF。
- 如果一张 Mermaid 图已经承载多个主结论，就拆成总览图 + 细节图。
- 只有在布局精度、最终定稿或 Mermaid 无法清晰表达时，才改用 TikZ。
- 图前写用途，图后写结论；表格优先压缩定义、对比、证据与检查清单。
- 每次调整图表后，都应重新查看 `build/compile-review.md` 与 `build/self-check.md`。
