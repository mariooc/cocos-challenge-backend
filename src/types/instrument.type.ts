import { z } from "zod";

// GET /instrument
import { SearchInstrumentQuerySchema } from "@/validators/instrument.validator";
export type PostBodySegment = z.infer<typeof SearchInstrumentQuerySchema>;
