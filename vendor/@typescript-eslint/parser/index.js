const estree = require('@typescript-eslint/typescript-estree');

function withDefaults(options = {}) {
  return {
    jsx: true,
    loc: true,
    range: true,
    tokens: true,
    comment: true,
    errorOnUnknownASTType: false,
    errorOnTypeScriptSyntacticAndSemanticIssues: false,
    ...options,
  };
}

function parse(code, options) {
  return estree.parse(code, withDefaults(options));
}

function parseForESLint(code, options) {
  const result = estree.parseAndGenerateServices(code, withDefaults(options));
  return {
    ast: result.ast,
    services: result.services ?? {},
  };
}

module.exports = {
  meta: {
    name: '@typescript-eslint/parser',
    version: '0.0.0-local',
  },
  parse,
  parseForESLint,
};
