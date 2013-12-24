/**
 * tequila
 * test-application-integration
 */
test.runnerApplicationIntegration = function () {
  test.heading('Application Integration', function () {
    test.example('little app with command execution mocking', test.asyncResponse(true), function (testNode, returnResponse) {

      // Send 4 mocks and make sure we get 4 callback calls
      var self = this;
      self.callbackCount = 0;

      var app = new Application();
      var testInterface = new Interface();

      app.setInterface(testInterface);
      app.start(function (request) {
        if (request.type == 'mock count')
          self.callbackCount++;
        if (self.callbackCount > 3)
          returnResponse(testNode, true);
      });
      var cmds = [];
      var i;
      for (i = 0; i < 4; i++) {
        cmds.push(new Request('mock count'));
      }
      testInterface.mockRequest(cmds);
    });
  });
};
