/**
 * tequila
 * mongo-test
 */

test.runnerMongoStore = function () {
  test.heading('MongoStore', function () {
    test.paragraph('The MongoStore is a simple volatile store.');
    test.heading('CONSTRUCTOR', function () {
      test.example('objects created should be an instance of MongoStore', true, function () {
        return new MongoStore() instanceof MongoStore;
      });
      test.runnerStoreConstructor(MongoStore);
    });
    test.runnerStoreMethods(MongoStore);
  });
};
