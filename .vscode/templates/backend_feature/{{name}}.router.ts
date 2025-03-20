import { create{{namePascal}}Controller } from './{{nameCamel}}.controller';
import { create{{namePascal}}Service } from './{{nameCamel}}.service';
import { create{{namePascal}}Repository } from './{{nameCamel}}.repository';
import { createRouter } from '../../utils/create-app';

import { {{nameCamel}}Routes } from './{{nameCamel}}.routes';
import { db } from '../../db';
// Setup dependencies
const {{nameCamel}}Repo = create{{namePascal}}Repository(db);
const {{nameCamel}}Service = create{{namePascal}}Service({{nameCamel}}Repo);
const {{nameCamel}}Controller = create{{namePascal}}Controller({{nameCamel}}Service);

// Create a typed router
const {{nameCamel}}Router = createRouter()
  .basePath('/{{nameCamel}}')
  .openapi({{nameCamel}}Routes.get, {{nameCamel}}Controller.get);

export default {{nameCamel}}Router;
