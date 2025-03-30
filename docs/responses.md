## Special cases

If our response object data is empty, we can define it as `z.never()` instead of `z.null()` so that we don't have to manually type `... data: null ...` in the responses.

When doing this, we must add openapi metadata like so: `z.never().openapi({ type: 'null' }),`, so that the openapi documentation generator treat `never` as `null`.
