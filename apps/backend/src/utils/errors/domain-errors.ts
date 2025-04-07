/**
 * @example
 * Use this when Zod validation fails
 */
export class RepositoryValidationError extends Error {
  constructor(message?: string, cause?: unknown) {
    super(message ?? 'Repository validation error', {
      cause,
    });
    this.name = 'RepositoryValidationError';

    Object.setPrototypeOf(this, RepositoryValidationError.prototype);
  }
}
