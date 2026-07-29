---
id: 001
title: Выбор компонентов Astryx для UI
type: research
status: closed
assignee: ""
labels: wayfinder:research
blocked_by: []
---

## Question

Какие компоненты из `@astryxdesign/core` использовать для каждого UI-элемента?

Нужно исследовать Astryx (Storybook / docs) и предложить маппинг:

- Button (variants: primary, secondary, ghost, danger)
- Input, Select, Textarea (формы)
- Table / ListView (список аукционов)
- Card / Surface (детальная карточка)
- Dialog (форма ставки)
- Toast / Banner (уведомления)
- Skeleton (skeleton states)
- Pagination
- Badge / Tag (статусы)
- Tabs (список аукционов / ставки)
- Layout: SideNav / TopNav

Исследовать:
1. Какие компоненты существуют в @v0.1.8
2. Как подключать CSS (импорт `@astryxdesign/core/dist/theme.css`)
3. Как работает Tailwind-бридж (если нужен)
4. Кастомные темы — можно ли просто переопределить CSS-переменные

**Output:** Markdown-файл `wayfinder/assets/astryx-component-map.md` с таблицей маппинга.
