/**
 * tequila
 * node-test-tail
 */
test.runner(false);
process.on('exit', function () {
  process.exit(test.countFail ? 1 : 0);
});