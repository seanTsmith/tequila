/**
 * tequila
 * mongo-test
 */

test.runnerMongoStore = function () {
  test.heading('MongoStore', function () {
    test.paragraph('The MongoStore handles data storage via MongoDB.');
    test.heading('CONSTRUCTOR', function () {
      test.heading('Store Constructor tests are applied', function () {
        test.runnerStoreConstructor(MongoStore,true);
      });
      test.example('objects created should be an instance of MongoStore', true, function () {
        return new MongoStore() instanceof MongoStore;
      });
    });
    test.heading('Store tests are applied', function () {
      test.runnerStoreMethods(MongoStore,true);
    });
  });
};
