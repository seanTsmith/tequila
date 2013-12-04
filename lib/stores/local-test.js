/**
 * tequila
 * local-test
 */
test.runnerLocalStore = function () {
  test.heading('Local Store', function () {
    test.paragraph('The LocalStore abstracts local client storage.');
    test.heading('CONSTRUCTOR', function () {
      test.heading('Store Constructor tests are applied', function () {
        test.runnerStoreConstructor(LocalStore,true);
      });
      test.example('objects created should be an instance of LocalStore', true, function () {
        return new LocalStore() instanceof LocalStore;
      });
    });
    test.heading('Store tests are applied', function () {
      test.runnerStoreMethods(LocalStore,true);
    });
  });
};
