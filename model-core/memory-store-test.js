/**
 * tequila
 * memory-store-test
 */
test.runnerMemoryStoreModel = function () {
  test.heading('MemoryStore', function () {
    test.paragraph('The MemoryStore...');
    test.example('objects created should be an instance of MemoryStore', true, function () {
      return new MemoryStore() instanceof MemoryStore;
    });
    test.runnerStoreModel(MemoryStore);
  });
};
