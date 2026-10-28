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
  joint: 'Хамтран эзэмшил',
  organization: 'Байгууллага',
  minor: 'Насанд хүрээгүй',
};

/** A product templates are uploaded for, with the ownership type its contracts name. */
export const ContractProductSchema = z.object({
  name: z.string(),
  ownership_type: OwnershipTypeSchema,
  co_holder: z.boolean(),
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

const templateFields = {
  id: z.uuid(),
  user_id: z.uuid(),
  bond_id: z.uuid(),
  ownership_type: OwnershipTypeSchema,
  language: LanguageSchema,
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
  created_by: z.uuid().optional(),
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
  language: Language;
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

/** The party a party's variable reads, by the ownership types that name that party. */
export function variableFits(
  v: ContractVariableType,
  ownership: OwnershipType,
): boolean {
  return v.party !== 'co_holder' || ownership === 'joint';
}
