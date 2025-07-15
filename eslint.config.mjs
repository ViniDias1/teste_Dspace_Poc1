import hiporepo from 'eslint-config-hiporepo';

export default [
  ...hiporepo,
  {
    ignores: ['**/*.spec.ts', '**/*.test.ts', 'test/', '__tests__/',
      '.vscode', 'node_modules', 'public', 'generated', 'dist/'
    ],
  }
];

