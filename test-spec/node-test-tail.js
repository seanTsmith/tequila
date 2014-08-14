/**
 * tequila
 * node-test-tail
 */
test.runner(false);
/* istanbul ignore next */
process.on('exit', function () {
  process.exit(test.countFail || test.criticalFail ? 1 : 0);
});