import { z } from 'zod';

const StageSchema = z.enum(['build', 'test', 'deploy']);

const JobSchema = z.object({
  name: z.string().min(1),
  stage: StageSchema,
  image: z.string().min(1).optional(),
  script: z.array(z.string().min(1)).min(1),
  rules: z.array(z.string().min(1)).default([]),
});

export const ConfigSchema = z.object({
  project: z.string().min(1),
  nodeVersion: z
    .string()
    .regex(/^\d+(\.\d+)*$/, 'ожидался номер версии, например 20 или 3.12')
    .default('20'),
  jobs: z.array(JobSchema).min(1),
});

export type RawConfig = z.input<typeof ConfigSchema>;
