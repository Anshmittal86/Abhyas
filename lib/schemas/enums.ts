import { z } from 'zod';

export const GenderEnum = z.enum(['MALE', 'FEMALE', 'OTHER']);
export type Gender = z.infer<typeof GenderEnum>;
