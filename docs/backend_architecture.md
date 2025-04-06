# Backend Architecture

Our backend app is a HonoJS app which exports all the routes from the `src/app.ts` file, which looks like this

```ts
import nameOfTheFeatureRouter from './features/nameOfTheFeature/nameOfTheFeature.router';
import type { AppOpenAPI } from './types/app_context';
import { createApp } from './utils/create-app';

export const app = createApp();

const routers = [
  nameOfTheFeatureRouter,
  ... // other routers
] as const satisfies AppOpenAPI[];

routers.forEach((router) => {
  app.route('/', router);
});

export type AppType = (typeof routers)[number];

```

This allows us to infer the type of every route that will then be used by the HonoRPC client to create a typesafe RPC client in `src/hc.ts`.\

We are using a 3 layer architecture with Controller-Services-Repositories\
Every one of these layers is defined with a factory function which takes as input at least the next layer (thus injecting dependencies).

In order to ensure typesafety between all the different layers we are leveraging the `@hono/zod-openapi` packages which let's us define typesafe routes and use those types in the other layers: on top of that, this automatically generates an OpenAPI documentation and, using the `scalar/hono-api-reference` library, we can have a fully functional UI to navigate the documentation and test the various endpoints.

Moving onto how the code is strcutured, every "feature" is defined inside `src/features/nameOfTheFeature/`, whose content will look like this:

```
src/features/nameOfTheFeature/
|__nameOfTheFeature.router.ts
|__nameOfTheFeature.routes.ts
|__nameOfTheFeature.controller.ts
|__nameOfTheFeature.service.ts
|__nameOfTheFeature.repository.ts
|__nameOfTheFeature.db.ts
|__nameOfTheFeature.types.ts (optional)
```

We make use of some utility functions that we have defined together with some strict types: check the utils to see what they do.

Now, let's explain every file

### .router.ts

Here we do two things:

- instantiate the layers and inject them like this
  ```ts
  // Setup dependencies
  const nameOfTheFeatureRepository = createNameOfTheFeatureRepository(db);
  const nameOfTheFeatureService = createNameOfTheFeatureService(
    nameOfTheFeatureRepository,
  );
  const nameOfTheFeatureController = createNameOfTheFeatureController(
    nameOfTheFeatureService,
  );
  ```
- define the router with its base path and every route handler with its controller like so:
  ```ts
  // Create a typed router
  const nameOfTheFeatureRouter = createRouter()
    .basePath('/name_of_the_feature') // notice that the path is written as snake case
    .openapi(nameOfTheFeatureRoutes.exampleRoute, nameOfTheFeatureController.exampleFunction);
    ...
  export default nameOfTheFeatureRouter;
  ```
  The exported router will the be used in `src/app.ts` as stated before.

### .routes.ts

Here we defined the routes with their zod schemas for the parameters, query params, etc,... and we export them like so:

```ts
export const nameOfTheFeatureRoutes = {
  exampleRoute,
} as const satisfies AppRoutes;
```

This is a TypeScript trick to keep the correct inferred types: using `as AppRoutes` would not work in this case, because we need the specific inferred type with all it's values, and not a generic one such as `AppRoutes`.

The routes do not call the controller directly: this is handled in the `*.router.ts` file in order to mantain typesafety (I couldn't find a way to do it separately, it would lose typesafety)

### .controller.ts

The controller is responsible of:

- parsing the data coming in the handler to ensure it is correct before proceeding and if not, throw the correct error
- calling ONE and only ONE service layer function
- returning the result of the service layer with the correct format (be it json, xml, etc,...)

The controller's functions types should be inferred from the routes like so:

```ts
export type NameOfTheFeatureController = {
  exampleFunction: AppRouteHandler<typeof nameOfTheFeatureRoutes.exampleRoute>;
  // ... other methods
};
```

This ensures that we can use HonoJS's types inferred correctly, for example when parsing the request data `const { id } = c.req.valid('param');` and for using the correct AppContext (which could be differ from the global one depending on the middlewares used in the route).

### .service.ts

The service layer is responsible of:

- handling business/domain logic, which includes (but is not limited to):
  - throwing errors
  - formatting data
  - applying logic on data
  - etc...
- calling other services
- calling other EXTERNAL services as well if needed
- calling the repository layer/s

As you can see, this is were most of the logic takes place.

### .repository.ts

The repository layer is responsible of:

- communicating with the database
- validating the data against predefined schemas (whether to throw an error or not depends on the specific case)
- mapping the data to a predefined type (WITHOUT ALTERING IT!!)

The repository layer SHOULD NOT alter data and should return it "as is": with altering data I mean mapping it to something else entirely, but it should still map data in the sense of ensuring it's of the correct type.\
For example, if the database stores Dates and we expect to handle only TS Date types, the repository layer should make sure that the returned data is of that type and not, for example, a string representing a date.

### .db.ts

Here we

- define the database schemas using Drizzle with the `pgTable` adapter for PostgreSQL.
- Drizzle-Generated Zod schemas using `drizzle-zod`
- Any Enums or Constants used in the Drizzle schema: for enums, export `as const` arrays
- TypeScript Types inferred from the Zod schema (z.infer<typeof schema>) and from the enums arrays

### .types.ts

- Custom Zod Schemas for API Validation
- API Request & Response Types
- Query Params & Path Params Types

This ensures separation of concerns:

- DB-related types stay in .db.ts (closely tied to Drizzle ORM).
- API-related types stay in .types.ts (routes, controllers, services, etc,... use these).

This structure scales well, keeps everything modular, and prevents circular dependencies.

### Middlewares

#### How to create a middleware

In order to keep type safety working throughout the app, we need to defined middlewares using Hono's `createMiddleware` generic function: this links everything up automatically when using default's Hono routes definition, but we are using Hono Zod OpenAPI.\
When doing so, we must provide the new Context that must extend (or be) the `AppContext`: when extending it we can, for example, make some of the already defiend properties required; here is an example:

```ts
const myMiddleware = createMiddleware<{
  Variables: MarkPropertiesRequired<
    AppContext['Variables'],
    'user' | 'session'
  >;
  Bindings: AppContext['Bindings'];
}>;
```

I've created the `MarkPropertiesRequired` utilty to simplify the AppContext override when it is necessary to do so; if a new property is needed, let's say in the Variables, we can just extend the Variables object normally `...<{Variables: AppContext['Variables'] & {...}, Bindings: AppContext['Bindings']>`

Since we are using Hono Zod OpenAPI, we must provide the created middleware to the openapi route definition (in the `*.routes.ts` files) like so:

```ts
const myRoute = createRoute({
  path: '...',
  method: '...',
  request: ...,
  middleware: myMiddleware,
  responses: ...,
  description: ...,
});
```

If we need to provide multiple middlewares we must do so by declaring an array and mark it `as const`: this is a requirement [documented in the hono zod openapi repository](https://github.com/honojs/middleware/issues/715); e.g.:

```ts
const myRoute = createRoute({
  ...
  middleware: [myMiddleware, mySecondMiddleware] as const
  ...
});
```

Type safety is ensured for our controllers functions defined in separate controller files, again, thanks to the custom made `AppRouteHandler` type defined in `src/types/app_context.ts`, which we use to infer the updated context.

### Error handler

The Hono app instance has an error handler attached at its root (sort of a middleware): this will catch every error and will show or not specific error data based on the environment (dev or not).\
Custom errors should be thrown using the custom made `AppError` class which handles default messages and the ideal status code based on the provided string union type: the developer can provide custom messages and defined whether or not they can reach the final user if the environment is not dev.\
The default Hono Error class was not suiting my needs and had some extra fields which I don't need.
