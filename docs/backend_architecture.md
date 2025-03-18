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

This ensures that we can use HonoJS's types inferred correctly, for example when parsing the request data `const { id } = c.req.valid('param');`

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

Here we defined the database schemas using Drizzle with the `pgTable` adapter for PostgreSQL.\
From this we can define the Zod schemas using `drizzle-zod` and then infer the type using `Zod.infer<typeof schema>`

### .types.ts (optional)

Here we can define some types that will only be used locally and not be shared with other packages: for example, if need to write a script like we did to import vocabulary, and we want to do it in a TypeSafe way, we can define them here.

### Middlewares - TODO

### Error handler

The Hono app instance has an error handler attached at its root (sort of a middleware): this will catch every error and will show or not specific error data based on the environment (dev or not).\
Custom errors should be thrown using the custom made `AppError` class which handles default messages and the ideal status code based on the provided string union type: the developer can provide custom messages and defined whether or not they can reach the final user if the environment is not dev.\
The default Hono Error class was not suiting my needs and had some extra fields which I don't need.
