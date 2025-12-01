# TestWise Questionnaire Mapping

The TestWise questionnaire maps user responses to test automation tool recommendations.

## Tool Scoring System

Each question option maps to specific tools with weights:
- Selected tool: weight 10
- Other tools: weight 2

## Supported Tools

1. **Selenium**: Open-source, code-heavy, maximum flexibility
2. **Playwright**: Modern, fast, cross-browser, developer-friendly
3. **Testim**: Low-code, AI-powered, self-healing
4. **Mabl**: Enterprise-grade, cloud-native, intelligent automation

## Question Categories

1. **Budget**: Free/open-source vs. paid solutions
2. **Execution frequency**: Ad-hoc to CI/CD
3. **Team size**: Small to enterprise
4. **Skill level**: No-code to expert
5. **Learning curve**: Minimal to complex
6. **Setup complexity**: Auto-configure to manual
7. **UI importance**: CLI-first to drag-and-drop
8. **Support needs**: Self-reliant to 24/7 support
9. **Performance**: Speed and parallelism requirements
10. **Maintenance**: Manual to auto-maintenance
11. **Scalability**: Small projects to enterprise scale

## Scoring Algorithm

Final scores are calculated by summing weights across all questions. The tool with the highest score is recommended.

## Result Interpretation

- **High score difference**: Clear recommendation
- **Close scores**: Multiple tools may be suitable
- **Tie scenarios**: User preferences determine final choice

