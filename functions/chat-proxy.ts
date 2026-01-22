/**
 * Edge Function: chat-proxy
 * 
 * Безопасный прокси для n8n webhook.
 * Скрывает URL и секреты n8n от клиента.
 * 
 * Endpoints:
 * - health: проверка доступности
 * - start: начать новую сессию
 * - message: отправить сообщение
 * - action: выполнить действие
 * - session: получить состояние сессии
 */

import { createClient } from "npm:@blinkdotnew/sdk";

// =============================================================================
// CORS
// =============================================================================

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

function jsonResponse(data: Record<string, any>, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function errorResponse(error: string, code: string, status = 400): Response {
  return jsonResponse({ error, code }, status);
}

// =============================================================================
// N8N CLIENT
// =============================================================================

interface N8nConfig {
  webhookUrl: string;
  secretKey: string;
}

async function callN8n(
  config: N8nConfig,
  endpoint: string,
  data: Record<string, any>,
  userId: string
): Promise<any> {
  const url = `${config.webhookUrl}/${endpoint}`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Webhook-Secret": config.secretKey,
      "X-User-Id": userId,
    },
    body: JSON.stringify({
      ...data,
      userId,
      timestamp: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`n8n error: ${response.status} - ${text}`);
  }

  return response.json();
}

// =============================================================================
// HANDLER
// =============================================================================

async function handler(req: Request): Promise<Response> {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Only POST and GET
  if (req.method !== "POST" && req.method !== "GET") {
    return errorResponse("Method not allowed", "METHOD_NOT_ALLOWED", 405);
  }

  try {
    // Parse body safely
    let body = {};
    if (req.method === "POST") {
      try {
        body = await req.json();
      } catch {
        body = {};
      }
    }
    
    const { endpoint, ...data } = body as any;

    // Support endpoint in query for GET or missing body
    const url = new URL(req.url);
    const targetEndpoint = endpoint || url.searchParams.get("endpoint");

    if (!targetEndpoint && req.method === "POST") {
      return errorResponse("Missing endpoint", "MISSING_ENDPOINT");
    }

    // Init Blink client
    const projectId = Deno.env.get("BLINK_PROJECT_ID");
    const secretKey = Deno.env.get("BLINK_SECRET_KEY");

    if (!projectId || !secretKey) {
      console.error("[chat-proxy] Missing BLINK_PROJECT_ID or BLINK_SECRET_KEY");
      return errorResponse("Server misconfigured", "CONFIG_ERROR", 500);
    }

    const blink = createClient({ projectId, secretKey });

    // Allow health check without auth or with optional auth
    if (targetEndpoint === "health") {
      const n8nUrl = Deno.env.get("N8N_WEBHOOK_URL");
      return jsonResponse({
        status: "ok",
        mode: n8nUrl ? "n8n" : "fallback",
        timestamp: new Date().toISOString(),
        authRequired: false,
      });
    }

    // Handle guest sessions (no auth required) and authenticated users
    let userId: string;
    const authHeader = req.headers.get("Authorization");

    if (authHeader) {
      // Authenticated user
      const auth = await blink.auth.verifyToken(authHeader);
      if (!auth.valid) {
        return errorResponse("Unauthorized", "UNAUTHORIZED", 401);
      }
      userId = auth.userId!;
    } else {
      // Guest user - use a default guest user ID
      userId = 'guest_user';
    }

    // ==========================================================================
    // ROUTE ENDPOINTS
    // ==========================================================================

    // Get n8n config (optional - fallback mode if not set)
    const n8nUrl = Deno.env.get("N8N_WEBHOOK_URL");
    const n8nSecret = Deno.env.get("N8N_WEBHOOK_SECRET");

    // ==========================================================================
    // FALLBACK MODE (без n8n - для демо)
    // ==========================================================================

    if (!n8nUrl) {
      console.log(`[chat-proxy] Fallback mode for endpoint: ${targetEndpoint}`);
      
      // В fallback режиме возвращаем базовый ответ
      // Вся логика остаётся на фронте (в useChat)
      return jsonResponse({
        text: "",
        state: "INTRO",
        sessionId: data.sessionId || `fallback_${Date.now()}`,
        fallback: true,
        meta: {
          event: { type: "fallback_mode" }
        }
      });
    }

    // ==========================================================================
    // N8N MODE
    // ==========================================================================

    const n8nConfig: N8nConfig = {
      webhookUrl: n8nUrl,
      secretKey: n8nSecret || "",
    };

    // Route to n8n
    switch (targetEndpoint) {
      case "start": {
        // Начать новую сессию
        const result = await callN8n(n8nConfig, "start", {
          language: data.language || "ru",
        }, userId);
        
        // Логируем событие
        await logEvent(blink, userId, "chat_started", {
          sessionId: result.sessionId,
          language: data.language,
        });
        
        return jsonResponse(result);
      }

      case "message": {
        // Отправить сообщение
        if (!data.sessionId || !data.content) {
          return errorResponse("Missing sessionId or content", "INVALID_REQUEST");
        }
        
        const result = await callN8n(n8nConfig, "message", {
          sessionId: data.sessionId,
          content: data.content,
          language: data.language || "ru",
          attachments: data.attachments,
        }, userId);
        
        // Логируем AI вызов
        await logEvent(blink, userId, "ai_call", {
          sessionId: data.sessionId,
          state: result.state,
        });
        
        return jsonResponse(result);
      }

      case "action": {
        // Выполнить действие
        if (!data.sessionId || !data.action) {
          return errorResponse("Missing sessionId or action", "INVALID_REQUEST");
        }
        
        const result = await callN8n(n8nConfig, "action", {
          sessionId: data.sessionId,
          action: data.action,
          language: data.language || "ru",
          payload: data.payload,
        }, userId);
        
        // Логируем событие по типу действия
        const eventMap: Record<string, string> = {
          "consent_given": "consent_given",
          "jurisdiction_set": "jurisdiction_set",
          "diagnostic_answer": "diagnostic_step",
          "scenario_select": "scenario_started",
          "scenario_step": "scenario_step",
        };
        
        if (eventMap[data.action]) {
          await logEvent(blink, userId, eventMap[data.action], {
            sessionId: data.sessionId,
            action: data.action,
            payload: data.payload,
          });
        }
        
        // Специальные события
        if (result.state === "SUMMARY") {
          await logEvent(blink, userId, "diagnostic_completed", {
            sessionId: data.sessionId,
          });
        }
        
        return jsonResponse(result);
      }

      case "session": {
        // Получить состояние сессии
        if (!data.sessionId) {
          return errorResponse("Missing sessionId", "INVALID_REQUEST");
        }
        
        const result = await callN8n(n8nConfig, "session", {
          sessionId: data.sessionId,
        }, userId);
        
        return jsonResponse(result);
      }

      default:
        return errorResponse(`Unknown endpoint: ${targetEndpoint}`, "UNKNOWN_ENDPOINT");
    }

  } catch (error) {
    console.error("[chat-proxy] Error:", error);
    const message = error instanceof Error ? error.message : "Internal error";
    return errorResponse(message, "INTERNAL_ERROR", 500);
  }
}

// =============================================================================
// ANALYTICS HELPER
// =============================================================================

async function logEvent(
  blink: any,
  userId: string,
  eventType: string,
  eventData: Record<string, any>
): Promise<void> {
  try {
    // Можно использовать blink.analytics или просто логировать
    console.log(`[Event] ${eventType}:`, { userId, ...eventData });
    
    // В будущем: запись в таблицу events для воронки
    // await blink.db.events.create({
    //   userId,
    //   type: eventType,
    //   data: JSON.stringify(eventData),
    // });
  } catch (error) {
    console.error("[Event logging error]:", error);
  }
}

// =============================================================================
// START SERVER
// =============================================================================

Deno.serve(handler);