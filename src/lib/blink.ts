import { createClient } from '@blinkdotnew/sdk';

/**
 * Blink SDK Client
 * - Managed Auth mode for user-scoped data
 * - Automatic camelCase to snake_case conversion for DB
 */
export const blink = createClient({
  projectId: import.meta.env.VITE_BLINK_PROJECT_ID,
  publishableKey: import.meta.env.VITE_BLINK_PUBLISHABLE_KEY,
  auth: { mode: 'managed' },
});
