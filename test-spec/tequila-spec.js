/**
 * tequila
 * tequila-spec
 */
test.start();
test.heading('Classes', function () {
  test.paragraph('These objects are make up the core "classes" and are extended via javascript prototype inheritance.');
  test.runnerAttribute();
  test.runnerCommand();
  test.runnerDelta();
  test.runnerInterface();
  test.runnerList(List,false);
  test.runnerMessage();
  test.runnerModel(Model,false);
  test.runnerProcedure();
  test.runnerStoreModel();
  test.runnerTequila();
  test.runnerTransport();
  test.runnerWorkspace();
});
test.heading('Models', function () {
  test.paragraph('These core models are used by the library. suck it');
  test.runnerApplicationModel();
  test.runnerLogModel();
  test.runnerPresentation();
  test.runnerUserModel();
});
test.heading('Stores', function () {
  test.paragraph('The core stores implemented in the library.');
  test.runnerMemoryStoreModel();
  test.runnerMongoStoreModel();
  test.runnerRemoteStoreModel();
});
test.heading('Integration Tests', function () {
  test.paragraph('These set of tests run through a series of operations with multiple assertions inside each example.  ' +
    'If any assertion fails the test is failed.');
  test.runnerListIntegration();
  test.runnerStoreIntegration();
});
test.stop();
