/**
 * tequila
 * redis-test
 */
test.runnerRedisStore = function () {
  test.heading('Redis Store', function () {
    test.paragraph('The RedisStore is a store using Redis.');
    test.heading('CONSTRUCTOR', function () {
      test.heading('Store Constructor tests are applied', function () {
        test.runnerStoreConstructor(RedisStore,true);
      });
      test.example('objects created should be an instance of RedisStore', true, function () {
        return new RedisStore() instanceof RedisStore;
      });
    });
    test.heading('Store tests are applied', function () {
      test.runnerStoreMethods(RedisStore,true);
      test.xexample('placeholder....', undefined, function () {
      });

    });
  });
};
