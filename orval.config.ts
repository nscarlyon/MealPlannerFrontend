import { defineConfig } from 'orval';

export default defineConfig({
  mealPlanner: {
    input: {
      target: 'http://localhost:5137/openapi/v1.json',
    },
    output: {
      mode: 'tags-split',
      target: './src/app/api/generated',
      schemas: './src/app/api/models',
      client: 'angular',
      override: {
        angular: {
          retrievalClient: 'httpClient',
          provideIn: 'root',
        },
        enumGenerationType: 'enum',
      },
      baseUrl: 'http://localhost:5137',
    },
  },
});
