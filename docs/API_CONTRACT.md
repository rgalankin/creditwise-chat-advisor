# CreditWise Chat API Contract

Контракт взаимодействия между фронтендом и n8n через Edge Function `chat-proxy`.

## Architecture

```
Frontend (useChat) 
    ↓ blink.functions.invoke('chat-proxy', {...})
Edge Function (chat-proxy.ts)
    ↓ fetch(N8N_WEBHOOK_URL/endpoint)
n8n Workflow
```

## Endpoints

### `health` - Проверка доступности

**Auth**: Не требуется

**Request**:
```json
{ "endpoint": "health" }
```

**Response**:
```json
{
  "status": "ok",
  "mode": "n8n" | "fallback",
  "timestamp": "2024-01-22T12:00:00Z"
}
```

---

### `start` - Начать новую сессию

**Request**:
```json
{
  "endpoint": "start",
  "language": "ru" | "en"
}
```

**Response**: `ChatResponse`

---

### `message` - Отправить сообщение

**Request**:
```json
{
  "endpoint": "message",
  "sessionId": "string",
  "content": "string",
  "language": "ru" | "en",
  "attachments": [
    { "type": "image" | "document", "url": "string", "name": "string" }
  ]
}
```

**Response**: `ChatResponse`

---

### `action` - Выполнить действие

Используется для кнопок и структурированных ответов.

**Request**:
```json
{
  "endpoint": "action",
  "sessionId": "string",
  "action": "ChatActionType",
  "language": "ru" | "en",
  "payload": {
    "jurisdiction": "string",
    "questionId": 1,
    "answer": "string",
    "scenarioId": "string"
  }
}
```

**Actions** (`ChatActionType`):
- `start_session` - Начать сессию
- `consent_given` - Согласие дано
- `consent_declined` - Согласие отклонено
- `jurisdiction_set` - Юрисдикция установлена
- `diagnostic_answer` - Ответ диагностики
- `scenario_select` - Выбор сценария
- `scenario_step` - Шаг сценария
- `free_chat` - Свободный чат

**Response**: `ChatResponse`

---

### `session` - Получить состояние сессии

**Request**:
```json
{
  "endpoint": "session",
  "sessionId": "string"
}
```

**Response**: `ChatResponse`

---

## Response Types

### ChatResponse

```typescript
interface ChatResponse {
  text: string;           // Текст ответа
  state: ChatState;       // Состояние FSM
  sessionId: string;      // ID сессии
  ui?: UIComponent[];     // UI компоненты
  meta?: {
    diagnosticData?: Record<string, any>;  // Данные диагностики
    profileData?: Record<string, any>;     // Данные профиля
    event?: { type: string; data?: any };  // Событие для аналитики
  };
  streaming?: boolean;    // Флаг стриминга (future)
}
```

### ChatState (FSM)

```typescript
type ChatState = 
  | 'INTRO'          // Приветствие
  | 'CONSENT'        // Согласие на обработку данных
  | 'JURISDICTION'   // Выбор юрисдикции
  | 'DIAGNOSTIC_1'   // Вопрос диагностики 1
  | 'DIAGNOSTIC_2'   // Вопрос диагностики 2
  | 'DIAGNOSTIC_3'   // Вопрос диагностики 3
  | 'DIAGNOSTIC_4'   // Вопрос диагностики 4
  | 'DIAGNOSTIC_5'   // Вопрос диагностики 5
  | 'DIAGNOSTIC_6'   // Вопрос диагностики 6
  | 'DIAGNOSTIC_7'   // Вопрос диагностики 7
  | 'SUMMARY'        // Итог диагностики
  | 'SCENARIOS'      // Выбор сценариев
  | 'SCENARIO_RUN'   // Выполнение сценария
  | 'CHAT';          // Свободный чат
```

### UIComponent

```typescript
interface UIComponent {
  type: 'text' | 'options' | 'input' | 'progress' | 'summary' | 'scenario_card' | 'document_upload';
  text?: string;
  options?: string[];
  progress?: number;
  data?: Record<string, any>;
}
```

---

## Error Response

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

**Error Codes**:
- `MISSING_ENDPOINT` - Не указан endpoint
- `INVALID_REQUEST` - Неверный запрос
- `UNAUTHORIZED` - Не авторизован
- `CONFIG_ERROR` - Ошибка конфигурации сервера
- `INTERNAL_ERROR` - Внутренняя ошибка
- `NETWORK_ERROR` - Сетевая ошибка (клиент)

---

## n8n Headers

При вызове n8n, Edge Function добавляет:

```
Content-Type: application/json
X-Webhook-Secret: {N8N_WEBHOOK_SECRET}
X-User-Id: {userId from JWT}
```

---

## Environment Variables

**Edge Function**:
- `BLINK_PROJECT_ID` - Auto-injected
- `BLINK_SECRET_KEY` - Auto-injected
- `N8N_WEBHOOK_URL` - URL вебхука n8n (опционально)
- `N8N_WEBHOOK_SECRET` - Секрет для аутентификации (опционально)

**Fallback Mode**: Если `N8N_WEBHOOK_URL` не установлен, функция возвращает `fallback_mode` и логика обрабатывается локально в `useChat`.

---

## Client Usage

```typescript
import { chatApi } from '@/lib/chatApi';

// Отправить сообщение
const response = await chatApi.sendMessage({
  sessionId: 'xxx',
  content: 'Привет',
  language: 'ru'
});

// Выполнить действие
const response = await chatApi.sendAction({
  sessionId: 'xxx',
  action: 'consent_given',
  language: 'ru'
});

// Проверить режим
import { initChatMode, isN8nMode } from '@/lib/chatApi';
await initChatMode();
console.log(isN8nMode); // true | false
```

---

## Flow Examples

### 1. Начало сессии

```
Client → sendAction({ action: 'start_session' })
n8n → { text: "Привет...", state: "INTRO" }
Client → отображает INTRO
```

### 2. Согласие

```
Client → sendAction({ action: 'consent_given' })
n8n → { text: "Выберите страну...", state: "JURISDICTION" }
```

### 3. Диагностика

```
Client → sendAction({ action: 'diagnostic_answer', payload: { questionId: 1, answer: "Получить кредит" }})
n8n → { text: "Вопрос 2...", state: "DIAGNOSTIC_2", meta: { diagnosticData: {...} }}
```

### 4. Свободный чат

```
Client → sendMessage({ content: "Как улучшить кредитный рейтинг?" })
n8n → { text: "Рекомендации...", state: "CHAT" }
```
