# Astryx Component Mapping for Cargo Auctions SPA

**Package:** `@astryxdesign/core` v0.1.9  
**Import pattern:** `import {Component} from '@astryxdesign/core/ComponentName'`  
**Theme:** `@astryxdesign/theme-neutral`  
**Styling bridge:** Tailwind v4 via `@astryxdesign/core/tailwind-theme.css`

---

## 1. Установка и CSS-сетап (Vite + Tailwind)

```bash
npm install @astryxdesign/core @astryxdesign/theme-neutral
npm install -D @astryxdesign/cli tailwindcss @tailwindcss/vite
```

**Файл: `src/index.css`** (порядок слоёв важен — от least-specific к most-specific):

```css
@layer reset, theme, base, astryx-base, astryx-theme, components, utilities;

@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/preflight.css" layer(base);
@import "@astryxdesign/core/reset.css";
@import "@astryxdesign/core/astryx.css";
@import "@astryxdesign/theme-neutral/theme.css";
@import "@astryxdesign/core/tailwind-theme.css";
@import "tailwindcss/utilities.css" layer(utilities);
```

**Vite config (`vite.config.ts`):**
```ts
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

После этого работают Tailwind-утилиты, привязанные к системным токенам: `text-primary`, `bg-surface`, `border-border`, `rounded-lg`, `shadow-md` и т.д.

---

## 2. Маппинг компонентов

### 2.1 Layout & Navigation

| UI-элемент                     | Astryx компонент          | Примечание                                                                 |
|--------------------------------|---------------------------|----------------------------------------------------------------------------|
| **Глобальный лэйаут**          | `AppShell`                | Слоты: topNav, sideNav, banner, content. Автоматический responsive.        |
| **Верхняя навигация**          | `TopNav`                  | Логотип "Грузовые аукционы", до 5 пунктов.                                 |
| **Боковая навигация**          | `SideNav`                 | Секции, вложенные пункты, бейджи. collapsible для адаптива.                |
| **Контент страницы**           | `Layout`                  | header/content/footer слоты. contentWidth для форм.                         |
| **Табы (детальная / ставки)**  | `TabList`                 | hasDivider, с бейджами через endContent.                                   |
| **Пагинация**                  | `Pagination`              | variants: pages, count, dots. totalItems, page size selector.              |
| **Хлебные крошки**             | `Breadcrumbs`             | Для навигации список → детальная.                                          |
| **Секции контента**            | `Section`                 | Группировка блоков на детальной странице.                                  |

### 2.2 Data Display

| UI-элемент                     | Astryx компонент          | Примечание                                                                 |
|--------------------------------|---------------------------|----------------------------------------------------------------------------|
| **Список аукционов**           | `Table`                   | Сортировка, popover/inline фильтры, rich cells (Badge, Link). pagination.  |
| **Статус аукциона**            | `Badge`                   | Variants: info/success/warning/error/neutral для разных статусов.          |
| **Торговый статус пользователя**| `Badge`                   | Color variants (blue=Leading, green=Winner, orange=Losing).               |
| **Тип аукциона**               | `Badge`                   | Color variants (purple=Request, teal=Up, pink=Down, neutral=FixPrice).    |
| **Ключ-значение**              | `MetadataList`            | Детальная информация об аукционе (маршрут, груз, цены).                   |
| **Список ставок**              | `Table` или `OverflowList`| Таблица ставок с rich cell content.                                       |
| **Плейсхолдер загрузки**       | `Skeleton`                | Card / Table / Staggered variants. `index` prop для волны.                |
| **Спиннер**                    | `Spinner`                 | Для кнопок и областей неизвестного размера.                               |
| **Empty state**                | `EmptyState`              | Title + action button. compact variant для сайдбаров.                     |
| **Аватар перевозчика**         | `Avatar`                  | С инициалами / иконкой для списка ставок.                                 |
| **Группа аватаров**            | `AvatarGroup`             | Если несколько перевозчиков.                                              |
| **Статус-точка**               | `StatusDot`               | Для индикации online/offline статуса.                                     |
| **Значение в токене**          | `Token`                   | Для тегов/меток (например, кузов).                                        |

### 2.3 Forms & Inputs

| UI-элемент                     | Astryx компонент          | Примечание                                                                 |
|--------------------------------|---------------------------|----------------------------------------------------------------------------|
| **Текстовый ввод**             | `TextInput`               | cargo_num, поиск. validation status, clearable, sizes.                     |
| **Числовой ввод (цена)**       | `NumberInput`             | min/max/step! Идеально для формы ставки. unit suffix (₽).                 |
| **Выпадающий список**          | `Selector`                | status, auc_type. validation, grouped sections.                           |
| **Поисковый ввод (город)**     | `Typeahead`               | load_city / unload_city — асинхронный поиск по словарю.                   |
| **Выбор даты**                 | `DateInput`               | load_date_from/to. min/max constraints, clearable.                        |
| **Выбор диапазона дат**        | `DateRangeInput`          | load_date range. presets ("Завтра", "Эта неделя"), validation.            |
| **Чекбокс**                    | `CheckboxInput`           | is_available, is_bidder. indeterminate для групповых.                     |
| **Тогл**                       | `Switch`                  | Для is_available, если нужен мгновенный тогл.                            |
| **Текстовое поле**             | `TextArea`                | Комментарий к ставке (если будет).                                        |
| **Раскладка формы**            | `FormLayout`              | Вертикальная/горизонтальная. Nested для City+State.                       |
| **Обёртка для кастомных полей**| `Field`                   | Если нужно обернуть native input с label/description/validation.          |

### 2.4 Overlay & Feedback

| UI-элемент                     | Astryx компонент          | Примечание                                                                 |
|--------------------------------|---------------------------|----------------------------------------------------------------------------|
| **Модалка ставки**             | `Dialog`                  | purpose="form" для предотвращения закрытия по backdrop. Fullscreen для сложной формы. |
| **Toast (уведомления)**         | `Toast` + `useToast()`     | success/error types. auto-dismiss 5s info, persistent error.               |
| **Хинт по шагу ставки**        | `Tooltip`                 | Подсказка "Шаг ставки: 500₽, доступная цена: 15000₽".                    |
| **Prefetch preview**           | `HoverCard`               | При ховере на элемент списка — показать превью деталей.                    |
| **Баннер ошибки**              | `Banner`                  | Persistent error (сетевая ошибка, 500). collapsible. dismissable.         |
| **Прогресс**                   | `ProgressBar`             | Если будет индикация таймера аукциона.                                    |

### 2.5 Action

| UI-элемент                     | Astryx компонент          | Примечание                                                                 |
|--------------------------------|---------------------------|----------------------------------------------------------------------------|
| **Кнопки действий**            | `Button`                  | primary (сделать ставку), secondary (отмена), ghost (редактировать).       |
| **Группа кнопок**              | `ButtonGroup`             | Для grouped actions на карточке.                                          |
| **Акшн-меню**                  | `DropdownMenu`            | Для дополнительных действий.                                              |
| **Иконка-кнопка**              | `IconButton`              | Для тулбара / действий.                                                   |
| **Ссылка**                     | `Link`                    | Для навигации между страницами.                                           |
| **Чип-меню (3 точки)**         | `MoreMenu`                | Для overflow-действий в таблице.                                          |

---

## 3. Tailwind-токены (через Astryx bridge)

После настройки bridge работают классы:

```tsx
// Семантические цвета
text-primary    // основной текст
text-secondary  // второстепенный текст
bg-surface      // фон карточек
bg-body         // фон страницы
border-border   // цвет границ

// Accent
bg-accent       // акцентный фон
text-accent     // акцентный текст

// Status
text-success    // зелёный (success)
text-warning    // жёлтый (warning)
text-error      // красный (error)
text-info       // синий (info)

// Spacing
p-4             // var(--spacing-4)
gap-4           // var(--spacing-4)

// Border radius
rounded-lg      // var(--radius-container)
rounded-md      // var(--radius-element)

// Shadow
shadow-md       // system elevation
```

---

## 4. Ключевые API

### Toast (useToast hook)
```tsx
import { useToast } from '@astryxdesign/core/Toast'

const { toast } = useToast()

// Success — auto-dismiss 5s
toast.info('Ставка принята')
toast.error('Ошибка: минимальная ставка 5000₽')

// С действием
toast.info('Ставка изменена', { action: { label: 'Отменить', onClick: handleUndo } })
```

Тост-контейнер (`ToastViewport`) нужно добавить один раз в корне приложения:
```tsx
import { ToastViewport } from '@astryxdesign/core/Toast'

function AppLayout() {
  return (
    <AppShell>
      <AppShell.Content>
        <Outlet />
      </AppShell.Content>
      <ToastViewport />
    </AppShell>
  )
}
```

### Dialog с useImperativeDialog
```tsx
import { useImperativeDialog } from '@astryxdesign/core/Dialog'

const dialog = useImperativeDialog()

const handlePlaceBet = () => {
  dialog.show(<BetFormDialog onClose={() => dialog.hide()} />)
}
```

### Table с сортировкой и пагинацией
```tsx
import { Table } from '@astryxdesign/core/Table'
import { Pagination } from '@astryxdesign/core/Pagination'
import { Badge } from '@astryxdesign/core/Badge'

// Table плагины: sortable, filter (inline / popover), pagination
```

### Табы для detail / bets
```tsx
import { TabList } from '@astryxdesign/core/TabList'

<TabList
  tabs={[
    { id: 'detail', label: 'Детали' },
    { id: 'bets', label: 'Ставки', endContent: <Badge>{betCount}</Badge> },
  ]}
  selectedId={activeTab}
  onTabChange={setActiveTab}
  hasDivider
/>
```

---

## 5. Рекомендации по выбору

| UI Pattern                    | Рекомендованный компонент                     | Альтернатива                     |
|-------------------------------|-----------------------------------------------|----------------------------------|
| Форма ставки (модалка)        | `Dialog purpose="form"`                      | Отдельный маршрут               |
| Фильтр городов                | `Typeahead` с async source                    | `Selector` (если городов < 20)  |
| Фильтр цены (от/до)           | Два `NumberInput`                             | `Slider` (если не нужна точность)|
| Статусы на карточке           | `Badge` (color для типа, status для статуса)  | Статус через StatusDot + текст  |
| Список аукционов              | `Table` (с плагинами сортировки)             | Кастомные карточки (Card + Grid)|
| Список ставок                 | `Table` без сортировки                        | `MetadataList`                  |
| Toast (успех/ошибка)          | `useToast()` hook                             | Zustand store + свой Toast      |
| Подтверждение действия        | `Dialog purpose="info"`                       | inline Banner                   |
| Prefetch по ховеру            | `HoverCard` с data-fetching                  | Tooltip с краткой инфой         |
| Адаптив для мобильных         | `AppShell` responsive + `SideNav collapsible`  | Bottom nav (кастом)             |
| Skelton загрузки              | `Skeleton` card/table/staggered              | `Spinner`                       |
