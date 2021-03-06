
'use strict';

const assert = require('assert');
const eslint = require('eslint');
const fs = require('fs');

// This depends on presence of .eslintrc.json point to this repo

// Helper function to examine report output
function assertReportContains(report, msg) {
  let message = report.results[0].messages.reduce((a, m) => {
    return (m.ruleId === msg) ? m : a;
  }, null);
  assert.notEqual(null, message, 'Report did not contain ' + msg);
}

// Fluent interface
function expectReport(report) {
  return {
    contains: (msg) => {
      assertReportContains(report, msg);
    }
  };
}

/**
 * Put files in the good folder that should pass with no errors
 */
describe('Good Lint', () => {
  it('should find nothing wrong with good files.', () => {
    fs.realpath('./test/good', (err, path) => {
      var files = fs.readdirSync(path).map((name) => { return `${path}/${name}`; });
      const report = new eslint.CLIEngine().executeOnFiles(files);
      assert.equal(report.errorCount, 0);
      assert.equal(report.warningCount, 0);
      files.forEach((file, index) => {
        assert(report.results[index].filePath.endsWith(file));
      });
    });
  });
});

/**
 * Rather than test all the rules (which is only testing ESLint), put code
 * snippets here that we want to flag with some rule and make sure the rule
 * fires.
 */
describe('Bad Lint', () => {
  it('should find camelcase errors', () => {
    const report = new eslint.CLIEngine().executeOnText('var my_favorite_color = \'#112C85\';');
    expectReport(report).contains('camelcase');
  });

  it('should complain about tab characters', () => {
    const report = new eslint.CLIEngine().executeOnText('if (this) {\n\tthat();\n};');
    expectReport(report).contains('no-tabs');
  });

  it('should notice extra spaces', () => {
    const report = new eslint.CLIEngine().executeOnText('var a = 4  + 3;');
    expectReport(report).contains('no-multi-spaces');
  });

  it('should flag long lines', () => {
    const report = new eslint.CLIEngine().executeOnText(
      'function functionWithNamesBeginningWithLongStringsOfCharacters(kajhskdhasdjahskjdhas, aosjdhkjahsdkjhasdsad, ' +
      'asjdhkjsahdkjaksjdh) {\n    return 2;\n}\n');
    expectReport(report).contains('max-len');
  });

  it('should require quotes around keywords in object property names', () => {
    const report = new eslint.CLIEngine().executeOnText(
      'var obj = { function: \'no\' }');
    expectReport(report).contains('quote-props');
  });

  it('should require curly braces always', () => {
    const report = new eslint.CLIEngine().executeOnText(
      'if (foo) foo++;');
    expectReport(report).contains('curly');
  });

  it('should flag useless escape characters', () => {
    const report = new eslint.CLIEngine().executeOnText(
      'var foo = \'This \\: is useless escape\';');
    expectReport(report).contains('no-useless-escape');
  });
});
