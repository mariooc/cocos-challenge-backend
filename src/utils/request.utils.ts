import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodIssue, ZodObject, ZodSchema, z } from 'zod';
import { StatusCodes } from 'http-status-codes';

import { logger } from './logger.utils';
const formatZodIssue = (issue: ZodIssue): string => {
  const { path, message } = issue;
  const pathString = path.join('.');

  return `${pathString}: ${message}`;
};

// Format the Zod error message with only the current error
export const formatZodError = (error: ZodError) => {
  const { issues } = error;
  return issues.map((issue) => formatZodIssue(issue));
};

export const validateRequest =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    const { body, query, params, headers } = req;

    try {
      schema.parse({
        body,
        query,
        params,
        headers,
      });
      next();
    } catch (error) {
      const errors = formatZodError(error as ZodError);
      logger.error({ errors, body, query, params, headers });
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Validation failed',
        errors,
      });
    }
  };

export const extractData = <T extends ZodObject<any>>(
  req: Request,
  schema: T
): z.infer<T> => {
  const { query, params, body, headers } = req;
  const result = {
    ...(schema.shape.query ? { query: schema.shape.query.parse(query) } : {}),
    ...(schema.shape.body ? { body: schema.shape.body.parse(body) } : {}),
    ...(schema.shape.params
      ? { params: schema.shape.params.parse(params) }
      : {}),
    ...(schema.shape.headers
      ? { headers: schema.shape.headers.parse(headers) }
      : {}),
  };
  return result as z.infer<T>;
};
