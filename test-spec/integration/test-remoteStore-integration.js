/**
 * tequila
 * test-remoteStore-integration
 */
test.runnerRemoteStoreIntegration = function () {
  test.heading('RemoteStore Integration', function () {
    test.paragraph('This test establishes a RemoteStore and runs Store tests against it.');
    test.xexample('Connect to RemoteStore and apply all Store tests.', test.asyncResponse(true), function (testNode, returnResponse) {
      var self = this;
      self.store = new RemoteStore();
      self.store.onConnect('',storeConnected);
      function storeConnected(store, err) {
        if (err) returnResponse(testNode, err);
        returnResponse(testNode, store);
      }
    });
  });
};
