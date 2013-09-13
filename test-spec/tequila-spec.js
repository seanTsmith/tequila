/**
 * tequila
 * tequila-spec
 */
test.start();
test.heading('Library', function () {
  test.runnerTequila();
});
test.heading('Classes', function () {
  test.paragraph('These objects make up the core "classes" and are extended via javascript prototype inheritance.');
  test.runnerAttribute();
  test.runnerCommand();
  test.runnerDelta();
  test.runnerInterface();
  test.runnerList(List,false);
  test.runnerMessage();
  test.runnerModel(Model,false);
  test.runnerProcedure();
  test.runnerStore();
  test.runnerTransport();
});
test.heading('Interfaces', function () {
  test.paragraph('These core interfaces are included in the library.');
  test.runnerMockInterface();
  test.runnerBootstrap3Interface();
  test.runnerCommandLineInterface();
});
test.heading('Models', function () {
  test.paragraph('These core models are included in the library.');
  test.runnerApplicationModel();
  test.runnerLogModel();
  test.runnerPresentation();
  test.runnerUserModel();
  test.runnerWorkspace();
});
test.heading('Stores', function () {
  test.paragraph('These core stores are included in the library.');
  test.runnerMemoryStore();
  test.runnerMongoStore();
  test.runnerRemoteStore();
  test.runnerLocalStore();
  test.runnerRedisStore();
});
test.heading('Integration Tests', function () {
  test.paragraph('These set of tests run through a series of operations with multiple assertions inside each example.  ' +
    'If any assertion fails the test is failed.');
  test.runnerListIntegration();
  test.runnerStoreIntegration();
  test.runnerProcedureIntegration();
  test.runnerCommandIntegration();
});
test.stop();
