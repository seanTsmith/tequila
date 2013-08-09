/**
 * tequila
 * tequila-spec
 */
test.start();
test.heading('Classes', function () {
  test.paragraph('These objects are make up the core "classes" and are extended via javascript prototype inheritance.');
  test.runnerTequila();
  test.runnerAttribute();
  test.runnerList(List,false);
  test.runnerMessage();
  test.runnerModel(Model,false);
  test.runnerStoreModel();
  test.runnerTransport();
});
test.heading('Models', function () {
  test.paragraph('These core models are used by the library.');
  test.runnerUserModel();
});
test.heading('Stores', function () {
  test.paragraph('The core stores implemented in the library.');
  test.runnerMemoryStoreModel();
  test.runnerMongoStoreModel();
  test.runnerRemoteStoreModel();
});
test.heading('SYSTEM INTEGRATION', function () {
  test.paragraph('The system functionality and requirements for the library as a whole is contained in this section.');
  test.runnerStoreIntegration();
});
test.stop();
