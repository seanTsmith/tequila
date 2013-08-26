/**
 * tequila
 * memory-test
 */
test.runnerMemoryStoreModel = function () {
  test.heading('MemoryStore', function () {
    test.paragraph('The MemoryStore is a simple volatile store.');
    test.heading('CONSTRUCTOR', function () {
      test.example('objects created should be an instance of MemoryStore', true, function () {
        return new MemoryStore() instanceof MemoryStore;
      });
      test.runnerStoreConstructor(MemoryStore);
    });
    test.runnerStoreMethods(MemoryStore);
  });
};
