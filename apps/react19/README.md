.vscode/settings.json includes the following

```json
{
  "files.readonlyInclude": {
    "**/routeTree.gen.ts": true
  },
  "files.watcherExclude": {
    "**/routeTree.gen.ts": true
  },
  "search.exclude": {
    "**/routeTree.gen.ts": true
  }
}
```

You can find the official explanation [here](https://tanstack.com/router/latest/docs/framework/react/routing/installation-with-vite#ignoring-the-generated-route-tree-file)
