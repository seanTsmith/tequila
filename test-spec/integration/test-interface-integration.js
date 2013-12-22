/**
 * tequila
 * test-interface-integration
 */
test.runnerInterfaceIntegration = function () {
  test.heading('Interface Integration', function () {
    test.example('Test command execution mocking', test.asyncResponse(true), function (testNode, returnResponse) {
      // Send 4 mocks and make sure we get 4 callback calls
      var self = this;
      self.callbackCount = 0;
      testInterface = new Interface();
      testInterface.start(new Application(), new Presentation(), function (request) {
        if (request.name == 'mock count')
          self.callbackCount++;
        if (self.callbackCount > 3)
          returnResponse(testNode, true);
      });
      var cmds = [];
      var i;
      for (i = 0; i < 4; i++) {
        cmds.push(new Command({name: 'mock count'}));
      }
      testInterface.mockRequest(cmds);
    });
  });
};