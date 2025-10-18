const { analyze } = require('@typescript-eslint/scope-manager');
const { visitorKeys } = require('@typescript-eslint/visitor-keys');
const { parseAndGenerateServices } = require('@typescript-eslint/typescript-estree');

function applyDefaultOptions(options = {}) {
  const {
    jsx = true,
    loc = true,
    range = true,
    tokens = true,
    comment = true,
    ecmaVersion = 'latest',
    sourceType = 'module',
    errorOnUnknownASTType = false,
    errorOnTypeScriptSyntacticAndSemanticIssues = false,
    ...rest
  } = options;

  return {
    jsx,
    loc,
    range,
    tokens,
    comment,
    ecmaVersion,
    sourceType,
    errorOnUnknownASTType,
    errorOnTypeScriptSyntacticAndSemanticIssues,
    ...rest,
  };
}

function parseForESLint(code, options) {
  const parserOptions = applyDefaultOptions(options);
  const result = parseAndGenerateServices(code, parserOptions);
  const scopeManager = analyze(result.ast, parserOptions);

  return {
    ast: result.ast,
    services: result.services,
    scopeManager,
    visitorKeys,
  };
}

module.exports = {
  meta: {
    name: 'local-typescript-estree-parser',
    version: '0.0.0',
  },
  parse(code, options) {
    return parseForESLint(code, options).ast;
  },
  parseForESLint,
};
