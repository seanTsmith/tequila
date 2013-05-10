/**
 * tequila
 * tequila-spec
 */
test.start();
test.heading('CORE CLASSES', function () {
  test.paragraph('The core classes provide a abstract interface that are subclassed via prototypical inheritance.');
  test.runnerTequila();
  test.runnerMessage();
  //test.runnerTransport();
  test.runnerAttribute();
  test.runnerModel(Model,false);
  test.runnerList(List,false);
});
test.heading('CORE MODELS', function () {
  test.paragraph('The core models inherit from the core classes and provide the framework structure.');
  test.runnerUserModel();
  test.runnerStoreModel();
  test.runnerMemoryStoreModel();
  test.runnerRemoteStoreModel();
});
test.heading('SYSTEM INTEGRATION', function () {
  test.paragraph('The system functionality and requirements for the library as a whole is contained in this section.');
  test.runnerStoreIntegration();
  test.runnerRemoteStoreIntegration();
});
test.stop();
