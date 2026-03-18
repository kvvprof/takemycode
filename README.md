# takemycode

Тестовое fullstack-приложение на монорепе:

- `apps/api` — Express API с in-memory хранением выбора и сортировки.
- `apps/web` — React/Vite клиент с двумя окнами, фильтрацией, infinite scroll и DnD.
- `packages/contract` — общий контракт (zod-схемы, константы, типы).
- `packages/eslint-config` — общий ESLint конфиг.

## Что реализовано

1. Список из `1..1_000_000` ID.
2. Два контейнера:
   - левый: все элементы, кроме выбранных;
   - правый: выбранные элементы.
3. Фильтрация по ID в обоих контейнерах.
4. Infinite scroll в обоих контейнерах (`20` элементов на страницу).
5. Добавление новых ID вручную.
6. Drag&Drop сортировка выбранных элементов, включая работу при фильтре.
7. Сохранение выбора и сортировки между обновлениями страницы (на сервере в памяти).
8. Очереди с дедупликацией:
   - батч добавления: каждые `10` секунд;
   - батч чтения/изменений: каждую `1` секунду.

## Запуск локально

```bash
pnpm install
pnpm check-types
pnpm lint
pnpm build
pnpm dev
```

После запуска:

- API: `http://localhost:3200`
- Web: `http://localhost:3300`

## Если `pnpm dev` не поднимается

Проверь, что порты не заняты другими процессами:

```bash
lsof -nP -iTCP:3200 -sTCP:LISTEN
lsof -nP -iTCP:3300 -sTCP:LISTEN
```

Если заняты, останови процессы вручную и запусти снова:

```bash
kill <PID>
pnpm dev
```

## Важные API маршруты

- `GET /api/items/available?filter=&offset=0&limit=20`
- `GET /api/items/selected?filter=&offset=0&limit=20`
- `POST /api/items/add` body: `{ "id": number }`
- `POST /api/items/select` body: `{ "id": number }`
- `POST /api/items/unselect` body: `{ "id": number }`
- `POST /api/items/reorder-visible` body: `{ "visibleOrderedIds": number[] }`

## Поведение очередей

- Все add-запросы проходят через очередь с дедупом по ключу `add:{id}`.
- Все get/select/unselect/reorder проходят через очередь с дедупом по payload.
- Повторное добавление того же значения не дублирует элемент в хранилище.

## Деплой на Railway (когда понадобится)

1. Подключить репозиторий в Railway.
2. Создать сервис API:
   - Root Directory: `apps/api`
   - Build: `pnpm --filter @packages/contract build && pnpm --filter api build`
   - Start: `pnpm --filter api start`
3. Создать сервис Web:
   - Root Directory: `apps/web`
   - Build: `pnpm --filter @packages/contract build && pnpm --filter web build`
   - Start: `pnpm --filter web start`
4. В web-сервисе настроить прокси/API URL на публичный URL API.
