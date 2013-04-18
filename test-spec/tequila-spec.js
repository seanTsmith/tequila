/**
 * tequila
 * tequila-spec
 */
test.start();
test.heading('CLASS LIBRARY', function () {
  test.paragraph('The class library is a set of base class definitions that are extended into subclasses then' +
    ' can be instantiated for usage.  The inheritance is via javascript prototypical inheritance in conjunction' +
    ' with a helper function to extend the prototype of objects.');
  test.runnerTequila();
  test.runnerAttribute();
  test.runnerModel(Model,false);
  test.runnerCollection(Collection,false);
});
test.heading('CORE MODELS', function () {
  test.paragraph('These are models that are defined as part of the tequila core and are used in this library.');
  test.runnerUserModel();
  test.runnerStoreModel(Store),false;
  test.runnerMemoryStoreModel();
});
test.heading('SYSTEM INTEGRATION', function () {
  test.paragraph('This area contains system integration test and further documents the usage of this library.');
});
test.stop();
