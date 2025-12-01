# Mabl CI/CD Integration

Mabl provides seamless integration with CI/CD pipelines for continuous testing.

## GitHub Actions

```yaml
name: Mabl Tests
on:
  push:
    branches: [ main ]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - name: Run Mabl Tests
      uses: mablhq/mabl-github-action@v1
      with:
        api-key: ${{ secrets.MABL_API_KEY }}
        environment-id: ${{ secrets.MABL_ENV_ID }}
        application-id: ${{ secrets.MABL_APP_ID }}
```

## Jenkins Integration

1. Install Mabl Jenkins plugin
2. Configure Mabl API credentials
3. Add Mabl build step
4. Set test plan or application ID
5. Configure result publishing

## GitLab CI

```yaml
mabl-tests:
  script:
    - |
      curl -X POST "https://api.mabl.com/events/deployment" \
        -H "Api-Key: $MABL_API_KEY" \
        -H "Content-Type: application/json" \
        -d '{"environment_id": "$MABL_ENV_ID"}'
```

## Configuration Options

- **Test plans**: Run specific test suites
- **Environments**: Target dev, staging, or production
- **Parallel execution**: Run tests concurrently
- **Result reporting**: Get detailed test results

## Deployment Events

Trigger tests on deployments:
1. Send deployment event to Mabl API
2. Mabl automatically runs relevant tests
3. Get results via webhook or API
4. Fail builds on test failures

## Best Practices

- Run smoke tests on every commit
- Full test suite on release branches
- Use environment-specific configurations
- Set appropriate timeouts
- Monitor test execution metrics

## Reporting

Mabl provides:
- Test execution reports
- Screenshot comparisons
- Video recordings
- Performance metrics
- Failure analysis

