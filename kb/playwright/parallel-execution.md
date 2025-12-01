# Playwright Parallel Execution

Playwright runs tests in parallel by default, significantly reducing test execution time.

## Configuration

Configure parallel execution in `playwright.config.ts`:

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  workers: process.env.CI ? 2 : 4,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
});
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Playwright Tests
on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: 18
    - name: Install dependencies
      run: npm ci
    - name: Install Playwright Browsers
      run: npx playwright install --with-deps
    - name: Run Playwright tests
      run: npx playwright test
    - uses: actions/upload-artifact@v3
      if: always()
      with:
        name: playwright-report
        path: playwright-report/
```

## Parallel Strategies

1. **Test-level parallelization**: Run different test files in parallel
2. **Worker-level parallelization**: Run tests within a file in parallel (if isolated)
3. **Sharding**: Split tests across multiple machines

## Best Practices

- Ensure tests are independent (no shared state)
- Use isolated browser contexts
- Avoid hardcoded ports or resources
- Use test fixtures for setup/teardown

## Performance Tips

- Use `test.describe.parallel()` for parallel execution within a file
- Configure appropriate worker count (usually CPU cores - 1)
- Use `--shard` for distributed execution across machines

