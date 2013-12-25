/**
 * tequila
 * test-request-dispatch-integration
 */
test.runnerRequestDispatchIntegration = function () {
  test.heading('Request Dispatch Integration', function () {
    test.paragraph('Requests are first handled by the interface and may be passed to the application' +
      ' if the interface does not handle the request it is passed to the app.start() callback.');
    test.example('do it', test.asyncResponse('abc123!'), function (testNode, returnResponse) {

      // Test strings to modify
      var iString = 'iString';
      var aString = 'aString';
      var period = '.';

      // Create 3 commands that alter test strings
      var iCommand = new Command({
        name: 'iCommand',
        type: 'Function',
        contents: function (stuff) {
          iString = stuff;
        }
      });
      var aCommand = new Command({
        name: 'aCommand',
        type: 'Function',
        contents: function (stuff) {
          aString = stuff;
        }
      });
      var pCommand = new Command({
        name: 'pCommand',
        type: 'Function',
        contents: function (stuff) {
          aString = stuff;
        }
      });

      // Now make out test app
      var app = new Application();
      var mock = new MockInterface();
      var menu = new Presentation();
      app.setInterface(mock);
      app.setPresentation(menu);
      app.start(function (request) {
        console.log(JSON.stringify(request));
      });


      setTimeout(function () {
        mock.mockRequest(new Request({type: 'Command', command: pCommand}));
        mock.mockRequest(new Request({type: 'Command', command: aCommand}));
        mock.mockRequest(new Request({type: 'Command', command: iCommand}));
      }, 50); // Shitty way to get results but it's just a test

//      iCommand.execute("abc");
//      aCommand.execute("123");

      setTimeout(function () {
        returnResponse(testNode, iString + aString + period);
      }, 250); // Shitty way to get results but it's just a test


    });
  });
};
