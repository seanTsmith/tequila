/**
 * tequila
 * tequila-spec
 */

test.start();
test.heading('CLASS LIBRARY', function () {
  test.runnerTequila();
  test.runnerModel(Model,false);
  test.runnerAttribute();
});
test.heading('MODELS', function () {
  test.runnerUserModel();
});
test.heading('INTEGRATION TESTS', function () {
});
test.stop();
