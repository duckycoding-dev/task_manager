import type { ContentfulStatusCode } from 'hono/utils/http-status';
import type { VerboseStatusCode } from '../status-codes';

export type DomainErrorOptions = {
  message?: string;
  showToClient?: boolean;
  cause?: unknown;
};

export abstract class DomainError extends Error {
  readonly showToClient: boolean;

  constructor(defaultMessage: string, options: DomainErrorOptions = {}) {
    super(options.message ?? defaultMessage, { cause: options.cause });
    this.name = new.target.name;
    this.showToClient = options.showToClient ?? false;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class EntityNotFoundError extends DomainError {
  readonly entity: string;
  readonly entityId: string;

  constructor(
    entity: string,
    entityId: string,
    options: DomainErrorOptions = {},
  ) {
    super(`${entity} not found: ${entityId}`, options);
    this.entity = entity;
    this.entityId = entityId;
  }
}

export class ValidationError extends DomainError {
  readonly issues: unknown;
  readonly input?: unknown;

  constructor(
    issues: unknown,
    input?: unknown,
    options: DomainErrorOptions = {},
  ) {
    super('Validation failed', options);
    this.issues = issues;
    this.input = input;
  }
}

export class BusinessRuleViolationError extends DomainError {
  readonly rule: string;
  readonly ctx?: unknown;

  constructor(rule: string, ctx?: unknown, options: DomainErrorOptions = {}) {
    super(`Business rule violated: ${rule}`, options);
    this.rule = rule;
    this.ctx = ctx;
  }
}

export class ConflictError extends DomainError {
  readonly detail: string;

  constructor(detail: string, options: DomainErrorOptions = {}) {
    super(`Conflict: ${detail}`, options);
    this.detail = detail;
  }
}

export class ForbiddenError extends DomainError {
  readonly reason?: string;

  constructor(reason?: string, options: DomainErrorOptions = {}) {
    super(reason ? `Forbidden: ${reason}` : 'Forbidden', options);
    this.reason = reason;
  }
}

export class AuthenticationError extends DomainError {
  readonly reason?: string;

  constructor(reason?: string, options: DomainErrorOptions = {}) {
    super(
      reason ? `Authentication failed: ${reason}` : 'Authentication failed',
      options,
    );
    this.reason = reason;
  }
}

export class RepositoryValidationError extends DomainError {
  readonly input: unknown;
  readonly issues: unknown;

  constructor(
    input: unknown,
    issues: unknown,
    options: DomainErrorOptions = {},
  ) {
    super('Repository validation failed', options);
    this.input = input;
    this.issues = issues;
  }
}

type DomainErrorRegistryEntry = {
  status: ContentfulStatusCode;
  verboseCode: VerboseStatusCode;
};

export const DOMAIN_ERROR_MAP = {
  EntityNotFoundError: { status: 404, verboseCode: 'NOT_FOUND' },
  ValidationError: { status: 400, verboseCode: 'BAD_REQUEST' },
  BusinessRuleViolationError: {
    status: 422,
    verboseCode: 'UNPROCESSABLE_ENTITY',
  },
  ConflictError: { status: 409, verboseCode: 'CONFLICT' },
  ForbiddenError: { status: 403, verboseCode: 'FORBIDDEN' },
  AuthenticationError: { status: 401, verboseCode: 'UNAUTHORIZED' },
  RepositoryValidationError: {
    status: 500,
    verboseCode: 'INTERNAL_SERVER_ERROR',
  },
} as const satisfies Record<string, DomainErrorRegistryEntry>;
