import type { D1Database } from '@cloudflare/workers-types';

export const DB: D1Database = global.DB as D1Database; 