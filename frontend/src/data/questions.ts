export interface QuestionOption {
  text: string;
  value: number;
  toolWeights: {
    selenium: number;
    playwright: number;
    testim: number;
    mabl: number;
  };
}

export interface Question {
  id: number;
  category: string;
  text: string;
  options: QuestionOption[];
}

export const questions: Question[] = [
  {
    id: 1,
    category: 'Budget',
    text: 'What is your budget allocation for test automation tools?',
    options: [
      {
        text: 'Free or open-source solutions preferred',
        value: 1,
        toolWeights: { selenium: 10, playwright: 10, testim: 5, mabl: 3 },
      },
      {
        text: 'Limited budget; prefer established free tools',
        value: 2,
        toolWeights: { selenium: 8, playwright: 10, testim: 5, mabl: 4 },
      },
      {
        text: 'Moderate budget; willing to invest for productivity gains',
        value: 3,
        toolWeights: { selenium: 5, playwright: 7, testim: 10, mabl: 8 },
      },
      {
        text: 'Enterprise budget; require premium features and dedicated support',
        value: 4,
        toolWeights: { selenium: 3, playwright: 5, testim: 7, mabl: 10 },
      },
    ],
  },
  {
    id: 2,
    category: 'Execution',
    text: 'How frequently do you plan to execute your test suites?',
    options: [
      {
        text: 'On demand or manual execution',
        value: 1,
        toolWeights: { selenium: 5, playwright: 5, testim: 10, mabl: 7 },
      },
      {
        text: 'Weekly test runs',
        value: 2,
        toolWeights: { selenium: 8, playwright: 7, testim: 7, mabl: 7 },
      },
      {
        text: 'Daily automated test execution',
        value: 3,
        toolWeights: { selenium: 7, playwright: 10, testim: 8, mabl: 10 },
      },
      {
        text: 'Continuous integration and continuous deployment (CI/CD)',
        value: 4,
        toolWeights: { selenium: 7, playwright: 10, testim: 10, mabl: 10 },
      },
    ],
  },
  {
    id: 3,
    category: 'Team',
    text: 'How many team members will be responsible for test maintenance?',
    options: [
      {
        text: '1 to 2 team members (small team)',
        value: 1,
        toolWeights: { selenium: 5, playwright: 7, testim: 10, mabl: 8 },
      },
      {
        text: '3 to 5 team members (medium team)',
        value: 2,
        toolWeights: { selenium: 7, playwright: 7, testim: 8, mabl: 10 },
      },
      {
        text: '6 to 10 team members (large team)',
        value: 3,
        toolWeights: { selenium: 8, playwright: 10, testim: 7, mabl: 8 },
      },
      {
        text: 'More than 10 team members (enterprise team)',
        value: 4,
        toolWeights: { selenium: 10, playwright: 8, testim: 5, mabl: 7 },
      },
    ],
  },
  {
    id: 4,
    category: 'Technical',
    text: 'What is your team\'s programming and scripting expertise level?',
    options: [
      {
        text: 'Beginner level; prefer no-code or low-code solutions',
        value: 1,
        toolWeights: { selenium: 5, playwright: 5, testim: 10, mabl: 8 },
      },
      {
        text: 'Basic to intermediate; comfortable with some scripting',
        value: 2,
        toolWeights: { selenium: 7, playwright: 7, testim: 8, mabl: 10 },
      },
      {
        text: 'Intermediate to advanced; strong scripting capabilities',
        value: 3,
        toolWeights: { selenium: 8, playwright: 10, testim: 7, mabl: 8 },
      },
      {
        text: 'Expert level; advanced programming and deep technical knowledge',
        value: 4,
        toolWeights: { selenium: 10, playwright: 8, testim: 5, mabl: 7 },
      },
    ],
  },
  {
    id: 5,
    category: 'Learning',
    text: 'What is your team\'s willingness to learn and adopt new automation tools?',
    options: [
      {
        text: 'Prefer minimal learning curve; plug-and-play solutions',
        value: 1,
        toolWeights: { selenium: 5, playwright: 5, testim: 10, mabl: 8 },
      },
      {
        text: 'Open to brief onboarding and initial training',
        value: 2,
        toolWeights: { selenium: 7, playwright: 7, testim: 8, mabl: 10 },
      },
      {
        text: 'Willing to invest time in comprehensive training programs',
        value: 3,
        toolWeights: { selenium: 8, playwright: 10, testim: 7, mabl: 8 },
      },
      {
        text: 'Comfortable with complex configurations and advanced tooling',
        value: 4,
        toolWeights: { selenium: 10, playwright: 8, testim: 5, mabl: 7 },
      },
    ],
  },
  {
    id: 6,
    category: 'Setup',
    text: 'What level of setup complexity can your team handle?',
    options: [
      {
        text: 'Complex manual configuration is acceptable',
        value: 1,
        toolWeights: { selenium: 10, playwright: 8, testim: 6, mabl: 7 },
      },
      {
        text: 'Moderate setup complexity with some guidance',
        value: 2,
        toolWeights: { selenium: 7, playwright: 10, testim: 8, mabl: 8 },
      },
      {
        text: 'Prefer straightforward installation with clear instructions',
        value: 3,
        toolWeights: { selenium: 8, playwright: 8, testim: 7, mabl: 7 },
      },
      {
        text: 'Require automatic configuration or cloud-based setup',
        value: 4,
        toolWeights: { selenium: 7, playwright: 8, testim: 8, mabl: 10 },
      },
    ],
  },
  {
    id: 7,
    category: 'Interface',
    text: 'How important is having an intuitive, user-friendly interface?',
    options: [
      {
        text: 'Not important; command-line interface (CLI) is preferred',
        value: 1,
        toolWeights: { selenium: 5, playwright: 7, testim: 5, mabl: 5 },
      },
      {
        text: 'Nice to have, but not a requirement',
        value: 2,
        toolWeights: { selenium: 7, playwright: 8, testim: 8, mabl: 8 },
      },
      {
        text: 'Important; prefer visual dashboards and graphical interfaces',
        value: 3,
        toolWeights: { selenium: 8, playwright: 8, testim: 10, mabl: 10 },
      },
      {
        text: 'Critical; need drag-and-drop or codeless interface capabilities',
        value: 4,
        toolWeights: { selenium: 7, playwright: 8, testim: 10, mabl: 10 },
      },
    ],
  },
  {
    id: 8,
    category: 'Resources',
    text: 'What level of documentation and community support do you require?',
    options: [
      {
        text: 'Minimal support needed; team is self-sufficient',
        value: 1,
        toolWeights: { selenium: 5, playwright: 5, testim: 10, mabl: 8 },
      },
      {
        text: 'Basic documentation and example code',
        value: 2,
        toolWeights: { selenium: 7, playwright: 7, testim: 8, mabl: 10 },
      },
      {
        text: 'Active open-source community with extensive resources',
        value: 3,
        toolWeights: { selenium: 10, playwright: 8, testim: 10, mabl: 10 },
      },
      {
        text: 'Comprehensive, up-to-date documentation and active community',
        value: 4,
        toolWeights: { selenium: 8, playwright: 10, testim: 8, mabl: 10 },
      },
    ],
  },
  {
    id: 9,
    category: 'Support',
    text: 'What level of technical support do you require?',
    options: [
      {
        text: 'No dedicated support needed; rely on community resources',
        value: 1,
        toolWeights: { selenium: 10, playwright: 7, testim: 5, mabl: 5 },
      },
      {
        text: 'Occasional support through community forums and discussions',
        value: 2,
        toolWeights: { selenium: 8, playwright: 10, testim: 8, mabl: 8 },
      },
      {
        text: 'Reliable vendor support available when issues arise',
        value: 3,
        toolWeights: { selenium: 7, playwright: 8, testim: 10, mabl: 10 },
      },
      {
        text: 'Enterprise-grade support with 24/7 availability and quick response',
        value: 4,
        toolWeights: { selenium: 7, playwright: 8, testim: 8, mabl: 10 },
      },
    ],
  },
  {
    id: 10,
    category: 'Performance',
    text: 'How important is test execution speed to your project?',
    options: [
      {
        text: 'Execution speed is not a priority',
        value: 1,
        toolWeights: { selenium: 5, playwright: 5, testim: 5, mabl: 5 },
      },
      {
        text: 'Occasionally important for specific test scenarios',
        value: 2,
        toolWeights: { selenium: 7, playwright: 8, testim: 8, mabl: 8 },
      },
      {
        text: 'Important; prefer tools that execute tests quickly',
        value: 3,
        toolWeights: { selenium: 8, playwright: 10, testim: 8, mabl: 10 },
      },
      {
        text: 'Critical; maximum speed and parallel execution are top priorities',
        value: 4,
        toolWeights: { selenium: 7, playwright: 10, testim: 8, mabl: 10 },
      },
    ],
  },
  {
    id: 11,
    category: 'Maintenance',
    text: 'How important are self-healing and automated maintenance features?',
    options: [
      {
        text: 'Not needed; manual test maintenance is acceptable',
        value: 1,
        toolWeights: { selenium: 10, playwright: 9, testim: 5, mabl: 5 },
      },
      {
        text: 'Occasionally helpful for reducing maintenance overhead',
        value: 2,
        toolWeights: { selenium: 7, playwright: 10, testim: 8, mabl: 8 },
      },
      {
        text: 'Frequently desired to minimize manual intervention',
        value: 3,
        toolWeights: { selenium: 5, playwright: 8, testim: 10, mabl: 10 },
      },
      {
        text: 'Essential requirement; must have automated maintenance capabilities',
        value: 4,
        toolWeights: { selenium: 4, playwright: 7, testim: 10, mabl: 10 },
      },
    ],
  },
  {
    id: 12,
    category: 'Scale',
    text: 'How important is the tool\'s ability to handle large-scale test execution?',
    options: [
      {
        text: 'Not required; working with small-scale projects',
        value: 1,
        toolWeights: { selenium: 5, playwright: 7, testim: 10, mabl: 8 },
      },
      {
        text: 'Some scaling capability needed for occasional larger test runs',
        value: 2,
        toolWeights: { selenium: 10, playwright: 8, testim: 8, mabl: 9 },
      },
      {
        text: 'Frequent parallel execution and large test suite runs',
        value: 3,
        toolWeights: { selenium: 8, playwright: 10, testim: 8, mabl: 10 },
      },
      {
        text: 'Enterprise-level scalability and flexibility required',
        value: 4,
        toolWeights: { selenium: 8, playwright: 10, testim: 7, mabl: 7},
      },
    ],
  },
];
