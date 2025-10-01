# Working with @hono/zod-openapi
After some trial and error, I've noticed that passing zod schemas generated from a "normal import" of `import { z } from 'zod/v4` to fields such as the `request.params` when defining routes using zod-openapi `createRoute` utility function (eg:
```ts
const getTaskById = createRoute({
  path: '/:taskId',
  method: 'get',
  request: {
    params: taskIdParamSchema,
  },
```
) would cause the library to not be able to generate the actual openapi docs.

This is because the actual expected zod schema needs a few extra fields for some metadata: to solve this we could just create the schemas using the rexported version of zod from @hono/zod-openapi (`import { z } from '@hono/zod-opeanpi`) which handles it for us, or we could use the exported utility `extendZodWithOpenApi`.

This utility automatically enhances the `z` module by adding those extra fields somehow (I haven't quite looked how it does so).

## How to use this utility `extendZodWithOpenApi`
The [docs](https://github.com/asteasolutions/zod-to-openapi?tab=readme-ov-file#usage) say to add it as soon as possible in the project: I've tried adding it to the `app.ts` file but had no results.\
Instead, for now I've added it to every `*.types.ts` files, in which I have defined the schemas used around my codebase, as the first thing like so
```ts
import { z } from 'zod/v4';
import { extendZodWithOpenApi } from '@hono/zod-openapi';
extendZodWithOpenApi(z);
``` 

This other [comment in the docs](https://github.com/asteasolutions/zod-to-openapi?tab=readme-ov-file#scenarios-that-require-using-extendzodwithopenapi-and-openapi) says that it is REQUIRED to use this utility for parameters (with this I mean either use this utility or the rexported zod module).\
From the docs example you can see that this is useful for adding things like descriptions: yet, if nothing is passed to the newly added `.openapi` method nothing is added, so I don't quite understand what would be the difference and why it does not work with a normal zod import

## Using the schemas in other packages, such as the frontend ones
I will need to see if this approach is fine even when exporting those schemas to let them be used by other packages.

I want to avoid importing zod from the rexport of @hono/zod-opeanpi in order to avoid having this dependency on my frontend as well (to be thought about more if this is a good approach or if I should just stick to using the rexport in my entire code base)