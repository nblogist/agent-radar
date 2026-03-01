import { z } from 'zod';

export const submitSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or fewer'),
  short_description: z
    .string()
    .min(1, 'Short description is required')
    .max(140, 'Short description must be 140 characters or fewer'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  logo_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  website_url: z
    .string()
    .min(1, 'Website URL is required')
    .url('Must be a valid URL')
    .refine((v) => v.startsWith('https://'), { message: 'Must start with https://' }),
  github_url: z
    .string()
    .startsWith('https://github.com/', { message: 'Must start with https://github.com/' })
    .optional()
    .or(z.literal('')),
  docs_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  api_endpoint_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  contact_email: z
    .string()
    .min(1, 'Contact email is required')
    .email('Must be a valid email address'),
  categories: z.array(z.string().uuid()).min(1, 'Select at least one category'),
  tags: z.array(
    z.string().regex(
      /^[a-z0-9][a-z0-9-]{0,59}$/,
      'Tags must be lowercase alphanumeric with optional hyphens',
    ),
  ),
  chains: z.array(z.string().uuid()),
});

export type SubmitFormData = z.infer<typeof submitSchema>;
