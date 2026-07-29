# Map: Cargo Auctions SPA

**Tracker:** local-markdown
**Label:** wayfinder:map

## Destination

SPA для работы с грузовыми аукционами по OpenAPI-схеме: список аукционов, детальная страница, история ставок и установка своей ставки. Стек: React 19 + TypeScript + Vite + TanStack Router/Query + RHF + Zod + MSW + FSD + Zustand + Astryx + Tailwind. Деплой: Docker + GitHub Pages.

## Notes

- **Chosen stack:** Zustand (UI-state), Vitest (unit), Playwright (e2e), Tailwind (через Astryx bridge)
- **Domain:** грузовые аукционы (freight/cargo auctions)
- **Strict mode:** Pure wayfinder — каждый тикет решает вопрос/принимает решение. Исполнение — отдельно.
- **Tracker:** локальный Markdown. Тикеты в `wayfinder/tickets/*.md`. Блокировка через frontmatter `blocked_by: [file]`.
- **Labels:** wayfinder:research, wayfinder:prototype, wayfinder:grilling, wayfinder:task

## Decisions so far

- [Выбор компонентов Astryx для UI](wayfinder/assets/astryx-component-map.md) — полный маппинг 40+ компонентов на UI-элементы приложения. Схема: AppShell → Layout, Table для списка, TabList для детальная/ставки, Dialog для формы ставки, useToast для уведомлений, Typeahead для городов, NumberInput для цены. Tailwind bridge через `@astryxdesign/core/tailwind-theme.css`.

## Not yet specified

- **Точное поведение prefetch** — когда и как запрашивать детальную страницу при ховере; нужно ли отменять prefetch при уходе курсора.
- **Словарь городов для моков** — набор городов для `load_city` / `unload_city`
- **Обработка конфликта ставок** — что если два пользователя одновременно ставят на один аукцион (MSW-симуляция race condition)?
- **Enum значений** — полный список статусов, типов аукциона, торговых статусов пользователя
- **Анимации/переходы** — нужны ли микро-анимации (список→детальная, загрузка ставок)?

## Out of scope

<!-- пусто -->
