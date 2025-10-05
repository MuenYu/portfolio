const { builtinRules } = require('eslint/use-at-your-own-risk');

const baseNoUnusedVars = builtinRules.get('no-unused-vars');

module.exports = {
  meta: {
    name: '@typescript-eslint/eslint-plugin',
    version: '0.0.0-local',
  },
  configs: {
    recommended: {
      plugins: ['@typescript-eslint'],
      rules: {},
    },
  },
  rules: {
    'no-unused-vars': baseNoUnusedVars,
  },
};
