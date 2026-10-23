import z from 'zod';

export const SessionSchema = z.object({
  id: z.string(),
  method: z.enum(['password', 'otp']),
  ip: z.string().optional(),
  user_agent: z.string().optional(),
  created_at: z.string(),
  last_used_at: z.string().optional(),
  expires_at: z.string(),
  current: z.boolean(),
});

export const SessionsSchema = z.object({ sessions: z.array(SessionSchema) });

export type SessionType = z.infer<typeof SessionSchema>;
