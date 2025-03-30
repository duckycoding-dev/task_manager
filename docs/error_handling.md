# Backend

## HTTP errors

Hono differentiates HTTP Response status codes in `ContentfulStatusCode` and `ContentlessStatusCode`\
`ContentlessStatusCode` are these four: `101`, `204`, `205`, `304`;

When handling errors we are always interested in the contentful one, which we will handle with our custom HTTP related `AppError class` (which wraps Hono's `HTTPException class`)

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

If we are throwing HTTP errors from a controller (which will do most of the times), we can enforce typesafety for the error codes based on the OpenAPI definition of the endpoints.\
We do this by using the `EndpointError class` which extend the AppError class: this is a generic class that needs to explicity type the parameters by passing the type of the handler you are working with.\
Here's an example on how to use this:

```ts
throw new EndpointError<typeof tasksRoutes.getTaskById>('INTERAL');
// Let's say the getTaskById accepts responses with codes 200, 400 and 404
// You will be able to only provide the corrisponding verbose status codes "OK" | "INTERNAL" | "NOT_FOUND"
```

We will use this EndpointError over the AppError most of the times, since it is a cleaner way of having typesafe autocompletion for throwing errors.

## Domain / business errors

We will define various domain specific errors that will be used mostly by the service and repository layers: these will be then mapped to HTTP errors (using AppError or EndpointError) in the controller layer.

We define these inside `src/utils/errors/domain-errors.ts`

## Where and how to throw errors

1. Service Layer: Throw domain/business errors, never HTTP errors
   typescript

```ts
class TaskService {
  async createTask(taskData: CreateTaskDto): Promise<Task> {
    if (await this.isTaskLimitReached(taskData.userId)) {
      throw new BusinessRuleViolationError(
        'User has reached maximum task limit',
      );
    }
    // Regular "not found" cases can just return null
    return this.taskRepository.create(taskData);
  }
}
```

2. Controller Layer: Wrap service calls in try/catch and translate to HTTP errors

```ts
const createTask = async (c: Context) => {
  try {
    const data = await c.req.json();
    const task = await taskService.createTask(data);
    return c.json(task, 201);
  } catch (error) {
    if (error instanceof BusinessRuleViolationError) {
      throw new EndpointError<typeof tasksRoutes.createTask>(422, {
        message: error.message,
      });
    }
    throw error; // Let global handler deal with unexpected errors
  }
};
```

This separation keeps the service layer focused on business logic without HTTP concerns, making it more reusable across different contexts (like if we later add other non-HTTP entry points for example).\
For simple CRUD operations where "not found" is the main concern, returning null/undefined from service methods is fine.\
For business rule violations that need to be explicitly handled, throwing domain-specific errors is better.\
This approach gives a good balance of simplicity and proper separation of concerns, which is appropriate for a learning project and still follows professional patterns. (explanation given by Claude 3.7 Sonnet AI)

## What is usually used professionally tho?

In professional TypeScript applications, especially larger ones:

- Domain errors for business logic failures is increasingly common
- Error translation at boundaries (like controllers) is standard practice
  - this means that every controller handler should be wrapped by a try/catch block
- Many teams use higher-order functions to standardize error handling (instead of repetengly include a try/catch block manually)

The question of where to throw errors (service vs controller) comes down to separation of concerns:
Service Layer Should:

- Throw domain/business errors that represent what went wrong
- Use error types that are independent of HTTP concerns
- Focus on "what" happened, not "how" to respond

```ts
// Service layer
class TaskService {
  async getTaskById(id: string): Promise<Task> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new EntityNotFoundError('Task', id);
    }
    return task;
  }
}
```

Controller Layer Should:

- Translate domain errors to HTTP responses
- Handle the HTTP-specific concerns
- Map business errors to appropriate status codes

```ts
// Controller
const getTaskById = async (c: Context) => {
  const { id } = c.req.param();

  try {
    const task = await taskService.getTaskById(id);
    return c.json(task);
  } catch (error) {
    if (error instanceof EntityNotFoundError) {
      throw new EndpointError<typeof tasksRoutes.getTaskById>(404, {
        message: error.message,
      });
    }

    // Re-throw other errors to be handled by global error handler
    throw error;
  }
};
```

I've decided to go with the other approach just for simplicity, since this is a simple project

## Repository layer errors

First of all, the repository layer, just like the service layer, should not throw HTTP errors but should throw domain errors instead.\
When querying the database in this specific backend we should be parsing the data with a Zod schema to ensure data correcteness at runtime: if the parsing fails, we should throw a domain error indicating that the validation of the data failed.\
So, we have created a custom domain error class to be used in these cases called `RepositoryValidationError`.

Since every endpoint that ends up calling a repository layer could then throw a zod validation error, we handle this in the global error handler: this let's us avoid having to forcefully wrap every controller in a try catch and handle the same error in every controller manually.

This error will be mapped to a `500` (`INTERNAL_SERVER_ERROR`) error: in development environment the response will contain the message provided to the error constructor.
