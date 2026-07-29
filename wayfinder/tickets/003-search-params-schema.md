---
id: 003
title: Схема валидации search params (фильтры)
type: prototype
status: closed
assignee: ""
labels: wayfinder:prototype
blocked_by: []
---

## Question

Как должна выглядеть Zod-схема для парсинга URL search params фильтров?

Минимальные фильтры из ТЗ:
- `cargo_num` (string)
- `status` (string — одиночный)
- `statuses` (string[] — множественный)
- `auc_type` (enum: Request, Up, Down, FixPrice)
- `load_city` (string — из словаря)
- `unload_city` (string — из словаря)
- `load_date_from` / `load_date_to` (ISO date)
- `is_available` (boolean)
- `is_bidder` (boolean)
- `price_from` / `price_to` (number)

**Вопросы для решения:**
1. Какие фильтры идут в URL, какие — в localStorage?
2. Что делать при невалидных значениях из URL? (throw → fallback default)
3. Pagination (page, perPage) — тоже в URL?
4. Как корректно сериализовать `statuses[]` в URL (comma-separated? multiple keys?)
5. Как TanStack Router интегрируется с валидацией search params (`route.validateSearch`)

**Output:** консолидированное решение — какая схема, fallback-значения, где что хранится.
