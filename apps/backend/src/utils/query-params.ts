import { z } from 'zod/v4';

/**
 * Multi-value query param: accepts a single occurrence (`?status=todo`) or a
 * repeated key (`?status=todo&status=done`) and always yields an array.
 *
 * Repeated-key is the canonical encoding — it's OpenAPI's default for query
 * arrays (`style: form, explode: true`) and Hono's RPC client serializes
 * array query values as repeated keys natively, so typed FE clients get
 * multi-value filters with zero glue. Comma-separated values are NOT
 * supported. See docs/llm/coding-practices.md
 * §"Multi-value query params use repeated keys".
 */
export const multiValueQueryParam = <T extends z.ZodType>(item: T) =>
  z
    .union([item, z.array(item)])
    .transform((v): z.output<T>[] => (Array.isArray(v) ? v : [v]));

/**
 * Query schema for single-row reads that support the soft-delete opt-in.
 * Default `false`: a soft-deleted row is a 404. `includeDeleted=true`
 * returns it (deleted-items detail view). See ADR-0002.
 */
export const includeDeletedQuerySchema = z.object({
  includeDeleted: z.stringbool().default(false),
});
