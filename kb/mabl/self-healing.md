# Mabl Self-Healing Technology

Mabl's intelligent test maintenance automatically adapts tests when application UI changes.

## How Self-Healing Works

1. **Element detection**: Mabl uses multiple locator strategies
2. **Change detection**: Identifies when elements change
3. **Automatic updates**: Updates test steps with new locators
4. **Verification**: Re-runs tests to confirm fixes

## Locator Strategies

Mabl uses:
- CSS selectors
- XPath
- Element text
- Visual matching
- Relative positioning
- Data attributes

## Configuration

Configure self-healing in test settings:
- Enable/disable automatic healing
- Set healing confidence threshold
- Choose preferred locator types
- Configure retry behavior

## Benefits

- **Reduced maintenance**: 80% less time fixing broken tests
- **Higher test reliability**: Tests adapt to UI changes
- **Faster development**: Teams can update UI without breaking tests
- **Better ROI**: More time on new features, less on maintenance

## Best Practices

- Use stable element identifiers when available
- Review healed tests regularly
- Combine with manual test updates
- Monitor healing success metrics

## Limitations

- May struggle with major UI redesigns
- Requires some element similarity
- Complex dynamic content may need manual intervention

## Healing Reports

Mabl provides:
- Healing event logs
- Success/failure rates
- Element change tracking
- Test stability metrics

