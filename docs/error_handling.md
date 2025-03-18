# Backend

Hono differentiates HTTP Response status codes in `ContentfulStatusCode` and `ContentlessStatusCode`\
`ContentlessStatusCode` are these four: `101`, `204`, `205`, `304`;

When handling errors we are always interested in the contentful one, which we will handle with our custom `AppError class` (which wraps Hono's `HTTPException class`)

There's no need for a separate "ContentlessError" class because:

- Contentless status codes represent successful scenarios, not errors
- They're used in very specific contexts (like DELETE operations, caching, or protocol switching)
- They're simple responses that don't need additional processing or error handling logic

The user should:

- Use AppError for any error scenario that needs to return an error message to the client
- Return contentless status codes directly from routes for specific successful operations that don't need content
- Let the error handler deal with converting AppError instances into proper JSON responses

This maintains a clear separation between:

- Error handling (using AppError and the error handler)
- Success scenarios with content (using c.json(), c.text(), etc.)
- Success scenarios without content (using c.status() with contentless codes)
