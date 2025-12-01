# Selenium Grid

Selenium Grid allows you to run tests on multiple machines and browsers in parallel, enabling distributed test execution.

## Architecture

Selenium Grid consists of:
- **Hub**: Central node that receives test requests
- **Node**: Machine that executes the tests

## Setup

1. Download Selenium Server (Grid)
2. Start the Hub: `java -jar selenium-server-standalone.jar -role hub`
3. Register Nodes: `java -jar selenium-server-standalone.jar -role node -hub http://localhost:4444/grid/register`

## Benefits

- Parallel execution across multiple browsers
- Cross-platform testing
- Resource optimization
- Scalability for large test suites

## Configuration

Grid configuration can be done via JSON:

```json
{
  "port": 4444,
  "newSessionWaitTimeout": -1,
  "servlets": [],
  "withoutServlets": [],
  "custom": {}
}
```

## Best Practices

- Use Grid for cross-browser testing
- Configure appropriate timeouts
- Monitor node health
- Use Docker for easier node management

