import { z } from 'zod';

export const SearchInstrumentQuerySchema = z.object({
  q: z.string().min(2),
});

export const GetInstrumentsSchema = z.object({
  query: SearchInstrumentQuerySchema,
});
