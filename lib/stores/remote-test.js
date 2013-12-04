/**
 * tequila
 * remote-test
 */
test.runnerRemoteStore = function () {
  test.heading('RemoteStore', function () {
    test.paragraph('The RemoteStore is a store that is maintained by a remote host.');
    test.heading('CONSTRUCTOR', function () {
      test.heading('Store Constructor tests are applied', function () {
        test.runnerStoreConstructor(RemoteStore,true);
      });
      test.example('objects created should be an instance of RemoteStore', true, function () {
        return new RemoteStore() instanceof RemoteStore;
      });
    });
    test.heading('Store tests are applied', function () {
      test.runnerStoreMethods(RemoteStore,true);
    });
  });
};
