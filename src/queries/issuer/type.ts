import z from 'zod';

export const IssuerMemberRoleSchema = z.enum(['director', 'staff']);
export type IssuerMemberRole = z.infer<typeof IssuerMemberRoleSchema>;

export const IssuerMemberSchema = z.object({
  id: z.string(),
  issuer_id: z.string(),
  email: z.string(),
  phone: z.string().optional().default(''),
  last_name: z.string(),
  first_name: z.string(),
  position: z.string().optional(),
  role: IssuerMemberRoleSchema,
  is_active: z.boolean(),
  created_at: z.string(),
});
export type IssuerMemberType = z.infer<typeof IssuerMemberSchema>;

export const CurrencySchema = z.enum(['MNT', 'USD']);
export type Currency = z.infer<typeof CurrencySchema>;

export const BankStatusSchema = z.enum([
  'unverified',
  'verified',
  'mismatch',
  'not_found',
]);
export type BankStatus = z.infer<typeof BankStatusSchema>;

export const IssuerBankAccountSchema = z.object({
  id: z.string(),
  currency: CurrencySchema,
  bank_name: z.string(),
  account_number: z.string(),
  iban: z.string(),
  account_name: z.string(),
  status: BankStatusSchema,
  /** The currency's default account. */
  is_default: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type IssuerBankAccountType = z.infer<typeof IssuerBankAccountSchema>;

export const IssuerSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  register_number: z.string(),
  state_register_number: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type IssuerSummaryType = z.infer<typeof IssuerSummarySchema>;

export const IssuerSchema = IssuerSummarySchema.extend({
  members: z.array(IssuerMemberSchema),
  bank_accounts: z
    .array(IssuerBankAccountSchema)
    .nullish()
    .transform((v) => v ?? []),
});
export type IssuerType = z.infer<typeof IssuerSchema>;

export interface IssuerFilters {
  page?: number;
  q?: string;
}

export interface IssuerMemberBody {
  email: string;
  phone?: string;
  last_name: string;
  first_name: string;
  position?: string;
  password: string;
}

/** IssuerBankAccountInput: an add or a replace of one account. */
export interface IssuerBankAccountBody {
  currency: Currency;
  bank_name: string;
  account_number: string;
  iban: string;
  account_name: string;
  /** On an add, makes it its currency's default; ignored on a replace. */
  is_default?: boolean;
}

export interface CreateIssuerBody {
  name: string;
  register_number: string;
  state_register_number: string;
  director: IssuerMemberBody;
  /** Any number per currency (at most 20); the first of each is its default. */
  bank_accounts?: IssuerBankAccountBody[];
}

export interface UpdateIssuerBody {
  name?: string;
  register_number?: string;
  state_register_number?: string;
}

export interface UpdateIssuerMemberBody {
  last_name?: string;
  first_name?: string;
  position?: string;
}

export const memberRoleLabel: Record<IssuerMemberRole, string> = {
  director: 'Захирал',
  staff: 'Ажилтан',
};

export const bankStatusLabel: Record<
  BankStatus,
  { label: string; className: string }
> = {
  unverified: {
    label: 'Баталгаажаагүй',
    className: 'bg-warning/15 text-warning-foreground dark:text-warning',
  },
  verified: { label: 'Баталгаажсан', className: 'bg-success/12 text-success' },
  mismatch: {
    label: 'Нэр таарахгүй',
    className: 'bg-destructive/10 text-destructive',
  },
  not_found: {
    label: 'Банкнаас олдсонгүй',
    className: 'bg-destructive/10 text-destructive',
  },
};
