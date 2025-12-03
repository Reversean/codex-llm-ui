# Codex LLM UI

Тестовое задание, описание которого можно найти здесь: https://codex.so/llm-ui

## Описание проекта

Веб-приложение для взаимодействия с LLM (Large Language Model) через удобный чат-интерфейс. Поддерживает потоковую передачу ответов в режиме реального времени, отображение процесса размышления модели и рендеринг Markdown.

## Быстрый старт

### 1. Установка зависимостей

```shell
npm install
```

### 2. Настройка переменных окружения

Скопируйте файл с примером конфигурации:

```shell
cp .env.example .env
```

Отредактируйте `.env` файл и укажите необходимые значения (см. раздел "Переменные окружения").

### 3. Запуск приложения

Запуск backend и frontend одновременно:

```shell
npm run dev
```

Только backend (порт 3000):

```shell
npm run dev:backend
```

Только frontend (порт 5173):

```shell
npm run dev:frontend
```

После запуска приложение будет доступно по адресу: http://localhost:5173

## Переменные окружения

Все переменные окружения настраиваются в файле `.env` в корне проекта:

| Переменная | Описание | Значение по умолчанию | Обязательная |
|------------|----------|----------------------|--------------|
| `PORT` | Порт для backend сервера | `3000` | Нет |
| `LLM_API_URL` | URL эндпоинта LLM сервиса (ai-proxy) | - | Да |
| `LLM_API_TOKEN` | Токен авторизации для LLM сервиса | - | Да |
| `CORS_ORIGINS` | Разрешенные origins для CORS (через запятую) | `http://localhost:5173,http://localhost:4173` | Нет |

### Пример конфигурации

```env
PORT=3000
LLM_API_URL=https://api.example.com/v1/chat
LLM_API_TOKEN=your-llm-api-token-here
CORS_ORIGINS=http://localhost:5173,http://localhost:4173
```

## Доступные команды

### Тестирование

Запуск всех тестов:

```shell
npm run test
```

Тесты backend:

```shell
npm run test:backend
```

Тесты frontend (not yet implemented):

```
¯\_(ツ)_/¯
```

## Архитектура проекта

Проект использует monorepo структуру с двумя основными workspace:

```
.
├── backend/          # Express.js сервер
├── frontend/         # Svelte приложение
├── shared/           # Общие типы TypeScript
├── .env              # Переменные окружения
└── package.json      # Корневой package.json с workspace
```

### Backend

Реализован на **Express.js**, выступает в роли прокси-сервера между UI и внешним LLM сервисом.

**Основные технологии:**
- TypeScript 5.9.3
- Express.js
- Node.js (>=20.0.0)

**Эндпоинты:**

- `GET /health` - health-check сервера
- `POST /chat/generate` - синхронный запрос к LLM (возвращает полный ответ)
- `POST /chat/stream` - потоковый запрос к LLM (SSE)

**Пример запроса (синхронный):**

```shell
curl -X POST http://localhost:3000/chat/generate \
  -H "Content-Type: application/json" \
  -d '{"message":"Привет, расскажи про TypeScript"}'
```

**Пример запроса (потоковый):**

```shell
curl -X POST http://localhost:3000/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"message":"Привет, расскажи про TypeScript"}' \
  --no-buffer
```

### Frontend

Реализован на **Svelte 5** с использованием SvelteKit.

**Основные технологии:**
- Svelte 5 (с новым синтаксисом runes)
- TypeScript 5.9.3
- Vite
- Markdown рендеринг (marked + highlight.js)

### Shared

Содержит общие TypeScript типы, используемые как на backend, так и на frontend.

## Что реализовано

### Backend

- [x] реализовать минимально рабочую версию
- [x] health-check
- [x] эндпоинт для синхронных запросов к LLM
- [x] эндпоинт для запросов на потоковую обработку ответов LLM
- [x] интеграционные тесты

### Frontend

- [x] реализовать базовую заготовку UI чата
- [x] реализовать возможность отправлять запросы LLM чеез backend API
- [x] форма для ведения диалога с LLM
- [x] парсинг и рендеринг Markdown
- [x] подсветка синтаксиса кода в Markdown
- [x] Потоковая обработка ответов через SSE
- [x] секция с размышлениями
- [x] стиль соответствует ~~более менее~~ Codex UI
- [ ] unit-тесты компонентов
- [ ] e2e-тесты
