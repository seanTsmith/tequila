/**
 * tequila
 * local-test
 */
test.runnerLocalStore = function () {
  test.heading('Local Store', function () {
    test.paragraph('The LocalStore is a simple volatile store.');
    test.heading('CONSTRUCTOR', function () {
      test.example('objects created should be an instance of LocalStore', true, function () {
        return new LocalStore() instanceof LocalStore;
      });
      test.runnerStoreConstructor(LocalStore);
    });
    test.runnerStoreMethods(LocalStore);
  });
};
