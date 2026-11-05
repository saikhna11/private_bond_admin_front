import z from 'zod';

export const TemplateStatusSchema = z.enum(['draft', 'active', 'inactive']);
export type TemplateStatus = z.infer<typeof TemplateStatusSchema>;

export const templateStatusLabel: Record<TemplateStatus, string> = {
  draft: 'Ноорог',
  active: 'Идэвхтэй',
  inactive: 'Идэвхгүй',
};

export const LanguageSchema = z.enum(['mn', 'en']);
export type Language = z.infer<typeof LanguageSchema>;

export const languageLabel: Record<Language, string> = {
  mn: 'Монгол',
  en: 'Англи',
};

export const OwnershipTypeSchema = z.enum([
  'individual',
  'joint',
  'organization',
  'minor',
]);
export type OwnershipType = z.infer<typeof OwnershipTypeSchema>;

export const ownershipLabel: Record<OwnershipType, string> = {
  individual: 'Хувь хүн',
  joint: 'Хамтран',
  minor: 'Хүүхэд',
  organization: 'Байгууллага',
};

/** The ownership types in the order an admin picks them. */
export const ownershipOrder: OwnershipType[] = [
  'individual',
  'joint',
  'minor',
  'organization',
];

/**
 * A value of a contract a placeholder can be mapped to; a row one repeats the schedule's row.
 * A field one reads a field of the contract or of a party (source, field) in a format; a
 * custom one is an admin's, with the texts it prints. party is the party it is read from.
 */
export const ContractVariableSchema = z.object({
  key: z.string(),
  group: z.string(),
  label: z.string(),
  hint: z.string(),
  kind: z.enum(['system', 'field', 'custom']),
  builtin: z.boolean(),
  source: z.string().optional(),
  field: z.string().optional(),
  format: z.string().optional(),
  party: z
    .enum(['holder', 'co_holder', 'minor', 'guardian', 'organization'])
    .optional(),
  row: z.boolean(),
  custom: z.boolean(),
  value_mn: z.string().optional(),
  value_en: z.string().optional(),
});
export type ContractVariableType = z.infer<typeof ContractVariableSchema>;

const templateFields = {
  id: z.guid(),
  bond_id: z.guid(),
  ownership_type: OwnershipTypeSchema,
  language: LanguageSchema,
  /** Whether the document prints the holder's taxpayer number (ТТД). */
  ttd: z.boolean(),
  name: z.string(),
  status: TemplateStatusSchema,
  created_at: z.string(),
  updated_at: z.string().optional(),
};

export const TemplateSummarySchema = z.object({
  ...templateFields,
  bond_code: z.string(),
  fields: z.number(),
  mapped: z.number(),
});
export type TemplateSummaryType = z.infer<typeof TemplateSummarySchema>;

export const FieldSourceSchema = z.enum(['unmapped', 'variable', 'fixed']);
export type FieldSource = z.infer<typeof FieldSourceSchema>;

export const TemplateFieldSchema = z.object({
  placeholder: z.string(),
  position: z.number(),
  source: FieldSourceSchema,
  variable: z.string().optional(),
  fixed_value: z.string().optional(),
});
export type TemplateFieldType = z.infer<typeof TemplateFieldSchema>;

export const TemplateDetailSchema = z.object({
  ...templateFields,
  bond_code: z.string(),
  created_by: z.guid().optional(),
  fields: z.array(TemplateFieldSchema),
  pictures: z.array(
    z.object({
      alt_text: z.string(),
      party_type: z.string(),
      found: z.boolean(),
    }),
  ),
  problems: z.array(z.object({ code: z.string(), message: z.string() })),
  /** How many contracts were drafted from it; one or more keeps it from changing. */
  contracts: z.number(),
});
export type TemplateDetailType = z.infer<typeof TemplateDetailSchema>;

/** Whether t's file and mapping can change, and it be deleted: a draft no contract uses. */
export const templateEditable = (t: TemplateDetailType) =>
  t.status === 'draft' && t.contracts === 0;

export interface UploadTemplateBody {
  bond_id: string;
  ownership_type: OwnershipType;
  language: Language;
  ttd: boolean;
  name: string;
  /** The .docx, base64-encoded. */
  file: string;
}

/** One placeholder's mapping, as PUT /contract-templates/{id}/fields takes it. */
export interface FieldMappingBody {
  placeholder: string;
  source: FieldSource;
  variable?: string;
  fixed_value?: string;
}

export interface TemplateFilters {
  page?: number;
  status?: TemplateStatus;
  bond_id?: string;
}

/** The ownership types whose contracts name each party a variable reads. */
const partyOwnerships: Record<
  NonNullable<ContractVariableType['party']>,
  OwnershipType[]
> = {
  holder: ['individual', 'joint'],
  co_holder: ['joint'],
  minor: ['minor'],
  guardian: ['minor'],
  organization: ['organization'],
};

/** Whether v can fill a template of ownership: a party's value only when it names that party. */
export function variableFits(
  v: ContractVariableType,
  ownership: OwnershipType,
): boolean {
  return !v.party || partyOwnerships[v.party].includes(ownership);
}
