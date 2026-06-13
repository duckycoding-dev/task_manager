import { z, type ZodError } from 'zod/v4';

type RecursivelyReplaceNullWithUndefined<T> = T extends null
  ? undefined
  : T extends (infer U)[]
    ? RecursivelyReplaceNullWithUndefined<U>[]
    : T extends Record<string, unknown>
      ? { [K in keyof T]: RecursivelyReplaceNullWithUndefined<T[K]> }
      : T;

export function nullsToUndefined<T>(
  obj: T,
): RecursivelyReplaceNullWithUndefined<T> | undefined {
  if (obj === null || obj === undefined) {
    return undefined;
  }

  if (Object.getPrototypeOf(obj) === Object.prototype || Array.isArray(obj)) {
    for (const key in obj) {
      // Recursive generic: TS can't prove the assignment shape matches
      // `RecursivelyReplaceNullWithUndefined<T[K]>` through the in-place
      // mutation. `unknown` would force a parallel cast at every callsite
      // and the recursion's type-flow doesn't survive intermediate widening.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      obj[key] = nullsToUndefined(obj[key]) as any;
    }
  }
  // Recursive generic: see comment above.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return obj as any;
}

export function formatZodError(error: ZodError): string {
  return z.prettifyError(error);
}
