import { z } from 'zod';
import { insertUserSchema, users } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  users: {
    get: {
      method: 'GET' as const,
      path: '/api/users/:tgId',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/users',
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    }
  },
  stats: {
    get: {
      method: 'GET' as const,
      path: '/api/stats',
      responses: {
        200: z.object({
          totalUsers: z.number(),
          activeWatches: z.number(),
          totalReports: z.number(),
          checksToday: z.number(),
          threatsBlocked: z.number(),
          uptime: z.number(),
        }),
      },
    }
  },
  activity: {
    get: {
      method: 'GET' as const,
      path: '/api/activity',
      responses: {
        200: z.array(z.object({
          type: z.string(),
          target: z.string(),
          riskLevel: z.string(),
          timestamp: z.string(),
        })),
      },
    }
  },
  leaderboard: {
    get: {
      method: 'GET' as const,
      path: '/api/leaderboard',
      responses: {
        200: z.array(z.object({
          username: z.string(),
          checks: z.number(),
          streakDays: z.number(),
        })),
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
