/**
 * tequila
 * redis-test
 */
test.runnerRedisStore = function () {
  test.heading('Redis Store', function () {
    test.paragraph('The RedisStore is a simple volatile store.');
    test.heading('CONSTRUCTOR', function () {
      test.example('objects created should be an instance of RedisStore', true, function () {
        return new RedisStore() instanceof RedisStore;
      });
      test.runnerStoreConstructor(RedisStore);
    });
    test.runnerStoreMethods(RedisStore);
  });
};
