/**
 * tequila
 * node-test-tail
 */
test.runner(false);
process.on('exit', function () {
  process.exit(test.countFail || test.criticalFail ? 1 : 0);
});