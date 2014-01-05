/**
 * tequila
 * json-file-test
 */

test.runnerJSONFileStore = function () {
  test.heading('JSONFileStore', function () {
    test.paragraph('The JSONFileStore handles data storage in simple JSON files.' +
      ' It should NOT be used in concurrency read / write situations.' +
      ' It is mainly for static read situations.  It can be written to for authoring or testing' +
      ' purposes as long as limitations of files vs a database are understood.');
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
