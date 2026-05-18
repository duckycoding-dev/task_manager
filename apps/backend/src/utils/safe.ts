export type Result<T, E = Error> =
  | { ok: true; data: T }
  | { ok: false; error: E };

export const safe = async <T>(fn: () => Promise<T>): Promise<Result<T>> => {
  try {
    const data = await fn();
    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};
