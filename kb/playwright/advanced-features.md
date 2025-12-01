# Playwright Advanced Features

Playwright offers powerful features for complex testing scenarios.

## Network Interception

Mock and stub network requests:

```typescript
import { test } from '@playwright/test';

test('intercept network', async ({ page }) => {
  await page.route('**/api/users', route => {
    route.fulfill({
      status: 200,
      body: JSON.stringify([{ id: 1, name: 'Test User' }])
    });
  });
  
  await page.goto('https://example.com');
});
```

## Screenshots and Videos

Playwright automatically captures screenshots and videos on failure:

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
```

## Mobile Emulation

Test mobile devices and touch events:

```typescript
test('mobile test', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.touchscreen.tap(100, 200);
});
```

## Multiple Browser Contexts

Test multi-user scenarios:

```typescript
test('multi-user', async ({ browser }) => {
  const context1 = await browser.newContext();
  const context2 = await browser.newContext();
  
  const page1 = await context1.newPage();
  const page2 = await context2.newPage();
  
  // Test interaction between users
});
```

## Code Generation

Use Playwright's codegen to record tests:

```bash
npx playwright codegen https://example.com
```

## Debugging

- Use `await page.pause()` to open Playwright Inspector
- Run with `--debug` flag
- Use `--headed` to see browser execution

