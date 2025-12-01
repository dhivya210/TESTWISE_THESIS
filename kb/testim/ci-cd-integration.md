# Testim CI/CD Integration

Testim seamlessly integrates with popular CI/CD pipelines for automated test execution.

## GitHub Actions

```yaml
name: Testim Tests
on:
  push:
    branches: [ main ]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Run Testim Tests
      uses: testim-io/testim-github-action@v1
      with:
        testim-token: ${{ secrets.TESTIM_TOKEN }}
        testim-project-id: ${{ secrets.TESTIM_PROJECT_ID }}
        testim-label: 'smoke-tests'
```

## Jenkins Integration

1. Install Testim Jenkins plugin
2. Configure Testim credentials
3. Add Testim build step
4. Set test labels to execute
5. Configure post-build actions

## GitLab CI

```yaml
testim:
  image: node:16
  script:
    - npm install -g @testim/cli
    - testim tests run --label smoke --token $TESTIM_TOKEN
```

## Configuration Options

- **Test labels**: Run specific test suites
- **Parallel execution**: Run multiple tests simultaneously
- **Environment variables**: Pass configuration to tests
- **Test results**: Get detailed reports and screenshots

## Best Practices

- Use test labels to organize test suites
- Run smoke tests on every commit
- Run full suite on release branches
- Set appropriate timeouts
- Monitor test execution time

## Reporting

Testim provides:
- Test execution reports
- Screenshot comparisons
- Video recordings
- Failure analysis
- Trend analytics

