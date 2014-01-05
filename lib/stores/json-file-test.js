/**
 * tequila
 * json-file-test
 */

test.runnerJSONFileStore = function () {
  test.heading('JSONFileStore', function () {
    test.paragraph('The JSONFileStore handles data storage in simple JSON files.');
    test.heading('CONSTRUCTOR', function () {
      test.heading('Store Constructor tests are applied', function () {
        test.runnerStoreConstructor(JSONFileStore,true);
      });
      test.example('objects created should be an instance of JSONFileStore', true, function () {
        return new JSONFileStore() instanceof JSONFileStore;
      });
    });
    test.heading('Store tests are applied', function () {
      test.runnerStoreMethods(JSONFileStore,true);
    });
  });
};
