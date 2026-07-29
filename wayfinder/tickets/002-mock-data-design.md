---
id: 002
title: Проектирование мок-данных и MSW-handlers
type: research
status: closed
assignee: ""
labels: wayfinder:research
blocked_by: []
---

## Question

Как должны выглядеть мок-данные для MSW, чтобы покрыть все состояния из ТЗ?

Нужно спроектировать:

1. **DTO-типы** (TypeScript interfaces) для всех сущностей:
   - Auction (List/Detail)
   - Bet (ставка)
   - Filters (все фильтры из ТЗ)
   - API responses (успех, ошибки 422, 404)
   
2. **Enum-значения:**
   - `auc_type`: Request, Up, Down, FixPrice
   - `status`: статусы аукциона
   - `trading_status`: Leading, Losing, Winner, Participant, None
   
3. **Мок-словари:**
   - Города (load_city, unload_city)
   - Типы кузовов
   - Грузы
   
4. **Edge cases:**
   - hide_bets_history = true/false
   - can_set_bet = true/false
   - no_view_cargo_price = true/false
   - hide_points_address_and_contacts = true/false
   - Пустые списки
   - Пагинация (10+ элементов)

5. **Stateful MSW store:**
   - Хранение аукционов и ставок в памяти
   - Мутация после POST /auctions/{uuid}/bets (обновление цены, статуса)
   - race-condition не симулировать

**Output:** Markdown-файл `wayfinder/assets/mock-design.md` с типами и структурой данных.
