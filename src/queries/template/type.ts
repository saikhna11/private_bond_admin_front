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
  joint: 'Хамтран эзэмшигчтэй',
  minor: 'Хүүхдийн',
  organization: 'Байгууллага',
};

/** The ownership types in the order an admin picks them. */
export const ownershipOrder: OwnershipType[] = [
  'individual',
  'joint',
  'minor',
  'organization',
];

/** A product templates are uploaded for, of any ownership type. */
export const ContractProductSchema = z.object({
  name: z.string(),
});
export type ContractProductType = z.infer<typeof ContractProductSchema>;

/** A value of a contract a placeholder can be mapped to; a row one repeats the schedule's row. */
export const ContractVariableSchema = z.object({
  key: z.string(),
  group: z.string(),
  label: z.string(),
  party: z.enum(['holder', 'co_holder']).optional(),
  row: z.boolean(),
});
export type ContractVariableType = z.infer<typeof ContractVariableSchema>;

// z.guid, not z.uuid: the sample bonds and issuers have ids such as
// 00000000-0000-0000-0000-000000000101, which carry no RFC 4122 version.
const templateFields = {
  id: z.guid(),
  user_id: z.guid(),
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
  product: z.string(),
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
  product: z.string(),
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
});
export type TemplateDetailType = z.infer<typeof TemplateDetailSchema>;

export interface UploadTemplateBody {
  product: string;
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
  product?: string;
}

/** The ownership types whose contracts name each party a variable reads. */
const partyOwnerships: Record<
  NonNullable<ContractVariableType['party']>,
  OwnershipType[]
> = {
  holder: ['individual', 'joint'],
  co_holder: ['joint'],
};

/** Whether v can fill a template of ownership: a party's value only when it names that party. */
export function variableFits(
  v: ContractVariableType,
  ownership: OwnershipType,
): boolean {
  return !v.party || partyOwnerships[v.party].includes(ownership);
}
