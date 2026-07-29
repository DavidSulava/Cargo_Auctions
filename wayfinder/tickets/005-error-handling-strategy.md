---
id: 005
title: Стратегия обработки ошибок и тостов
type: grilling
status: closed
assignee: ""
labels: wayfinder:grilling
blocked_by: []
---

## Question

Как обрабатывать ошибки API и показывать уведомления пользователю?

Рассмотреть:
1. **Глобально:** TanStack Query `onError` — показывать toast на любую ошибку?
2. **Локально:** per-component error state (например, ошибка загрузки списка — показывать inline error state вместо глобального тоста)
3. **Форма ставки (422):** как парсить validation error из MSW и отображать field-level ошибки через React Hook Form
4. **Тосты:** использовать Astryx Toast или кастомные на Zustand?
5. **404 на детальной странице:** как отображать (error boundary? redirect?)
6. **Сетевые ошибки (MSW off):** graceful degradation — показывать fallback

**Output:** стратегия — какие ошибки куда маппятся.
