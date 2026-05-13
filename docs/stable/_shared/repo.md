---
created: 2026-05-13
updated: 2026-05-13
summary: Monorepo overview — multiple frontend implementations share one Hono backend; structure of apps/ and packages/.
---

# What is this repo
The main idea of this repo is to be recreating the same webapp multiple times using different frontend techs, while maintaining the same backend business logic.\
This will allow me to test different technologies without worrying about coming up with a different new idea every time for my backend.
Also, if I feel like working with new backend tech, I could just port the existing one. 

## Structure:
```
|_apps
  |_backend/ //honojs backend, using hono zod openapi and drizzle with a postgres db/
  |_react19 //first frontend implementaion using react 19 and something else
  |_.... //other frontend implementations
|_packages
  |_utils //shared, framework-agnostic helpers reusable across frontends
```

The backend is developed and run using Bun with HonoJS, Drizzle ORM and Better Auth. The package manager is Bun via workspaces (`apps/*`, `packages/*`).
