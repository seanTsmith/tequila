/**
 * tequila
 * remote-store-test
 */
test.runnerRemoteStoreModel = function () {
  test.heading('RemoteStore', function () {
    test.paragraph('The RemoteStore is a simple volatile store.');
    test.heading('CONSTRUCTOR', function () {
      test.example('objects created should be an instance of RemoteStore', true, function () {
        return new RemoteStore() instanceof RemoteStore;
      });
      test.runnerStoreConstructor(RemoteStore);
    });
    test.heading('METHODS', function () {
      test.runnerStoreMethods(RemoteStore);
    });
  });
};
