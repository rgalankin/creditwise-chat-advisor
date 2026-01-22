/**
 * ChatApi - Service client for n8n integration
 * 
 * Абстракция над API для общения с n8n через Edge Function.
 * Все вызовы проксируются через Blink Edge Function для безопасности.
 * 
 * При миграции на прод достаточно изменить только этот файл.
 */

import { blink } from './blink';

// =============================================================================
// TYPES - API Contract (согласовать с командой n8n)
// =============================================================================

/** Типы действий в чате */
export type ChatActionType = 
  | 'start_session'      // Начать новую сессию
  | 'consent_given'      // Пользователь дал согласие
  | 'consent_declined'   // Пользователь отказал
  | 'jurisdiction_set'   // Установлена юрисдикция
  | 'diagnostic_answer'  // Ответ на вопрос диагностики
  | 'scenario_select'    // Выбор сценария
  | 'scenario_step'      // Шаг сценария
  | 'free_chat';         // Свободный чат

/** UI компоненты для отображения */
export type UIComponentType = 
  | 'text'               // Простой текст
  | 'options'            // Кнопки выбора
  | 'input'              // Поле ввода
  | 'progress'           // Прогресс-бар
  | 'summary'            // Итоговая карточка
  | 'scenario_card'      // Карточка сценария
  | 'document_upload';   // Загрузка документа

/** Состояние FSM в n8n */
export type ChatState = 
  | 'INTRO' 
  | 'CONSENT' 
  | 'JURISDICTION' 
  | 'DIAGNOSTIC_1' | 'DIAGNOSTIC_2' | 'DIAGNOSTIC_3' 
  | 'DIAGNOSTIC_4' | 'DIAGNOSTIC_5' | 'DIAGNOSTIC_6' | 'DIAGNOSTIC_7'
  | 'SUMMARY' 
  | 'SCENARIOS' 
  | 'SCENARIO_RUN' 
  | 'CHAT';

// =============================================================================
// REQUEST TYPES
// =============================================================================

/** Запрос POST /chat/message */
export interface ChatMessageRequest {
  sessionId: string;
  content: string;
  language: 'ru' | 'en';
  /** Опциональные вложения (для будущего OCR) */
  attachments?: {
    type: 'image' | 'document';
    url: string;
    name: string;
  }[];
}

/** Запрос POST /chat/action */
export interface ChatActionRequest {
  sessionId: string;
  action: ChatActionType;
  language: 'ru' | 'en';
  /** Данные действия (зависят от типа) */
  payload?: {
    /** Для jurisdiction_set */
    jurisdiction?: string;
    /** Для diagnostic_answer */
    questionId?: number;
    answer?: string;
    /** Для scenario_select */
    scenarioId?: string;
    /** Для scenario_step */
    stepId?: string;
    stepData?: Record<string, any>;
    /** Произвольные данные */
    [key: string]: any;
  };
}

// =============================================================================
// RESPONSE TYPES
// =============================================================================

/** UI элемент в ответе */
export interface UIComponent {
  type: UIComponentType;
  /** Текстовое содержимое */
  text?: string;
  /** Опции для выбора */
  options?: string[];
  /** Прогресс (0-100) */
  progress?: number;
  /** Данные для карточки */
  data?: Record<string, any>;
}

/** Ответ от n8n */
export interface ChatResponse {
  /** Текст ответа ассистента */
  text: string;
  /** Текущее состояние FSM */
  state: ChatState;
  /** ID сессии */
  sessionId: string;
  /** UI компоненты для отображения */
  ui?: UIComponent[];
  /** Метаданные для фронтенда */
  meta?: {
    /** Данные диагностики (для восстановления состояния) */
    diagnosticData?: Record<string, any>;
    /** Данные профиля */
    profileData?: Record<string, any>;
    /** Событие для аналитики */
    event?: {
      type: string;
      data?: Record<string, any>;
    };
  };
  /** Флаг стриминга (для будущего) */
  streaming?: boolean;
}

/** Ответ при ошибке */
export interface ChatErrorResponse {
  error: string;
  code?: string;
  details?: Record<string, any>;
}

// =============================================================================
// API CLIENT
// =============================================================================

/** Конфигурация ChatApi */
interface ChatApiConfig {
  /** Таймаут запросов (мс) */
  timeout?: number;
  /** Режим отладки */
  debug?: boolean;
}

class ChatApiClient {
  private config: ChatApiConfig;
  private functionName = 'chat-proxy';

  constructor(config: ChatApiConfig = {}) {
    this.config = {
      timeout: 30000,
      debug: import.meta.env.DEV,
      ...config
    };
  }

  /**
   * Отправить сообщение в чат
   */
  async sendMessage(request: ChatMessageRequest): Promise<ChatResponse> {
    return this.invoke<ChatResponse>('message', request);
  }

  /**
   * Выполнить действие (кнопка, шаг мастера и т.д.)
   */
  async sendAction(request: ChatActionRequest): Promise<ChatResponse> {
    return this.invoke<ChatResponse>('action', request);
  }

  /**
   * Начать новую сессию
   */
  async startSession(language: 'ru' | 'en'): Promise<ChatResponse> {
    return this.invoke<ChatResponse>('start', { language });
  }

  /**
   * Получить состояние сессии (для восстановления)
   */
  async getSession(sessionId: string): Promise<ChatResponse | null> {
    try {
      return await this.invoke<ChatResponse>('session', { sessionId });
    } catch {
      return null;
    }
  }

  /**
   * Внутренний метод вызова Edge Function
   */
  private async invoke<T>(endpoint: string, data: Record<string, any>): Promise<T> {
    if (this.config.debug) {
      console.log(`[ChatApi] ${endpoint}:`, data);
    }

    try {
      // Вызов через Blink SDK (автоматически добавляет auth)
      const response = await blink.functions.invoke(this.functionName, {
        body: {
          endpoint,
          ...data
        }
      });

      if (this.config.debug) {
        console.log(`[ChatApi] Response:`, response);
      }

      // Проверка на ошибку
      if (response.error) {
        throw new ChatApiError(
          response.error,
          response.code || 'UNKNOWN_ERROR',
          response.details
        );
      }

      return response as T;
    } catch (error) {
      if (error instanceof ChatApiError) {
        throw error;
      }
      
      // Обработка сетевых ошибок
      const message = error instanceof Error ? error.message : 'Network error';
      throw new ChatApiError(message, 'NETWORK_ERROR');
    }
  }
}

/** Класс ошибки API */
export class ChatApiError extends Error {
  code: string;
  details?: Record<string, any>;

  constructor(message: string, code: string, details?: Record<string, any>) {
    super(message);
    this.name = 'ChatApiError';
    this.code = code;
    this.details = details;
  }
}

// =============================================================================
// EXPORT SINGLETON
// =============================================================================

export const chatApi = new ChatApiClient();

// =============================================================================
// FALLBACK MODE (для демо без n8n)
// =============================================================================

/**
 * Проверить доступность n8n
 */
export async function checkN8nAvailability(): Promise<boolean> {
  try {
    const response = await blink.functions.invoke('chat-proxy', {
      body: { endpoint: 'health' }
    });
    return response?.status === 'ok';
  } catch {
    return false;
  }
}

/**
 * Флаг режима работы: true = n8n, false = локальная логика
 */
export let isN8nMode = false;

/**
 * Инициализировать режим работы
 */
export async function initChatMode(): Promise<void> {
  isN8nMode = await checkN8nAvailability();
  console.log(`[ChatApi] Mode: ${isN8nMode ? 'n8n' : 'local'}`);
}
