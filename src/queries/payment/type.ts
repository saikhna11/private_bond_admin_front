import z from 'zod';
import { ContractStatusSchema } from '@/queries/contract/type';

/** The tabs of the payments to look at. */
export const PaymentTabSchema = z.enum(['unknown', 'short', 'refund']);
export type PaymentTab = z.infer<typeof PaymentTabSchema>;

export const paymentTabLabel: Record<PaymentTab, string> = {
  unknown: 'Танигдаагүй',
  short: 'Дутуу',
  refund: 'Буцаах',
};

/** A statement credit no order's reference matched and no admin decided on. */
export const UnknownCreditSchema = z.object({
  id: z.guid(),
  account_number: z.string(),
  currency: z.string(),
  tran_date: z.string(),
  tran_time: z.string().optional(),
  amount: z.string(),
  description: z.string(),
  related_account: z.string().optional(),
  created_at: z.string(),
});
export type UnknownCreditType = z.infer<typeof UnknownCreditSchema>;

/** An order paid short, or a contract with money in currency to give back. */
export const PaymentContractSchema = z.object({
  contract_id: z.guid(),
  contract_no: z.string().optional(),
  payment_reference: z.string(),
  status: ContractStatusSchema,
  bond_code: z.string(),
  amount: z.string(),
  payment_deadline: z.string(),
  currency: z.string(),
  received: z.string(),
  kept: z.string(),
  refunded: z.string(),
  refundable: z.string(),
  holder_id: z.guid(),
  holder_last_name: z.string(),
  holder_first_name: z.string(),
});
export type PaymentContractType = z.infer<typeof PaymentContractSchema>;

export const PaymentCountsSchema = z.object({
  unknown: z.number(),
  short: z.number(),
  refund: z.number(),
});
export type PaymentCountsType = z.infer<typeof PaymentCountsSchema>;

export const LinkResultSchema = z.object({
  status: z.enum(['short_paid', 'matched', 'over_paid', 'unmatched']),
});

export const linkResultLabel: Record<
  z.infer<typeof LinkResultSchema>['status'],
  string
> = {
  matched: 'Гэрээ төлөгдлөө.',
  over_paid: 'Гэрээ төлөгдлөө. Илүү дүнг Буцаах табаас буцаана уу.',
  short_paid: 'Орлого бүртгэгдлээ. Гэрээ үлдсэн төлбөрөө хүлээж байна.',
  unmatched: 'Гэрээ төлбөр хүлээгээгүй тул орлогыг Буцаах таб руу шилжүүллээ.',
};
