import z from 'zod';

/** GET /me on the broker API. */
export const BrokerMeSchema = z.object({
  id: z.string(),
  email: z.string(),
  phone: z.string(),
  last_name: z.string(),
  first_name: z.string(),
  position: z.string().optional(),
});

export type BrokerMeType = z.infer<typeof BrokerMeSchema>;
