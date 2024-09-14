import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { fetchInstruments } from '@/services/instrument.service';
import { extractData } from '@/utils/request.utils';
import { GetInstrumentsSchema } from '@/validators/instrument.validator';

export const searchInstruments = async (req: Request, res: Response) => {
  const { query } = extractData(req, GetInstrumentsSchema);
  const { q } = query;
  const instruments = await fetchInstruments(q);
  res.status(StatusCodes.OK).json(instruments);
};
