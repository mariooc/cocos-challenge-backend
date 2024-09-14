import { Router } from 'express';
import { GetInstrumentsSchema } from '@/validators/instrument.validator';
import { validateRequest } from '@/utils/request.utils';
import { searchInstruments } from '@/controllers/instrument.controller';
const router = Router();

router.get('/', validateRequest(GetInstrumentsSchema), searchInstruments);

export default router;
