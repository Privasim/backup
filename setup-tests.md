# Test Setup Instructions

To run the tests for the OpenRouter client with web search transparency features, you'll need to install the following dependencies:

```bash
npm install --save-dev jest @types/jest ts-jest
```

## Running Tests

After installing the dependencies, you can run the tests using:

```bash
npm test
```

Or run tests in watch mode:

```bash
npm run test:watch
```

## Test Files

The following test files have been created:

1. `src/lib/openrouter/search-tracker.test.ts` - Tests for the SearchTracker class
2. `src/lib/openrouter/client.test.ts` - Tests for the OpenRouter client
3. `src/lib/openrouter/utils.test.ts` - Tests for utility functions

## Jest Configuration

A `jest.config.js` file has been created with the necessary configuration to run TypeScript tests.

## Notes

- The tests use Jest as the testing framework
- Mocking is used for API calls to avoid external dependencies during testing
- The tests cover the core functionality of the web search transparency features
