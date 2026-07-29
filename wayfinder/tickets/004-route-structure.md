---
id: 004
title: Структура маршрутов TanStack Router
type: prototype
status: open
assignee: ""
labels: wayfinder:prototype
blocked_by: []
---

## Question

Как организовать дерево маршрутов?

Из ТЗ:
- Список аукционов ( `/` или `/auctions` )
- Детальная страница ( `/auctions/:uuid` )
- Ставки ( `/auctions/:uuid/bets` )
- Форма ставки ( `/auctions/:uuid/bets/new` или `/auctions/:uuid/bid` )

**Вопросы:**
1. `/` или `/auctions` как корень?
2. Ставки — вложенный маршрут внутри детальной страницы, отдельный layout, или табы на детальной странице?
3. Форма ставки — отдельный маршрут (открывается по ссылке из ТЗ) или модалка на детальной?
4. Нужен ли layout (sharable — футер, хедер)?
5. TanStack Router — file-based convention или конфиг в коде?

**Output:** дерево маршрутов с loaders и preloaders.
