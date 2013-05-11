/**
 * tequila
 * remote-store-test
 */
test.runnerRemoteStoreModel = function () {
  test.heading('RemoteStore', function () {
    test.paragraph('The RemoteStore is a store that is maintained by a remote host.');
    test.heading('CONSTRUCTOR', function () {
      test.example('objects created should be an instance of RemoteStore', true, function () {
        return new RemoteStore() instanceof RemoteStore;
      });
      test.runnerStoreConstructor(RemoteStore);
    });
    test.runnerStoreMethods(RemoteStore);
  });
};
