/**
 * tequila
 * test-remoteStore-integration
 */
test.runnerRemoteStoreIntegration = function () {
  test.heading('RemoteStore Integration', function () {
    test.paragraph('This test establishes a RemoteStore and runs Store tests against it.');
    test.example('do it to it', undefined, function () {
      this.store = new RemoteStore();
      this.store.onConnect('',storeConnected,this);
      function storeConnected(store, err, self) {
        if (err) throw err;
        throw new Error("TODO");
      }
    });
  });
};
