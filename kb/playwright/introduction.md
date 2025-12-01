# Playwright Introduction

Playwright is a modern end-to-end testing framework developed by Microsoft. It provides fast, reliable, and capable automation for Chromium, Firefox, and WebKit browsers.

## Key Features

- **Cross-browser**: Test on Chromium, Firefox, and WebKit
- **Auto-waiting**: Automatically waits for elements to be ready
- **Network interception**: Mock and stub network requests
- **Mobile emulation**: Test mobile viewports and touch events
- **Multi-language**: Supports TypeScript, JavaScript, Python, .NET, and Java

## Installation

### Node.js

```bash
npm init -y
npm install @playwright/test
npx playwright install
```

### Python

```bash
pip install playwright
playwright install
```

## First Test

Here's a simple Playwright test in TypeScript:

```typescript
import { test, expect } from '@playwright/test';

test('basic test', async ({ page }) => {
  await page.goto('https://example.com');
  await expect(page).toHaveTitle(/Example/);
});
```

## Browser Support

Playwright supports:
- **Chromium**: Chrome, Edge, Opera
- **Firefox**: Full support
- **WebKit**: Safari engine

All browsers run headless by default but can run in headed mode.

## Architecture

Playwright uses a client-server architecture:
- Test code runs in Node.js
- Browser automation happens via WebSocket protocol
- Each browser context is isolated

