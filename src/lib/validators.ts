import { z } from 'zod';

/** Treat empty / null / NaN as 0 for survey count fields */
export function intField() {
  return z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return 0;
      if (typeof val === 'number' && Number.isNaN(val)) return 0;
      return val;
    },
    z.coerce.number().int().min(0)
  );
}
