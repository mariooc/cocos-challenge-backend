import { z } from 'zod';

export const creatorValidations = {
  forNumericValue: (fieldName: string) => {
    return z
      .string()
      .refine((data) => !isNaN(Number(data)), {
        message: `${fieldName} must be a numeric value`,
      })
      .transform(Number)
      .refine((num) => num > 0, {
        message: `${fieldName} must be a positive number`,
      });
  },
};
