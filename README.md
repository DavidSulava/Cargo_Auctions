# Cargo Auctions

SPA для грузовых аукционов. React 19 + TypeScript + TanStack Router/Query + RHF + Zod + MSW + Astryx + Tailwind v4 + Docker.

## Стек

| Категория | Библиотека |
|-----------|-----------|
| Ядро | React 19, TypeScript 6 |
| Сборка | Vite 8 |
| Маршрутизация | TanStack Router |
| Запросы | TanStack Query |
| Формы | React Hook Form + Zod |
| UI-kit | Astryx + Tailwind v4 (bridge) |
| Mock API | MSW |
| Тесты | Vitest, Playwright |

## Разработка

```bash
npm install
npm run dev        # dev-сервер на :3000
npm run build      # typecheck + production build
npm run test       # unit-тесты (vitest)
npm run test:e2e   # e2e-тесты (playwright)
npm run lint       # oxlint
```

## Docker

```bash
docker compose up    # nginx со статикой на :8080
```

## GitHub Pages

Настроен деплой на `https://<user>.github.io/Cargo_Auctions/`.

- Vite base path: `/Cargo_Auctions/`
- `public/404.html` — SPA fallback (редирект на index.html с правильным base path)

## Переменные окружения

| Переменная | По умолчанию | Описание |
|-----------|-------------|----------|
| `VITE_API_BASE` | `/api` | Префикс API-запросов |

## Архитектура (FSD)

```
src/
├── app/          # провайдеры, роутер, стили
├── entities/     # типы аукционов и ставок
├── pages/        # страницы (список, детальная, форма ставки)
├── shared/       # API-клиент, MSW, утилиты
└── widgets/      # переиспользуемые UI-блоки (фильтры, таблица, модалка)
```
